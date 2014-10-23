/*
* List APIs and submit a new apis.json file endpoint
*/


var API_PATH = Meteor.settings.public.API_PATH

Router.map(function () {
	this.route('searchAPIs', {
	  	path:  API_PATH +"/search",
	  	where: "server",
	  	action: function(){
	  		var self = this
	  		initHeaders(self);

			if (self.request.method == 'GET'){
				if(_.isUndefined(self.request.query.q)){
					self.response.statusCode = 400;
		    		var response = formatResponse({
			        	status: "fail",
			        	message: "Malformed, expecting 'q' parameter"
			        });
			        console.log(self.request.query.q)
				}else{
					var keywords = new RegExp(self.request.query.q, "i");

					var filterFields = {}
					filterFields["_id"]  =0; //never return _id

					if(self.request.query.fields){ // add &fields= param to filter fields
						_.each(self.request.query.fields.split(','),function(f){
							filterFields[f]=1
						});
					}
					
					var data = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},
						{fields:filterFields},
				         {sort: {updatedAt: 1}}).fetch();

					var response = formatResponse({
						status: "success",
						data: JSON.stringify(data)
					});
				}
				
				self.response.end(response);
			}else if (self.request.method == 'OPTIONS') {
	        // OPTIONS
	        self.response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	        self.response.end("OPTIONS Response");
	      }
	  	}
	});
})