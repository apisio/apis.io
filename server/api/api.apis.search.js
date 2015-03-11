/*
* List APIs and submit a new apis.json file endpoint
*/


var API_PATH = Meteor.settings.public.API_PATH

Router.map(function () {
	this.route('api.apis.search', {
	  	path:  API_PATH +"/search",
	  	where: "server",
		controller: 'APIcontroller',
	    onAfterAction: function(){
			var self = this
			Meteor.call("sendSimpleKeenEvent","APICallsCollection",{
				path: self.url,
				query: self.request.query,
				status: self.response.statusCode
			});
	    },
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
				}else{
					var keywords = new RegExp(self.request.query.q, "i");

					var filterFields = {}
					filterFields["_id"]  = 0; //never return _id

					if(self.request.query.fields){ // add &fields= param to filter fields
						_.each(self.request.query.fields.split(','), function(f){
							filterFields[f] = 1
						});
					}

					var order = -1 //desc
					if(self.request.query.order =="asc"){ //default desc
						order = 1; //asc
					}

					var sortBy = {}
					if(self.request.query.sort){ // add &sort param to sort by this field
						sortBy[self.request.query.sort] = order
					}else{
						sortBy["updatedAt"] = order
					}

					var limit = parseInt(self.request.query.limit,10) || 10;
					var skip = parseInt(self.request.query.skip,10) || 0;

					// filter on Swagger
					if(self.request.query.swagger == "true"){
						var data = APIs.find({$and:[{"properties.type":{$in:["Swagger"]},$or:[{name:keywords},{description:keywords},{tags:keywords}]}]},
							{
								sort: sortBy,
								fields:filterFields,
								limit: limit,
								skip: skip
							}
				        ).fetch();
					}else{
						var data = APIs.find({$or:[{name:keywords},{description:keywords},{tags:keywords}]},
							{
								sort: sortBy,
								fields:filterFields,
								limit: limit,
								skip: skip
							}
				        ).fetch();
					}

					//next request
					var nextQuery = self.request.query
					var nextSkip = skip+limit

					var prevQuery = self.request.query
					var previousSkip = (skip - limit)<0 ? 0 : (skip-limit)

					delete nextQuery.skip
					//FIXME asynchronous in generating URI with different skip value
					//FIXME return paging:{} http://stackoverflow.com/questions/13872273/api-pagination-best-practices

					var pagingData = {
						"next":generatePaginationURL(nextQuery,'search') + "skip=" + nextSkip,
						"previous":generatePaginationURL(nextQuery,'search') + "skip=" + previousSkip
					};

					var response = formatResponse({
						status: "success",
						limit: parseInt(limit,10),
						skip: parseInt(skip,10),
						paging: pagingData,
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
