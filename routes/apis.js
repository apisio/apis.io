Router.map(function () {
    //FIXME change API to APIFile
    this.route('apis.new', {
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
})
