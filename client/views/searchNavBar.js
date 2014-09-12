Template.searchNavBar.rendered = function () {
	Meteor.typeahead.inject();
};

Template.searchNavBar.apisResults = function(){
	return [
			{
				name: 'APIs',
				valueKey: 'name',
				local: function(){
					return APIs.find().fetch();
				},
				header: '<h3 class="league-name">APIs</h3>',
				template: 'resultAPITypeheadTpl'
			},
			{
				name: 'Maintainers',
				valueKey: 'name',
				local: function(){
					return Maintainers.find().fetch();
				},
				header: '<h3 class="league-name">Maintainers</h3>',
				template: 'resultMaintainerTypeheadTpl'
			},
		];

}

Template.navbar.events({
	'keyup [name="search"]':function(e,context){
     var search_val = $("#top_search").val();
     $("#search_input").val(search_val);
      if(search_val==""){
        $("#homePageContent").slideDown();
        Session.set("search_keywords",""); // erase previous keywords search results
        Session.set("search_tags","");
      }
    },
    'click #top_searchBtn, form submit':function(e,context) {
      e.preventDefault();
      var search_val = $("#top_search").val();

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
      }
      $(document).scrollTop(0);
    }
});