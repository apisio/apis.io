Meteor.publish('apisCount',function(){
	Counts.publish(this, 'apisCount', APIs.find());
});

Meteor.publish('apis',function(){
	return APIs.find({},{fields:{name:1,keywords:1,tags:1,humanURL:1,apiFileUrl:1,image:1,properties:1,updatedAt:1}});
});

Meteor.publish('apiByKeyword',function (keywords) {
	keywords = new RegExp(keywords, "i");
	var results = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},{fields:{name:1,keywords:1,tags:1,humanURL:1,apiFileUrl:1,image:1,properties:1,updatedAt:1,authoritative:1}})
	return results;
});
