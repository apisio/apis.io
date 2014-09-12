UI.registerHelper('displayMaintainerName', function (m) {
	if(!_.isUndefined(m[0].FN)) //since 0.14
		return m[0].FN;

	if(!_.isUndefined(m[0].org)) //since 0.14
		return m[0].org;

	return m[0].name;
    // return Maintainers.findOne({slug: m}).name;
});

UI.registerHelper('nbMaintainers', function () {
	return Maintainers.find().count();
});

UI.registerHelper('maintainerLink',function(m){
	if(!_.isUndefined(m[0].FN)) //since 0.14
		return "/maintainers/"+Maintainers.findOne({FN:m[0].FN}).slug;

	return "/maintainers/"+m[0].slug;
});

UI.registerHelper('maintainerOfAPI',function (apiFileURL){
	var apiFile = APIFiles.findOne({url:apiFileURL});
	if(apiFile)
		return apiFile.maintainers[0];
});

UI.registerHelper('displayTwitter',function(twitter){
	if(twitter.match('twitter.com'))
		return twitter;

	return "http://twitter.com/"+twitter;
});