UI.registerHelper('nbAPIs', function () {
	return APIs.find().count();
});

UI.registerHelper('displayModifiedDate',function(d){
	return moment(d).fromNow();
});

UI.registerHelper('APItags',function(){
	if(_.isArray(this.tags)){ // since 0.14
		return _.map(this.tags, function(num){ return {"name":num}; });
	}

	var tags = this.tags.split(/[\s,]+/);
	var array = [];
	for (var i = 0; i < tags.length; i++) {
		array.push({name: tags[i]});
	};
	return array;
});

UI.registerHelper('getAPIFile',function (url){
	var apiFile = APIFiles.findOne({url:url});
	if(apiFile)
		return apiFile;
});

UI.registerHelper('displayAPIImage',function(){
	if(this.image)
		return this.image;

	return "/img/default.svg";
})

UI.registerHelper('displayType',function (type){
	if(type.indexOf('X-')>=0){ // since v0.14
		return type.replace('X-','');
	}else{
		return type;
	}
});