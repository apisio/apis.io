AutoForm.hooks({
  insertAPIFileForm: {
  	onSubmit: function(insertDoc, updateDoc, currentDoc){
  		Meteor.call("validateFormat",insertDoc,function(error,result){
	        if(error){
	          FlashMessages.sendError('['+error.error+'] '+error.reason);
	        }
	        if(result=="valid"){
	        	FlashMessages.sendSuccess("Valid format");

            //Delete autoValues
            if(insertDoc.apis){
              _.each(insertDoc.apis,function(api){
                delete api['slug'];
                delete api['createdAt'];
              })
            }
            var blob = new Blob([EJSON.stringify(insertDoc,{indent: true})], {type: "application/json;charset=utf-8"});
            saveAs(blob, "api.json");
	        }
	    });
  		return false;
  	},
  	onError: function(operation, error, template) {
  		console.log(operation);
      console.log(error);
      console.log(template);
  	}
  }
});