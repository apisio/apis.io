if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    console.log("APP LAUNCHED IN "+process.env.ENV);
    reCAPTCHA.config({
        privatekey: Meteor.settings.private.recaptcha.privateKey
    });
  });
}
