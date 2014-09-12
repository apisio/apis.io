var apis = ['500px','bitbucket','bitly','contextio','etsy','eventful','fitbit',	'foursquare','github','instagram','lastfm','linkedin','musixmatch','nutritionix','rdio','sphereio','spotify','stripe','tropo'];

for(int i = 0; i<apis.length,i++){
	var fileUrl = "http://apis.io/apisdef/";
	fileUrl += apis[0];
	fileUrl += ".json";
	$.post( "http://apis.io/api/v1/apis", { url: fileUrl} ,function(err,ress){
		console.log('err',err);
		console.log('res',ress)
	});
}