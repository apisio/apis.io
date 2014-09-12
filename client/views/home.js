Template.home.rendered = function () {
  // hide content depends on nb of APIs.
  if(Session.get('nb_results')>0){
    $("#homePageContent").slideUp();
  }

  // bug when going from validator page
  if($(".linedwrap"))
    $(".linedwrap").remove()
};

Template.home.events({
    'keyup [name="search"]':function(e,context){
     var search_val = $("#search_input").val();
      if(search_val==""){
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
        
        var keenEvent = {"keywords": Session.get("search_keywords")};
        Meteor.call('sendKeenEvent','searchCollection',keenEvent);
        // console.log("ChhhL",c,keenEvent);
      }
    },
    'click .api_tag':function(e,context){
      Session.set("search_keywords","");
      $("#search_input").val("tag:"+this.name);
      $("#search_submit").click();
    },
    'click .suggested':function(e,context){
      Session.set("search_keywords","");
      $("#search_input").val($(e.target).data("keyword"));
      $("#search_submit").click();
    }
});

Template.searchForm.rendered = function () {
  if(Session.get("search_param")){
    // $("#search_input").val(Session.get("search_param"));
    // $("#search_submit").click();
  }
};

Template.apisList.events({
  'click a': function (e) {
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
});

Template.apisList.helpers({
  apis: function () {
    console.log("KEYWORD",Session.get("search_keywords"));
    if(Session.get("search_keywords")){
      keywords = new RegExp(Session.get("search_keywords"), "i");
      var result = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},{sort: {updatedAt: 1}});
      var res = result.fetch();

      //Sort by number of fields matched in search
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
      return result;
    }else if(Session.get("search_tags")){
      keywords = new RegExp(Session.get("search_tags"), "i");
      result = APIs.find({tags:keywords}, {sort: {updatedAt: 1}});
      Session.set('nb_results',result.count())

      if(result.count()>0)
        $("#homePageContent").slideUp();

      if(result.count()===0){
        $("#homePageContent").slideDown();
        FlashMessages.sendError("No API was found :(");
      }
      return result;
    }
    if(Session.equals("search_keywords", "") || Session.equals("search_tags", "value"))
      return null

    console.log("NO RETURN");
    return [];
    // return null;
    
  },
});

// find regExp in Array
containsRegExp = function (collection, regex) {
    return _.filter(collection, function(obj){ return obj.match(regex);});
};