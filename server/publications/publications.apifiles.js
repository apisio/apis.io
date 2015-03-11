Meteor.publish('apisFiles',function(){
	return APIFiles.find({},{fields:{url:1,maintainers:1}});
});

Meteor.publish('apisFilesByMaintainer',function(maintainerSlug){
	return APIFiles.find({$or:[{"maintainers.slug": maintainerSlug},{"maintainer.slug": maintainerSlug}]},{fields:{url:1,maintainers:1,apis:1,name:1}})
});

Meteor.publish('apisFile',function(slug){
	return APIFiles.find({slug:slug});
});

Meteor.publish('apisFileFromAPISlug',function(slug){
	var api = APIs.findOne({slug:slug});
	return APIFiles.find({url: api.apiFileURL});
});

Meteor.publish('APIfilesByKeyword',function(keywords) {
	keywords = new RegExp(keywords, "i");
	console.log("keywords",keywords);
	return APIFiles.find({$or:[{"apis.name":keywords},{"apis.description":keywords},{"apis.tags":keywords}]},{fields:{url:1,maintainers:1}})
})

Meteor.publish('maintainersOfAPIs',function(keywords){
	var urls = []
	var apis = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},{fields:{apiFileUrl:1}})
	// console.log(apis.count());
	apis.forEach(function(api){
		// if(!urls.indexOf(api.apiFileUrl))
			urls.push(api.apiFileUrl)
	})
	// console.log("APIURLS",urls);
	return APIFiles.find({url:{$in: urls}},{fields:{maintainers:1}})
})
