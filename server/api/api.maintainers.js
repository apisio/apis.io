var API_PATH = Meteor.settings.public.API_PATH

Router.map(function () {
	this.route('apiListMaintainers', {
  	path:  API_PATH +"/maintainers/",
  	where: "server",
  	action:function(){
  	  initHeaders(this);
  	  if (this.request.method == 'GET') {
        // LIST existing APIs
        var data = Maintainers.find({},{fields:{
          		slug:0,
          		_id:0,}
          	}).fetch();

        var response = formatResponse({
	        	status: "success",
	        	data: JSON.stringify(data)
	        });
	      this.response.end(response);
	    }else if (this.request.method == 'OPTIONS') {
        // OPTIONS
        this.response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        this.response.end("OPTIONS Response");
      } 
	}
  });
})