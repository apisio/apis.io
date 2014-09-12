Template.addNewAPI.events({
  'submit form': function (e) {
    e.preventDefault();
    e.stopPropagation();
    var url = $("#fileURL").val();
    var specVersion = $("#specMenu").val();
      var validCaptcha = Meteor.call("validateCaptcha",Recaptcha.get_challenge(),Recaptcha.get_response(),function(err,res){
        if(err){
          console.log("err captcha",err);
          FlashMessages.sendError('['+err.error+'] '+err.reason);
        }
        if(res){ //valid Captcha
          console.log("res captcha",res)
          Meteor.call('validateSchemaFromURL',url,specVersion,function(error,result){
            if(result){
              Meteor.call('addAPIFile',url,function(error_,result_){
                console.log("ERRRR",error_);
                if(error_)
                  FlashMessages.sendError('['+error_.error+'] '+error_.reason)

                if(result_){
                  FlashMessages.sendInfo("Thank you for your submission, it should be added to the Database soon");
                  Router.go('home');
                }
              });

             
            }else{
              console.log("validateSchemaFromURL error from frontend",error);
              FlashMessages.sendError(error);
            }
          });
        }
      });
      // //validate vCard format
      // card.readData(response.content,function(err, json){
      //   if(json)
      //     done(null, true);
      //   else
      //     done(err,null);
      //   return validCard;
      // });
    // });
    
    return false;
  }
});


AutoForm.hooks({
  insertAPIForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      //1. Valid URL
      //2. Valid Recaptcha
      //3. Valid format
      //4. Insert
      var URI = Meteor.require('URIjs');

      var uri = new URI(insertDoc.url);
      console.log(uri);
      console.log(new URI("hiha/jaijia"));

      // //Is the value submitted an url ?
      // var isValidUrl = APIFiles.simpleSchema().namedContext().validateOne({url: insertDoc.url}, "url", {modifier: false});
      // if(!isValidUrl){
      //   FlashMessages.sendError('Submit a valid URL to a apis.json file');
      //   return false;
      // }

      // Meteor.call('validateSchemaFromURL',insertDoc.url,function(err,ress){

      // });

      // Valid URL, what about the format of the file ?
      Meteor.call("validateFormatFromURL",insertDoc.url,function(error,result){
        if(error){
          if(_.isArray(error.reason))
            FlashMessages.sendError('['+error.error+'] '+error.reason[0].message);
          else
            FlashMessages.sendError('['+error.error+'] '+error.reason);
        }
        if(result=="valid"){
          console.log(result);
          //Test captcha and insert
          Meteor.call("validateAndInsert",Recaptcha.get_challenge(),Recaptcha.get_response(),insertDoc,function(err,res){
            if(err && err.error==400){
              Recaptcha.reload();
              FlashMessages.sendError("Wrong captcha");
            }
            if(res=="ok"){
              FlashMessages.sendInfo("Thank you for your submission, should be added to the Database soon");
              Router.go('home');
            }
          });
        }
      });
      return false;
    },
  	onError: function(operation, error, template) {
  		console.log(error);
      console.log(operation);
      console.log(template);
  	}
  }
});

Template.addNewAPI.rendered = function () {
  Recaptcha.create("6Lf-3vISAAAAAFzYNRv00qN12UP0f3VOyt66To5r",
    "recaptchaDiv",
    {
      theme: "red",
      callback: Recaptcha.focus_response_field
    }
  );
};

Template.addAPI.rendered = function () {
  Recaptcha.create("6Lf-3vISAAAAAFzYNRv00qN12UP0f3VOyt66To5r",
    "recaptchaDiv",
    {
      theme: "red",
      callback: Recaptcha.focus_response_field
    }
  );
};