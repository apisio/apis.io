// Kadira app to monitor Meteor app kadira.io
if(process.env.ENV=="DEV"){
	Kadira.connect(Meteor.settings.private.kadira.dev.key, Meteor.settings.private.kadira.dev.secret)
}else{
	Kadira.connect(Meteor.settings.private.kadira.prod.key, Meteor.settings.private.kadira.prod.secret)
}