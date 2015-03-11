Meteor.methods({
	sendYo:function(apiName){
		try{
			var result = HTTP.post("http://api.justyo.co/yoall/", {params: {api_token:"f2e6d959-4d72-32cc-e8e4-888d195c45ef",link:"http://apis.io/?search="+apiName}});	
		}catch(e){
			console.log('error sending yo');
			console.log(e);
		}
	}

});