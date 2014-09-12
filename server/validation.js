tv4 = Meteor.require('tv4');
formats = Meteor.require('tv4-formats');
assert = Meteor.require('assert');
vCard = Meteor.require('vcard');
validator = tv4.freshApi();
validator.addFormat(formats);

Meteor.methods({
	validateSchema:function(data,schemaVersion){
		var schema = Assets.getText("schema_"+schemaVersion+".json")

		// if string parse JSON
		if(typeof data == 'string'){
			try{
		        data = JSON.parse(data)
		    }catch(e){
		        throw new Meteor.Error(400,"Not a valid JSON");
		    }
		}
		schema = JSON.parse(schema);
		var validFile = validator.validate(data,schema);
		var errors = validator.error;

		console.log("errors",errors);
		
		// if vCard field on maintainer 
		if(typeof data.maintainers != "undefined" && data.maintainers[0].vCard){
            var validCard = Async.runSync(function(done) {
            	//TODO add error if vcard URL fails
            	var response = HTTP.get(data.maintainers[0].vCard);
            	var card = new vCard();

            	//validate vCard format
            	card.readData(response.content,function(err, json){
					if(json)
						done(null, true);
					else
						done(err,null);
					return validCard;
				});
		    });

            if(validCard.error)
            	throw new Meteor.Error(400, validCard.error)
		}

		// if file and vCard valid format
		if(validFile==true && (typeof validCard == "undefined" || validCard.result==true)){
			return true;
		}else{
			var dataPath = errors.dataPath=='' ? '/' : errors.dataPath
			console.log("Error on Format ", errors);
			console.log("SUB",errors.subErrors);
			var message = errors.message+" at "+dataPath;
			if(errors.subErrors){
				_.each(errors.subErrors,function(err){
					var path = err.dataPath=='' ? '/' : err.dataPath
					message += "<br/>"
					message += err.message +" at "+ path;
				});
			}
				
			throw new Meteor.Error(400,message);
		}
	},

	validateSchemaFromURL : function(url,schemaVersion){
		console.log("Validate From URL called",url, schemaVersion);
		try{
			var response = HTTP.get(url);
		}catch(e){
			console.log("error HTTP get",e, url)
			throw new Meteor.Error(404, "URL not accessible");
		}
        if(response.statusCode===200){ //if URL works
        	if(response.headers['content-type'].indexOf("text/plain")== -1 && response.headers['content-type'].indexOf("application/json") == -1){
        		console.log("ERROR content type",response.headers['content-type']);
        		throw new Meteor.Error(400,"The url should point to an apis.json file.");
        	}
        	if(response.data != null  || response.content !=null){
	          var data = response.data || JSON.parse(response.content)
	          console.log(data);
	          var valid = Meteor.call('validateSchema',data,schemaVersion);
	          console.log("validateSchemaFromURL",url,valid);
	          if(valid){
	            return "valid";
	          }else{
	            throw new Meteor.Error(400,"Error");
	          }
	        }
        }
	},
})