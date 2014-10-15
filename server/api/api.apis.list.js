/*
* List APIs and submit a new apis.json file endpoint
*/


var API_PATH = Meteor.settings.public.API_PATH

Router.map(function () {
	this.route('apiListAPIs', {
  	path:  API_PATH +"/apis",
  	where: "server",
  	action: function(){
  		var self = this
	  	initHeaders(self);

		if (self.request.method == 'GET') { // LIST existing APIs
			var data = APIs.find({},{fields:{
					_id:0,}
				}).fetch();

			var response = formatResponse({
				status: "success",
				data: JSON.stringify(data)
			});
			self.response.end(response);
	    }else if (self.request.method == 'POST') { // POST new API def
	    	if(_.isUndefined(self.request.body.url)){
	    		self.response.statusCode = 400;
	    		var response = formatResponse({
		        	status: "fail",
		        	message: "Malformed, expecting url parameter"
		        });
	  	    	self.response.end(response);
	    	}else{
	    		try{
	    			var result = Meteor.call('validateSchemaFromURL',self.request.body.url,"0.14")
	    			if(result == "valid"){
		    		    Meteor.call('addAPIFile',self.request.body.url,function(err,res){
		    		    	console.log("REEEESULT",res)
			    		  	if(res)
			    		  		var response = formatResponse({
					  	        	status: "success",
					  	        	message: "Thank you for your submission."
					  	        });
	
			    		  	if(err)
			    		  		var response = formatResponse({
					  	        	status: "fail",
					  	        	message: _.isArray(err.reason) ? err.reason[0].message : err.reason
					  	        });
	
			    		  	self.response.end(response);
			    		});
		    		}
	    		}catch(e){
		            console.log("EEE",e);
	    			self.response.statusCode = 400;
	    			var response = formatResponse({
			        	status: "fail",
			        	message: _.isArray(e.reason) ? e.reason[0].message : e.reason,
			        	details: _.isUndefined(e.details) ? "" : e.details[0].message
			        });
	    			self.response.end(response);
	    		}
	    	}
	    }else if (self.request.method == 'OPTIONS') {
	        // OPTIONS
	        self.response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	        self.response.end("OPTIONS Response");
	      }
	  	}
	});
})