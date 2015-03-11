Meteor.methods({
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

})
