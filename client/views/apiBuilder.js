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

Template.editorForm.rendered = function () {

  //add created and modified value

  var element = document.getElementById('formBuilder')
  var editor = new JSONEditor(element,{
    disable_edit_json:true,
    disable_array_reorder:true,
    disable_properties:true,
    theme:'bootstrap3',
    show_errors:"always",
    iconlib: "fontawesome4",
    schema:{
        "type": "object",
        "title":"APIs.json",
        "properties": {
          "name": {
            "type": "string",
            "required":true,
            "description": "The name of the service described"
          },
          "description": {
            "type": "string",
            "format":"textarea",
            "required":true,
            "description": "Description of the service"
          },
          "url": {
            "type": "string",
            "format": "url",
            "pattern": "^(http)|(https)://(.*)$",
            "required":true,
            "description": "URL where the apis.json file will live"
          },
          "image": {
            "type": "string",
            "format": "url",
            "required":true,
            "pattern": "^(http)|(https)://(.*)$",
            "description": "Image URL to illustrate the API on APIs.io"
          },
          "specificationVersion":{
            "type":"string",
            "enum":["0.14"],
            "default":"0.14",
            "required":true
          },
          "apis": {
            "type": "array",
            "minItems":1,
            "items": {
              "$ref": "#/definitions/api"
            }
          },
          "maintainers": {
            "type": "array",
            "minItems":1,
            "items": {
              "$ref": "#/definitions/contact_def"
            },
            "description": "Maintainers of the apis.json file"
          },
          "tags": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/tags"
            },
            "description": "Tags to describe the service"
          },
          "include": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/include"
            },
            "description": "Links to other apis.json definitions included in this service"
          }
        },
        "definitions": {
          "tags": {
            "type": "string"
          },
          "include": {
            "type":"object",
            "description": "Include other APIs.json file",
            "required": [
              "name", "url"
            ],
            "properties": {
              "name": {
                "type": "string"
              },
              "url": {
                "type": "string",
                "pattern": "^(http)|(https)://(.*)$"
              }
            }
          },
          "urls": {
            "type":"object",
            "description": "A representation of a URL",
            "required": [
              "type", "url"
            ],
            "properties": {
              "type": {
                "type": "string",
                "pattern": "^(Swagger)$|^(RAML)$|^(Blueprint)$|^(WADL)$|^(WSDL)$|^(TermsOfService)$|^(InterfaceLicense)$|^(StatusPage)$|^(Pricing)$|^(Forums)$|^(AlertsTwitterHandle)$|^(X-[A-Za-z0-9\\-]*)$"
              },
              "url": {
                "type": "string",
                "pattern": "^(http)|(https)://(.*)$"
              }
            }
          },
          "contact_def": {
            "type": "object",
            "properties": {
              "FN":{
                "required":true,
                "type":"string",
                "title":"Full name"
              },
              "email":{
                "type":"string",
                "format" : "email",
                "title":"email",
                "required":false
              },
              "organizationName":{
                "type":"string",
                "title":"organization name"
              },
              "adr":{
                "type":"string",
                "title":"Adress"
              },
              "tel":{
                "type":"string",
                "title":"Telephone"
              },
              "X-twitter":{
                "type":"string",
                "title":"Twitter"
              },
              "X-github":{
                "type":"string",
                "title":"github"
              },
              "photo":{
                "type":"string",
                "pattern": "^(http)|(https)://(.*)$",
                "title":"Photo",
                "required":false
              },
              "vCard":{
                "type":"string",
                "pattern": "^(http)|(https)://(.*)$",
                "title":"vCard",
                "required":false
              },
              "url": {
                "type": "string",
                "pattern": "^(http)|(https)://(.*)$",
                "title":"URL",
                "required":false
              }
            }
          },
          "api":{
            "type":"object",
            "properties":{
              "name": {
                "type": "string",
                "description": "name",
                "required":true
              },
              "description": {
                "type": "string",
                "description": "description of the API",
                "required":true
              },
              "image": {
                "type": "string",
                "description": "Image URL to illustrate the API on APIs.io",
                "required":true
              },
              "baseURL": {
                "type": "string",
                "pattern": "^(http)|(https)://(.*)$",
                "description": "baseURL",
                "required":true
              },
              "humanURL": {
                "type": "string",
                "pattern": "^(http)|(https)://(.*)$",
                "description": "humanURL",
                "required":true
              },
              "tags":{
                "title":"tags",
                "type":"array",
                "items":{
                  "$ref": "#/definitions/tags"
                }
              },
              "properties": {
                "type": "array",
                "required":true,
                "items": {
                  "$ref": "#/definitions/urls"
                },
                "description": "URLs"
              },
              "contact":{
                "title":"contact",
                "type":"array",
                "required":true,
                "items":{
                  "$ref": "#/definitions/contact_def",
                  "minItems": 1
                }
              }
            }
          }
        }
      }

  });

  document.getElementById('submit').addEventListener('click',function() {
      var doc = editor.getValue();
      var today = new Date();
      doc['created']= moment(today).format('YYYY-MM-DD');
      doc['modified']= moment(today).format('YYYY-MM-DD');

      var blob = new Blob([EJSON.stringify(doc,{indent: true})], {type: "application/json;charset=utf-8"});
            saveAs(blob, "apis.json");
      });
};
