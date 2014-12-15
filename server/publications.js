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

Meteor.publish('apiByKeyword',function (keywords) {
	keywords = new RegExp(keywords, "i");
	var results = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},{fields:{name:1,keywords:1,tags:1,humanURL:1,apiFileUrl:1,image:1,properties:1,updatedAt:1}})
	return results;
});

Meteor.publish('maintainersOfAPIs',function(keywords){
	var urls = []
	var apis = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},{fields:{apiFileUrl:1}})
	console.log(apis.count());
	apis.forEach(function(api){
		// if(!urls.indexOf(api.apiFileUrl))
			urls.push(api.apiFileUrl)
	})
	console.log("APIURLS",urls);
	return APIFiles.find({url:{$in: urls}},{fields:{maintainers:1}})
})

Meteor.publish('APIfilesByKeyword',function(keywords) {
	keywords = new RegExp(keywords, "i");
	console.log("keywords",keywords);
	return APIFiles.find({$or:[{"apis.name":keywords},{"apis.description":keywords},{"apis.tags":keywords}]},{fields:{url:1,maintainers:1}})
})

Meteor.publish('apiByTag',function (keywords) {
	keywords = new RegExp(keywords, "i");
	var results = APIs.find({tags:keywords})
	return results;
});

Meteor.publish('apisCount',function(){
	Counts.publish(this, 'apisCount', APIs.find());
});

Meteor.publish('maintainersCount',function(){
	Counts.publish(this, 'maintainersCount', Maintainers.find());
});

Meteor.publish('maintainerCount',function(){
	return Maintainers.find({}).count()
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
