if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    reCAPTCHA.config({
        privatekey: Meteor.settings.private.recaptcha.privateKey
    });
  });
}
