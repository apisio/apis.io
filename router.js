Router.configure({
  notFoundTemplate: "notFound",
  layoutTemplate: 'defaultLayout',
  loadingTemplate: "loadingTpl",
});

if(Meteor.isClient){
  Router.onBeforeAction('loading');
}
Router.map(function () {
  this.route('home', {
    path: '/',
    template: 'home',
    waitOn: function(){
      // if(this.params.search)
        // return [Meteor.subscribe('apisFiles'),Meteor.subscribe('apis'),Meteor.subscribe('maintainers')];
        return [Meteor.subscribe('apisCount'),Meteor.subscribe('maintainersCount')]
    },
    onBeforeAction: function(){
      Session.set('active', 'home');

      var search_val = this.params.query.search;

      // If search parameter specified
      if(search_val){
        // Search is string or 'tag:keyword' or '*'
        var reg = new RegExp(/(tag)(:)( )*((?:[a-z0-9]*))/i);
        if(search_val.match(reg)) {
          var arr = search_val.split(":");
          switch(arr[0]){
            case 'tag':
              Session.set("search_tags", arr[1].trim());
              break;
            default:
              FlashMessages.sendError("Search format is incorrect");
              break;
          }
        }else{ //normal search
          if(search_val=="*")
            Session.set("search_keywords"," ");
          else
            Session.set("search_keywords", search_val)//.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\$&")); //taken from atmosphere repo
        }
      }

      Meteor.call("sendKeenEvent","pathCollection",{path:'/'});
      GAnalytics.pageview();
      this.next()
    }
  });

  this.route('dashboard', {
    path: '/dashboard',
    template: 'dashboard',
    onBeforeAction: function(){
      if(_.isUndefined(this.params.pass) || this.params.pass != 'apisrocks'){
        this.redirect('/');
      }
    }
  });

  this.route('lint',{
    path: '/lint',
    template: 'APIlint',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'lint');
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('builder',{
    path: '/builder',
    template: 'APIbuilder',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'builder');
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('about',{
    path: '/about',
    template: 'aboutPage',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'about');
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('apiSearchAPIIndex',{
    path: '/apiDoc',
    template: 'apiSearchAPIIndex',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'apiSearchAPIIndex');
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('FAQ',{
    path: '/faq',
    template: 'FAQ',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'FAQ');
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('opensource',{
    path: '/opensource',
    template: 'openSourcePage',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'opensource');
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  //FIXME change API to APIFile
  this.route('addAPI', {
    path: '/apis/add',
    template: 'addAPI',
    waitOn: function(){
      return [Meteor.subscribe('apisFiles'),Meteor.subscribe('apis')];
    },
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'addAPI');
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  });

  this.route('showAPI', {
    path: '/apis/:slug',
    template: 'apiShow',
    waitOn: function(){
      return [Meteor.subscribe('api',this.params.slug),Meteor.subscribe('apisFileFromAPISlug',this.params.slug)];
    },
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'home');
    },
    data: function() {
      console.log(this.params.slug);
    	return {
        apis: APIs.findOne({slug: this.params.slug}),
      }
    }
  });

  this.route('showAPIFile', {
    path: '/apiFiles/:slug',
    template: 'apiFileShow',
    waitOn: function(){
      return [Meteor.subscribe('apisFile',this.params.slug)];
    },
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'home');
    },
    data: function() {
      console.log(this.params.slug);
      return {
        apis: APIFiles.findOne({slug: this.params.slug}),
      }
    }
  });

  this.route('maintainerProfile',{
  	path: '/maintainers/:slug',
  	template: 'maintainerShow',
    waitOn: function(){
      return [Meteor.subscribe('maintainer',this.params.slug),Meteor.subscribe('apisFiles')];
    },
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction:function(){
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    },
  	data: function() {
  		return {
        apiFiles: APIFiles.find({$or:[{"maintainers.slug": this.params.slug},{"maintainer.slug": this.params.slug}]}),
        maintainer: Maintainers.findOne({slug: this.params.slug})
      }
    }
  });

  this.route('notFound', {
    path: '*',
    template:'notFound',
    onBeforeAction:function(){
      GAnalytics.pageview();
      Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
      this.next()
    }
  });

});
