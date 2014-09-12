Template.APIlint.rendered = function () {
	$("#apijsonContent").linedtextarea();
};

Template.schemaLinter.events({
	'click button': function () {
		var protocol = /^(https?|ftp):\/\//;
		if($("#apijsonContent").val().match(protocol)!=null){ //URL
			Meteor.call('validateSchemaFromURL',$("#apijsonContent").val(),$("#specMenu").val(),function(error,result){
			 	if(result)
					FlashMessages.sendSuccess('Valid format');
				else
					FlashMessages.sendError(error);
			});
		}else{
			Meteor.call('validateSchema',$("#apijsonContent").val(),$("#specMenu").val(),function(error,result){
			 	if(result)
					FlashMessages.sendSuccess('Valid format');
				else
					FlashMessages.sendError(error);
			});
		}
		
	}
});