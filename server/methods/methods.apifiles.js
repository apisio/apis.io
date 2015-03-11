Meteor.methods({
    addAPIFile: function(url){
      // this.unblock();
      var response = HTTP.get(url);
      var URI = Meteor.npmRequire('URIjs');
      var uri = new URI(url)
      var file_name = uri.filename();

      if(file_name != "apis.json"){
        throw new Meteor.Error(400,"Error on filename. Your file should be named <i>apis.json</i>")
      }

      if(response.statusCode===200 && (response.data != null  || response.content !=null)){
        var api = response.data || JSON.parse(response.content)
        var bookfile = APIFiles.findOne({url: url});
        if(bookfile){
          var bookfileID = bookfile._id;
          console.log("EXISTING",bookfileID)
        }else{
          var bookfileID = APIFiles.insert({url: url}); // insert new Object in DB
        }

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

    }
})
