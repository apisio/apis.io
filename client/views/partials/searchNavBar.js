Template.searchNavBar.rendered = function () {
	Meteor.typeahead.inject();
};

Template.navbar.events({
    'click #top_searchBtn, form submit':function(e,context) {
		e.preventDefault();
		var search_val = $("#top_search").val();
		Session.set('apisResult', []);
		Session.set('search_keywords','');
		Session.set('search_tags','')

		Router.go('home',{},{query: 'search='+search_val});
		$(document).scrollTop(0);
    }
});
