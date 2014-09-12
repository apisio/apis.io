UI.registerHelper('getRootUrl',function (){
	var protocol = /^(https?|ftp):\/\//;
	if(this['humanURL'])
		return this['humanURL'].replace(protocol,"").replace('www.',"").split('/')[0];

	return ""
});

//Display keywords in search bar
UI.registerHelper('displayKeywords',function(){
	if(!_.isUndefined(Session.get("search_keywords")) && !_.isEmpty(Session.get("search_keywords"))){
	    if(Session.get("search_keywords")==" ")
	    	return "*"

	    return Session.get("search_keywords");
	}
	if(!_.isEmpty(Session.get("search_tags"))){
		return "tag:"+Session.get("search_tags");
	}
	
})

//Display the spec versions supported
UI.registerHelper('displaySpecVersions',function(){
	var html ="";
	_.each(Meteor.settings.public.specVersions,function(version,index){
		if(index==Meteor.settings.public.specVersions.length-1)
			html += "<a href='http://apisjson.org/format/apisjson_"+version+".txt'>"+version+"</a>";
		else
			html += "<a href='http://apisjson.org/format/apisjson_"+version+".txt'>"+version+"</a>, ";
	})
	return html
});

UI.registerHelper('specVersions',function(){
	return Meteor.settings.public.specVersions;
});