maintainerSchema = new SimpleSchema({
    url:{
        type:String,
        label:"url",
        optional: true,
        regEx: SimpleSchema.RegEx.Url,
    },
    name:{
        type:String,
        label:'maintainer name',
        optional:true,
    },
    twitter:{
        type:String,
        label:'twitter',
        optional:true,
    }, 
    github:{
        type:String,
        label:'github',
        optional:true,
    },
    email:{
        type:String,
        label:'email',
        optional:true,
    },
    organizationName:{
        type:String,
        label:'organization name',
        optional:true,
    },
    address:{
        type:String,
        label:'postal address',
        optional:true,
    },
    image:{
        type:String,
        label:'image',
        optional:true,
        regEx: SimpleSchema.RegEx.Url,
    },
    slug:{
        type:String,
        label:'slug',
        optional:true,
    },
    _id:{
        type:String,
        label:'_id',
        optional:true,
    }

});

typeUrlSchema = new SimpleSchema({
	type:{
		type:String,
		label: "url type",
	},
	url:{
		type:String,
		label:"url",
	}
});

includeSchema = new SimpleSchema({
	name:{
		type:String,
		label: "name (name of the APIs.json file referenced)",
        optional: true
	},
    url:{
        type: String,
        label: "url (Web URL of the file)",
        optional: true
    }
});

keyValueSchema = new SimpleSchema({
	key:{
		type:String,
		label:"key",
        optional: true
	},
	value:{
		type:String,
		label:"value",
        optional: true
	},
	type:{
		type:String,
		label:"type",
        optional: true
	},
	url:{
		type:String,
		label:"url",
        optional: true
	}
});

apiSchema = new SimpleSchema({
    name: {
        type: String,
        label: "name (name of the API)",
    },
    slug:{
        type: String,
        label: "slug",
        optional:true,
        autoValue: function() {
          if (this.field('name').isSet) {
            var new_slug = URLify2(this.siblingField('name').value);
            var api = APIs.findOne({slug:new_slug});
            var i =2;
            while(typeof api !== "undefined"){
                new_slug = URLify2(this.siblingField('name').value)+'-'+i;
                api = APIs.findOne({slug:new_slug});
                i++;
            }
            return new_slug;
          }
        },
        // @FIXME update existing API / uniqueness of API.
        // denyUpdate: true, 
    },
    apiFileUrl:{
        type: String,
        label: "apiFileUrl",
        optional:true,
        regEx: SimpleSchema.RegEx.Url,
    },
    description: {
        type: String,
        label: "description (human readable text description of the API)",
        optional: true
    },
    image: {
        type: String,
        label: "image (URL of an image which can be used as an 'icon' for the API if displayed by a search engine.)",
        optional: true
    },
    APIVersion:{
        type: String,
        label: "APIVersion (Version number of the API this description refers to)",
        optional:true
    },
    humanURL: {
        type: String,
        label: "human url (Web URL corresponding to human readable information about the API)",
        optional: true,
        regEx: SimpleSchema.RegEx.Url
    },
    machineURL: {
        type: String,
        label: "machine url",
        optional: true,
        regEx: SimpleSchema.RegEx.Url
    },
    tags: {
        type: String,
        label: "tags",
        optional: true
    },
    urls:{
        type:[typeUrlSchema],
        minCount:1,
        optional:true,
    },
    contact:{
        type:[typeUrlSchema],
        minCount:1,
        optional:true,
    },
    meta:{
        type:[keyValueSchema],
        minCount:1,
        optional:true
    },
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    createdAt: {
        type: Date,
          autoValue: function() {
            if (this.isInsert) {
              return new Date;
            } else if (this.isUpsert) {
              return {$setOnInsert: new Date};
            } else {
              this.unset();
            }
          },
        denyUpdate: true,
        optional:true,
    },
    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    updatedAt: {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
    },
    authoritative:{
        type: Boolean,
        optional:true
    }
});

// APIFiles = new Meteor.Collection("APIFiles", {
//     schema: new SimpleSchema({
//         name: {
//             type: String,
//             label: "name (text string of human readable name for the collection of APIs)",
//         },
//         slug: {
//             type: String,
//             label: "slug",
//             optional: true,
//             autoValue: function() {
//               if (this.field('name').isSet) {
//                 return URLify2(this.field('name').value);
//               }
//             },
//             // @FIXME uniqueness
//             // denyUpdate: true, 
//         },
//         description: {
//             type: String,
//             label: "description (text human readable description of the collection of APIs)", //FIXME limit size
//         },
//         url: {
//             type: String,
//             label: "url (Web URL indicating the location of the latest version of this file)",
//             index: true,
//             unique: true,
//             regEx: SimpleSchema.RegEx.Url,
//         },
//         image:{
//             type: String,
//             label: "image (Web URL leading to an image to be used to represent the collection of APIs defined in this file)",
//             optional: true,
//         },
//         specificationVersion:{
//             type: String,
//             label: "specificationVersion (version of the APIs.json specification in use.)"
//         },
//         apis:{
//         	type:[apiSchema],
//             label: "APIs, list of APIs identified in the file",
//         	minCount:1,
//             optional: true
//         },
// 	    include:{
// 	    	type:[includeSchema],
// 	    	minCount:0,
//             optional: true
// 	    },
// 	    maintainers:{
// 	    	type:[maintainerSchema],
//             minCount:1,
//             // optional: true
// 	    },
// 	    tags:{
// 	    	type: String,
// 	    	label: "Tags",
//             optional: true
// 	    },
// 	    modified:{
// 	    	type: String,
// 	    	label: "modified MM/DD/YYYY (date of last modification of the file)",
// 	    },
//         created:{
//             type: String,
//             label: "created MM/DD/YYYY(date of creation of the file)",
//         },
//         // Force value to be current date (on server) upon insert
//         // and prevent updates thereafter.
//         createdAt: {
//             type: Date,
//               autoValue: function() {
//                 if (this.isInsert) {
//                   return new Date;
//                 } else if (this.isUpsert) {
//                   return {$setOnInsert: new Date};
//                 } else {
//                   this.unset();
//                 }
//               },
//             denyUpdate: true,
//             optional:true,
//         },
//         // Force value to be current date (on server) upon update
//         // and don't allow it to be set upon insert.
//         updatedAt: {
//             type: Date,
//             autoValue: function() {
//               if (this.isUpdate) {
//                 return new Date();
//               }
//             },
//             denyInsert: true,
//             optional: true
//         },
//         md5sum:{
//             type: String,
//             optional: true
//         }

//     })
// });

APIFiles = new Meteor.Collection("APIFiles")

APIFiles.allow({
    'insert': function (userId,doc) {
        /* user and doc checks ,
        return true to allow insert */
        return true; 
    },
    'update': function(){
        return true;
    }
});

// APIFiles.simpleSchema().messages({
//     "notUnique url":"url should be unique, if you already have submitted your file use <i>/ping</i> method to update the content. <a href='/api'>Documentation</a>"
// });

// APIFiles.simpleSchema().labels({
//     helpName: "Enter your password"
// });