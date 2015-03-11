Meteor.methods({
    createAPI: function(api,apiFileUrl){
      // is the file Authoritative
      if(!_.isUndefined(api.humanURL) && !_.isUndefined(apiFileUrl)){
        var auth = Meteor.call('isAuth',api.humanURL,apiFileUrl);
      }

      var current = APIs.findOne({name: api.name, apiFileUrl:apiFileUrl,baseURL:api.baseURL});
      if(current){
        var currentID = current._id;
      }else{
        var currentID = APIs.insert({});// insert new Object in DB
         APIs.update({_id:currentID},{$set:{
          createdAt: new Date()
         }})
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
        slug:generateSlug(api.name,APIs,currentID),
        updatedAt: new Date()
      }});

      if(process.env.ENV!="DEV"){
        Meteor.call('sendYo',api.name); //send a YO
      }
    },
    createUpdateAPI: function(api,apiFileUrl){
        if(!_.isUndefined(api.humanURL) && !_.isUndefined(apiFileUrl)){
          var auth = Meteor.call('isAuth',api.humanURL,apiFileUrl);
        }
        var current = APIs.findOne({name: api.name, apiFileUrl:apiFileUrl,baseURL:api.baseURL});
        console.log("CURRENT",current)

        //Uniqueness defined by file definition and baseURL
        if(current && !_.isUndefined(api.baseURL)){
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
          if(process.env.ENV!="DEV"){
            Meteor.call('sendYo'); //send a YO
          }
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
          if(process.env.ENV!="DEV"){
            Meteor.call('sendYo'); //send a YO
          }
          return APIs.findOne(newApi);
        }
    },
    isAuth: function(humanURL, apiFileUrl){
      var URI = Meteor.npmRequire('URIjs');
      var apiDomain = new URI(humanURL);
      var apiFileDomain = new URI(apiFileUrl);
      return (apiDomain.domain() === apiFileDomain.domain());
    }
})
