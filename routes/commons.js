Router.configure({
  notFoundTemplate: "notFound",
  layoutTemplate: 'defaultLayout',
  loadingTemplate: "loadingTpl",
});

if(Meteor.isClient){
  Router.onBeforeAction('loading');
}
