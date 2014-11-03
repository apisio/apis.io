Template.home.rendered = function () {
  // hide content depends on nb of APIs.
  if(Session.get('nb_results')>0){
    $("#homePageContent").slideUp();
  }

  // bug when going from validator page
  if($(".linedwrap"))
    $(".linedwrap").remove()

  //init paging values
  Session.set('paging_skip', 0);
  Session.set('paging_limit', 5);
};

Template.home.events({
    'keyup [name="search"]':function(e,context){
      var search_val = $("#search_input").val();
      if(e.keyCode != 13){ //when start typing and not 'return' key
        Session.set("apisResult", []);
        $("#homePageContent").slideDown();
      }

      if(search_val == ""){
        $("#homePageContent").slideDown();
        Session.set("search_keywords",""); // erase previous keywords search results
        Session.set("search_tags","");
      }
    },
    'click #search_submit, form submit':function(e,context) {
      e.preventDefault();
      var search_val = $("#search_input").val();

      //add search param to browser url
      var stateObj = { search: search_val };
      history.pushState(stateObj, "", "?search="+search_val);

      var reg = new RegExp(/(tag)(:)( )*((?:[a-z][a-z0-9_]*))/i);

      // Specific Operands
      if(search_val.match(reg)) {
        var arr = search_val.split(":");
        switch(arr[0]){
          case 'tag':
            Session.set("search_tags", arr[1].trim());
            var keenEvent = {"keywords_tags": Session.get("search_tags")};
            Meteor.call('sendKeenEvent','searchCollection',keenEvent);
            searchAPI()
            break;
          default:
            FlashMessages.sendError("Search format is incorrect");
            break;
        }
      }else{ //normal search
        if(search_val=="*")
          Session.set("search_keywords"," ");
        else
          Session.set("search_keywords", search_val.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")); //taken from atmosphere repo
        
        searchAPI()
        var keenEvent = {"keywords": Session.get("search_keywords")};
        Meteor.call('sendKeenEvent','searchCollection',keenEvent);
        // console.log("ChhhL",c,keenEvent);
      }
    },
    'click .api_tag':function(e,context){
      Session.set("search_keywords","");
      Session.set('apisResult', []);
      $("#search_input").val("tag:"+this.name);
      $("#search_submit").click();
    },
    'click .suggested':function(e,context){
      Session.set("search_keywords","");
      Session.set('apisResult', []);
      $("#search_input").val($(e.target).data("keyword"));
      $("#search_submit").click();
    }
});

Template.searchForm.rendered = function () {
  if(!_.isUndefined(Session.get("search_keywords")) || !_.isUndefined(Session.get("search_tags"))) { //load results if search param in URL
    searchAPI()
  }
};

Template.apisList.events({
  'click a': function (e) {
    if(e.currentTarget.id != "displayMore"){ //dont track on display more
      var self = this;
      var keenEvent;
      if(Object.keys(self).length==0){
        keenEvent = {type: "tag",value: self.name};
      }else if(_.contains(Object.keys(self),'description')){ // it's an API object
        keenEvent = {type: "outbound",value: self.name, url: self.humanURL};
      }else if(_.contains(Object.keys(self),'url') && _.contains(Object.keys(self),'type')){ //extra links
        keenEvent = {type: "outbound",value: self.type, url: self.url};
      }
      Meteor.call('trackOutbound',keenEvent);
    }
  },
  'click #displayMore':function(e){
    e.preventDefault();
    //Change paging settings and reload results
    var limit = parseInt(Session.get('paging_limit'),10) || 5;
    var skip = parseInt(Session.get('paging_skip'),10) + limit

    Session.set('paging_skip',skip)
    searchAPI();
  }
});

Template.apisList.helpers({
  apis: function () {
    var result = Session.get('apisResult')
    return result
  },
});

// find regExp in Array
containsRegExp = function (collection, regex) {
    return _.filter(collection, function(obj){ return obj.match(regex);});
};

// Function called to search in API database
searchAPI = function () {
  if(Session.get("search_keywords")){
      keywords = new RegExp(Session.get("search_keywords"), "i");

      var apisResult = []
      if(!_.isEmpty(Session.get('apisResult')))
        apisResult = Session.get('apisResult')

      var result = APIs.find(
        {$or:[{name:keywords},{description:keywords},{tags:keywords}]},
        {
          sort: {updatedAt: 1},
          limit: Session.get('paging_limit') || 5,
          skip: Session.get('paging_skip') || 0
        });

      var totalResult = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]}).count();

      Session.set('paging_total', totalResult);
      
      //Sort by number of fields matched in search
      var res = result.fetch();
      _.each(res,function (r) {
        var relevance =0;
        if(!_.isUndefined(r.name))
          r.relevance += !_.isNull(r.name.match(keywords))

        if(!_.isUndefined(r.description))
          r.relevance += !_.isNull(r.description.match(keywords))

        if(!_.isUndefined(r.tags)){
          if(_.isArray(r.tags)){ //since 0.14
            r.relevance += !_.isEmpty(containsRegExp(r.tags,keywords)); //custom fct to search regexp in Array
          }else{
            r.relevance += !_.isNull(r.tags.match(keywords))
          }
        }

        r.relevance = relevance
      });

      if(keywords!="/ /i"){ //relevance not usefull when take all
        result = _.sortBy(res,function(r){
          return [r.relevance,r.name].join('_');
        }).reverse();
      }else{
        result = res;
      }
      
      // @FIXME SORT BY RELEVANCE
      
      console.log("NB results",result.length);
      Session.set('nb_results',result.length)

      if(result.length>0){
        $("#homePageContent").slideUp();
      }

      if(result.length===0){
        $("#homePageContent").slideDown();
        FlashMessages.sendError("No API was found :(");
      }
      apisResult = apisResult.concat(result)
      console.log("APIsresult",apisResult);
      Session.set('apisResult',apisResult);
    }else if(Session.get("search_tags")){ // if search are for tags
      console.log("TAG SEARCH", Session.get('search_tags'))
      var apisResult = []
      if(!_.isEmpty(Session.get('apisResult')))
        apisResult = Session.get('apisResult')

      keywords = new RegExp(Session.get("search_tags"), "i");
      result = APIs.find({tags:keywords}, {
          sort: {updatedAt: 1},
          limit: Session.get('paging_limit') || 5,
          skip: Session.get('paging_skip') || 0
        }).fetch();
      Session.set('nb_results',result.length)

      if(result.length>0)
        $("#homePageContent").slideUp();

      if(result.length===0){
        $("#homePageContent").slideDown();
        FlashMessages.sendError("No API was found :(");
      }
      apisResult = apisResult.concat(result)
      console.log("APIsresult",apisResult);
      Session.set('apisResult',apisResult);
      return apisResult;
    }
    if(Session.equals("search_keywords", "") || Session.equals("search_tags", "value"))
      Session.set('apisResult',null)
}