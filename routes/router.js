Router.map(function () {
  this.route('dashboard', {
    path: '/dashboard',
    template: 'dashboard',
    onBeforeAction: function(){
        GAnalytics.pageview();
        if(_.isUndefined(this.params.query.pass) || this.params.query.pass != 'apisrocks'){
            this.redirect('/');
        }
        this.next()
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
      GAnalytics.pageview();
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
      GAnalytics.pageview();
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

  this.route('apisio.api.doc',{
    path: '/apiDoc',
    template: 'apisio.api.doc',
    yieldTemplates: {
      'navbar': {to: 'navbar'},
    },
    onBeforeAction: function(){
      Session.set('active', 'apisio.api.doc');
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
