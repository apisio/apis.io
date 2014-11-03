/*
  Defines APIs.io's API routes
*/

var API_PATH = Meteor.settings.public.API_PATH

Router.map(function () {
  this.route('apiPath', {
  	path: API_PATH,
  	where: "server",
  	action: function(){
  	  this.response.statusCode = 200;
  	  initHeaders(this);
      var response = '{"status": "success","data": {"links":{"listAPI [GET]": API_PATH +"/apis","addAPI [POST]": API_PATH +"/apis/add","listMaintainers [GET]": API_PATH +"/maintainers"}}}';
	    this.response.end(response);
  	}
  }),

  this.route('apiDoc',{
    path: API_PATH +"/api-doc",
    where:"server",
    action: function(){
      initHeaders(this);
      this.response.setHeader("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization" );
      var doc = HTTP.get("http://apis.io/swagger.json");
      this.response.end(JSON.stringify(doc.data));
    }
  }),

  this.route('apiDocTest',{
    path: API_PATH +"/api-doc2",
    where:"server",
    action: function(){
      initHeaders(this);
      var data = '{"apiVersion":"1.0.0","swaggerVersion":"1.2","apis":[{"path":"/pet","description":"Operations about pets"},{"path":"/user","description":"Operations about user"},{"path":"/store","description":"Operations about store"}],"authorizations":{"oauth2":{"type":"oauth2","scopes":[{"scope":"write:pets","description":"Modify pets in your account"},{"scope":"read:pets","description":"Read your pets"}],"grantTypes":{"implicit":{"loginEndpoint":{"url":"http://petstore.swagger.wordnik.com/oauth/dialog"},"tokenName":"access_token"},"authorization_code":{"tokenRequestEndpoint":{"url":"http://petstore.swagger.wordnik.com/oauth/requestToken","clientIdName":"client_id","clientSecretName":"client_secret"},"tokenEndpoint":{"url":"http://petstore.swagger.wordnik.com/oauth/token","tokenName":"auth_code"}}}}},"info":{"title":"Swagger Sample App","description":"This is a sample server Petstore server.  You can find out more about Swagger \n    at <a href=\"http://swagger.wordnik.com\">http://swagger.wordnik.com</a> or on irc.freenode.net, #swagger.  For this sample,\n    you can use the api key \"special-key\" to test the authorization filters","termsOfServiceUrl":"http://helloreverb.com/terms/","contact":"apiteam@wordnik.com","license":"Apache 2.0","licenseUrl":"http://www.apache.org/licenses/LICENSE-2.0.html"}}'
      console.log(JSON.stringify(data));
      this.response.end(data);
    }
  }),


  //TODO /maintainers
  // pagination
  // refactor

  this.route('apiListAPIs', {
  	path:  API_PATH +"/apis/ping",
  	where: "server",
  	action:function(){
 		  initHeaders(this);
  		//POST with {"url":"http://foo.bar/myapi.json"}
  		if (this.request.method == 'POST') {
  			if(_.isUndefined(this.request.body.url)){
	      		this.response.statusCode = 400;
	      		var response = formatResponse({
		        	status: "fail",
		        	message: "Malformed, expecting url parameter"
		        });
			    this.response.end(response);
	      	}else{
	      		try{
		      		var result = Meteor.call('ping',this.request.body.url);
		      		if(result =="ok"){
		      			this.response.statusCode = 200;
			      		var response = formatResponse({
				        	status: "success",
				        	message: "APIs updated"
				        });
					    this.response.end(response);
		      		}
	      		}catch(e){
	      			console.log(e);
	      			this.response.statusCode = e.error;
	      			var response = formatResponse({
			        	status: "fail",
			        	message: e.reason,
			        });
	      			this.response.end(response);
	      		}
	      	}
  		}else if (this.request.method == 'OPTIONS') {
        // OPTIONS
        this.response.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
        this.response.end("OPTIONS Response");
      }
  	},
    onAfterAction: function(){
      console.log(this.path,this.response.statusCode);
      console.log(this.request.body);
      console.log(this.request.url);

      //  Meteor.call("sendKeenEvent","APICallsCollection",{
      //   path: this.path,

      // });
    }
  });

  this.route('yoSubscription', {
    path:  API_PATH +"/yo",
    where: "server",
    action:function(){
      initHeaders(this);
      if (this.request.method == 'GET'){
        console.log("new YO Subscription",this.request.query.username);
        Meteor.call('sendSimpleKeenEvent','yoSubscription',{username:this.request.query.username});
      }
    }
  });

  this.route('apiNotFound', {
  	path: "/api/*",
  	where: "server",
  	action:function(){
  	  initHeaders(this);
  		this.response.statusCode = 401;
  		this.response.end();
	}
  });

}); //end global router



// Embed API response`
// {"status": "success","data": ...,"message":"Blah"}
formatResponse = function(options){
	var response = '{"status": "'+options.status+'"';
	if(!_.isUndefined(options.message))
		response += ', "message":"'+options.message+'"';

	if(!_.isUndefined(options.details))
		response += ', "details":"'+options.details+'"';

	if(!_.isUndefined(options.data))
		response += ', "data":'+options.data;

  // response +=","
  //FIXME render better object

  _.each(_.omit(options,['status','details','message','data']),function(el, index){
    response+= ", "
    if(typeof el == "number")
      response+= '" '+ index + '":' + el
    else if(typeof el == "object"){
      response += '" '+ index + '":{'
      _.each(_.keys(el),function(e,i){
        response += '"'+e+'":"'+el[e]+'",'
      })
      response = response.substring(0, response.length - 1); //last comma
      response+= "}"
    }
    else
      response+= '" '+ index + '":"' + el+'"'
  })

	response+= "}";
	return response;
}

initHeaders = function(endpoint){
	endpoint.response.setHeader("Content-Type", "application/json");
  endpoint.response.setHeader("Access-Control-Allow-Origin", "*");
  endpoint.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}