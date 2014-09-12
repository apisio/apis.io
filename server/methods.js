var generateSlug = function(name,collection,id){ //FIXME when updating existing object no need to renegerate slug
    var new_slug = URLify2(name);
    var exist_api = collection.findOne({slug:new_slug});
    var i = 2;
    while(typeof exist_api !== "undefined"  && exist_api._id != id){
        new_slug = URLify2(name)+'-'+i;
        exist_api = collection.findOne({slug:new_slug});
        i++;
    }
    return new_slug;
}

Meteor.methods({
    ping: function(url){
      var apifile = APIFiles.findOne({url: url});
      if(apifile){
        //DELETE all APIs previously defined by this file
        var apis = APIs.find({apiFileUrl: apifile.url});
        apis.forEach(function (api) {
          APIs.remove(api._id);
        });

        //RELOAD APIs defined 
        Meteor.call("loadDataFromJSON",apifile._id,url);
        return 'ok'
      }else{
        throw new Meteor.Error(404, "API definition not found in database, submit it first");
      }
    },
    addAPIFile: function(url){
      // this.unblock();
      var response = HTTP.get(url);
      console.log(response);
      if(response.statusCode===200 && (response.data != null  || response.content !=null)){
        var api = response.data || JSON.parse(response.content)
        var bookfile = APIFiles.findOne({url: url});
          if(bookfile){
            var bookfileID = bookfile._id;
            console.log("EXISTING",bookfileID)
          }else{
            var bookfileID = APIFiles.insert({url: url});
          } // insert new Object in DB

          // iterate on keys of json file
          for (var key in api) {
            if (api.hasOwnProperty(key)) {
              var elem = {}
              elem[key]=api[key]
              // add key to object in DB
              try{
                APIFiles.update({_id:bookfileID}, {$set:elem})
              }catch(e){
                console.log("TRY ERROR",e);
                console.log("CODDDEEE",e.code);
                var message;
                if(e.code==11001)
                  message = "There is already a file with this url";

                message += "\n"+"Details: \n"+e.name + e.err
                throw new Meteor.Error(e.code,message);
              }
            }
          }
          APIFiles.update({_id:bookfileID}, {$set:{md5sum:CryptoJS.MD5(JSON.stringify(api)).toString()}});

          // add APIS to DB
          api.apis.forEach(function (a) {
            Meteor.call("createAPI",a,api.url);
          });

          // add maintainers to DB
          api.maintainers.forEach(function (m,index) {
            var maintainer = Meteor.call("createAuthor",m);
            // add maintainer slug into APIfile for faster search
            APIFiles.update({_id:bookfileID, "maintainers.FN": m.FN}, {$set:{"maintainers.$.slug":maintainer.slug}});
          });
          return true;
      }else{
        console.log(url);
        console.log(response.data);
        console.log("-----")
        throw new Meteor.Error(400, "Something went wrong, verify url, and JSON format");
      }

      //     // recursive on includes ?

    },
    createAPI: function(api,apiFileUrl){
      console.log("create API called");

      // is the file Authoritative
      if(!_.isUndefined(api.humanURL) && !_.isUndefined(apiFileUrl)){
        var auth = Meteor.call('isAuth',api.humanURL,apiFileUrl);
      }

      var current = APIs.findOne({name: api.name, apiFileUrl:apiFileUrl,baseURL:api.baseURL});
      if(current){
        var currentID = current._id;
      }else{
        var currentID = APIs.insert({});// insert new Object in DB
      } 

      // iterate on keys of json file
      for (var key in api) {
        if (api.hasOwnProperty(key)) {
          var elem = {}
          elem[key]=api[key]
          // add key to object in DB
          APIs.update({_id:currentID}, {$set:elem});
        }
      }
      // setup extra fields
      APIs.update({_id:currentID},{$set:{
        authoritative:auth,
        apiFileUrl:apiFileUrl,
        slug:generateSlug(api.name,APIs,currentID)
      }});
      Meteor.call('sendYo',api.name);
    },
    createAuthor: function(author){
      console.log("create author called",author);
      if(author.organizationName) // fails if author.organizatioName == null
        var current = Maintainers.findOne({$or:[{FN: author.FN},{organizationName:author.organizationName}]});
      else
        var current = Maintainers.findOne({FN: author.FN});
      
      if(current){
        var currentID = current._id;
      }else{
        var currentID = Maintainers.insert({});// insert new Object in DB
      } 

      // iterate on keys of json file
      for (var key in author) {
        if (author.hasOwnProperty(key)) {
          var elem = {}
          elem[key]=author[key]
          // add key to object in DB
          Maintainers.update({_id:currentID}, {$set:elem});
        }
      }
      var name = author.FN || author.organizationName;
      Maintainers.update({_id:currentID},{$set:{
        slug:generateSlug(name,Maintainers,currentID)
      }});
      return Maintainers.findOne({_id:currentID});
    },
  	loadDataFromJSON: function (id,url) {
  		this.unblock();
  		HTTP.get(url, function(err,result){
          if(err)
          	return err;

          var api = result.data;
          var maintainers =[];
          api.maintainers.forEach(function (maintainer) {
            var m = Meteor.call("createMaintainer",maintainer)
            maintainers.push(m);
          });
          var exist_api = APIFiles.findOne({url: url});
          console.log("EXXXIST",exist_api);
          if(exist_api){
            APIFiles.update(id,{$set:{
              name: api.name,
              description: api.description,
              url: url,
              image: api.image || '/img/default.svg',
              apis: api.apis,
              include: api.include,
              maintainers: maintainers,
              specificationVersion: api.specificationVersion,
              tags: api.tags,
              modified: api.modified || new Date(),
              md5sum:CryptoJS.MD5(JSON.stringify(api)).toString(),
            }}, function(e,r){
              // console.log(r);
              // console.log("Error on update APIs",e);
              return r;
            });
          }else{
            APIFiles.insert({
              name: api.name,
              description: api.description,
              url: url,
              image: api.image || '/img/default.svg',
              apis: api.apis,
              include: api.include,
              maintainers: maintainers,
              specificationVersion: api.specificationVersion,
              tags: api.tags,
              modified: api.modified || new Date(),
              created: api.created || new Date(),
              md5sum:CryptoJS.MD5(JSON.stringify(api)).toString(),
            }, function(e,r){
              if(e)
                throw new Meteor.error(e);
            });
          }

          // WORKS
          console.log("APIS",api.apis);
          for (var i = 0; i < api.apis.length; i++) {
            var api_k = Meteor.call('createUpdateAPI',api.apis[i],url);
          };
  		});
  	},
    createUpdateAPI: function(api,apiFileUrl){
      if(!_.isUndefined(api.humanURL) && !_.isUndefined(apiFileUrl)){
        var auth = Meteor.call('isAuth',api.humanURL,apiFileUrl);
      }
      var current = APIs.findOne({name: api.name, apiFileUrl:apiFileUrl,machineURL:api.machineURL});

      //Uniqueness defined by file definition and machineURL
      if(current && !_.isUndefined(api.machineURL)){
        var updateApi = APIs.update(current._id, {$set:{
            description: api.description,
            image: api.image || '/img/default.svg',
            humanURL: api.humanURL,
            tags: api.tags,
            urls:api.urls,
            contact:api.contact,
            meta:api.meta,
            authoritative: auth,
            APIVersion: api.APIVersion
          }}, function(err,res){
            // console.log('eee',err);
            // console.log('res',res);
          });

        console.log("Update API",updateApi._id);
        Meteor.call('sendYo'); //send a YO
        return APIs.findOne(updateApi);
      }else{
        var newApi = APIs.insert({
          name: api.name,
          apiFileUrl: apiFileUrl,
          description: api.description,
          image: api.image || '/img/default.svg',
          humanURL: api.humanURL,
          machineURL:api.machineURL,
          tags: api.tags,
          urls:api.urls,
          contact:api.contact,
          meta:api.meta,
          authoritative: auth,
          APIVersion: api.APIVersion
        }, function(err,res){
          console.log('eee',err);
          console.log('res',res);
        });
        console.log("NEW API",newApi);
        Meteor.call('sendYo'); //send a YO
        return APIs.findOne(newApi);
      }
    },
  	createMaintainer: function(maintainer){
  		var current = Maintainers.findOne({$or:[{name: maintainer.name},{name:maintainer.organizationName}]});
  	    if (current){
  	    	var id = Maintainers.update(current._id, {$set:{
  		    		twitter: maintainer.twitter,
  		    		facebook: maintainer.facebook,
  		    		github: maintainer.github,
  		    		linkedin: maintainer.linkedin,
  		    		email: maintainer.email,
  		    		website: maintainer.website,
  			    }});
  	    	return current;
  	    }else{
  	    	var id = Maintainers.insert({
  	    		name: maintainer.name || maintainer.organizationName,
  	    		twitter: maintainer.twitter,
  	    		facebook: maintainer.facebook,
  	    		github: maintainer.github,
  	    		linkedin: maintainer.linkedin,
  	    		email: maintainer.email,
  	    		website: maintainer.website,
  	    	});
  	    	return Maintainers.findOne(id);
  	    }
    },
    validateAndInsert: function(challenge, resp, doc){
      var captchaCheck = Meteor.call("validateCaptcha",challenge,resp);
      console.log("captcha",captchaCheck);
      if(captchaCheck ==="success"){
        //insert and load
        APIFiles.simpleSchema().clean(doc);
        var urlValidateOne = APIFiles.simpleSchema().namedContext().validateOne({url: doc.url}, "url", {modifier: false});
        console.log("WHEN",moment(Date.now()).format());
        Meteor.call('loadDataFromJSON',"",doc.url);
        return "ok";
      }else{
        throw new Meteor.Error(400, "Wrong Captcha");
      }
      
    },
    insertFromUrl: function(url){
      //Valid format first calling validateFormatFromURL
      try{
        var new_api = APIFiles.insert({url: url});
        if(new_api){
          var api = APIFiles.findOne(new_api);
          Meteor.call('loadDataFromJSON',api._id,api.url);
        }
      }catch(e){
        throw new Meteor.Error(400, "Error when insert",e.invalidKeys);
      }
    },
    validateFormatFromURL:function(url){
      try{
        var response = HTTP.get(url);
        if(response.statusCode===200 && response.data != null){
          var api = response.data;
          var context = APIFiles.simpleSchema().namedContext('myContext');
          var valid = context.validate(api);
          console.log("validateFormatFromURL",valid);
          if(valid){
            return "valid";
          }else{
            throw new Meteor.Error(400,context.invalidKeys());
          }
        }else{
          console.log(url);
          console.log(response.data);
          console.log("-----")
          throw new Meteor.Error(400, "Something went wrong, verify url, and JSON format");
        }
      }catch(e){
        console.log(e);
        if(e.reason[0].type=="keyNotInSchema")
          throw new Meteor.Error(e.error,"API.json format error, "+e.reason[0].name+" not allowed by the schema");
        
        throw new Meteor.Error(e.error, e.reason);
      }

    },
    validateFormat:function(api){
      try{
          var context = APIFiles.simpleSchema().namedContext('myContext');
          
          if(typeof api === 'object'){
            var valid = context.validate(api);
          }else{
            var valid = context.validate(JSON.parse(api));
          }

          if(valid){
            return "valid";
          }else{
            var invalidKeys = context.invalidKeys();
            if(_.isArray(invalidKeys)){
              //if multiple keys are invalid, 
              var err = _.map(invalidKeys,function(k){
                if(k.type ="keyNotInSchema")
                  return k.message.replace(/null/,k.name); //FIXME in autoform ?
                if(k.type = "notUnique")
                  return ""
                return k.message
              });
              throw new Meteor.Error(400,err);
            }
            throw new Meteor.Error(400,invalidKeys);
          }
      }catch(e){
        if(e.name.toString()==="SyntaxError"){
          throw new Meteor.Error(400, "Not a valid JSON file");
        }else{
          if(e.reason[0].type=="keyNotInSchema")
            throw new Meteor.Error(e.error,"API.json format error, '"+e.reason[0].name+"' not allowed by the schema");
          
          throw new Meteor.Error(e.error, e.reason);
        }
      }

    },
    validateCaptcha: function(challenge, resp){
      var self = this;
      var ip = self.connection.clientAddress;
      var result = HTTP.post('http://www.google.com/recaptcha/api/verify', {params: {
        privatekey:Meteor.settings.private.recaptcha.privatekey,
        remoteip:ip,
        challenge:challenge,
        response:resp,
      }});

      if(result.statusCode === 200){
        if(result.content==="true\nsuccess")
          return "success";

        //if fails throw error
        throw new Meteor.Error(400, 'Error 400: Wrong captcha try again');
      }
    },
    isAuth: function(humanURL, apiFileUrl){
      var URI = Meteor.require('URIjs');
      var apiDomain = new URI(humanURL);
      var apiFileDomain = new URI(apiFileUrl);
      return (apiDomain.domain() === apiFileDomain.domain());
    }
  });