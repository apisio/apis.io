if (Meteor.isServer) {
  Meteor.startup(function () {
  	
    // code to run on server at startup
    console.log("APP LAUNCHED IN "+process.env.ENV);
  });
}
