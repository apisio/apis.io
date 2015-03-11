Meteor.publish('maintainersCount',function(){
	Counts.publish(this, 'maintainersCount', Maintainers.find());
});

// Meteor.publish('maintainerCount',function(){
// 	return Maintainers.find({}).count()
// });

Meteor.publish('maintainer',function(m){
	return Maintainers.find({slug: m});
});

// Meteor.publish('maintainers',function(){
// 	return Maintainers.find({});
// });
// Meteor.publish('nbMaintainers',function(){
// 	return Maintainers.count();
// });
