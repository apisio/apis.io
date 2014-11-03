Meteor.publish('apisFiles',function(){
	return APIFiles.find({},{fields:{url:1,maintainers:1}}); //reduce the load to the fields we are using
});

Meteor.publish('apisFile',function(slug){
	return APIFiles.find({slug:slug});
});

Meteor.publish('apisFileFromAPISlug',function(slug){
	var api = APIs.findOne({slug:slug});
	return APIFiles.find({url: api.apiFileURL});
});

Meteor.publish('apis',function(){
	return APIs.find({},{fields:{name:1,keywords:1,tags:1,humanURL:1,apiFileUrl:1,image:1,properties:1,updatedAt:1}});
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