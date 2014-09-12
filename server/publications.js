Meteor.publish('apisFiles',function(){
	return APIFiles.find({});
});

Meteor.publish('apisFile',function(slug){
	return APIFiles.find({slug:slug});
});

Meteor.publish('apisFileFromAPISlug',function(slug){
	var api = APIs.findOne({slug:slug});
	return APIFiles.find({url: api.apiFileURL});
});

Meteor.publish('apis',function(){
	return APIs.find({});
});

Meteor.publish('api',function(slug){
	return APIs.find({slug:slug});
});

Meteor.publish('maintainer',function(m){
	return Maintainers.find({slug: m});
});

Meteor.publish('maintainers',function(){
	return Maintainers.find({});
});
Meteor.publish('nbMaintainers',function(){
	return Maintainers.count();
});