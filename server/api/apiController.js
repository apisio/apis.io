APIcontroller = RouteController.extend({
    onBeforeAction:function(){
        //FIXME better way of doing this?

        var next = this.next
        var metric = {}
        metric["name"] =this.options.route.getName().replace(/api./,'').replace('.','_')

        //Auth with 3scale
        var ThreeScale = Meteor.npmRequire('3scale').Client;

        var client = new ThreeScale(Meteor.settings.private.threeScale.provider_key);

        client.authorize({ app_id: Meteor.settings.private.threeScale.app_id,
                 app_key: Meteor.settings.private.threeScale.app_key }, function(response){
          if(response.is_success()) {
                var trans = [{"app_id": "3a607f22", "usage": {}}];
                trans[0]["usage"][metric['name']]=1
                client.report(trans, function (response) {
                    // console.log(response);
                });
                next();
          } else {
              throw new Error("not authorized " + response.error_message);
          }
        });

    }
})
