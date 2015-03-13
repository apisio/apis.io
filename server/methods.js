generateSlug = function(name,collection,id){ //FIXME when updating existing object no need to renegerate slug
    var new_slug = URLify2(name);
    var exist_api = collection.findOne({slug:new_slug});
    // console.log(name,new_slug,exist_api)
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
    validateAndInsert: function(challenge, resp, doc){
      console.log("CC",challenge,resp);
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
    // insertFromUrl: function(url){
    //   //Valid format first calling validateFormatFromURL
    //   var api = APIFiles.findOne({url:url})
    //   if(api){
    //     Meteor.call('loadDataFromJSON',api._id,api.url);
    //   }else{
    //     try{
    //       var new_api = APIFiles.insert({url: url});
    //       if(new_api){
    //         var api = APIFiles.findOne(new_api);
    //         Meteor.call('loadDataFromJSON',api._id,api.url);
    //       }
    //     }catch(e){
    //       throw new Meteor.Error(400, "Error when insert",e.invalidKeys);
    //     }
    //   }
    // },
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
      console.log(challenge,resp)
      var self = this;
      var ip = self.connection.clientAddress;
      var result = HTTP.post('http://www.google.com/recaptcha/api/verify', {params: {
        privatekey:Meteor.settings.private.recaptcha.privateKey,
        remoteip:ip,
        challenge:challenge,
        response:resp,
      }});

      console.log(result);

      if(result.statusCode === 200){
        if(result.content==="true\nsuccess")
          return "success";

        //if fails throw error
        throw new Meteor.Error(400, 'Error 400: Wrong captcha try again');
      }
    }
  });
