if (Meteor.isClient) {
  Meteor.startup(function () {
    reCAPTCHA.config({
        theme: 'light',  // 'light' default or 'dark'
        publickey: Meteor.settings.public.recaptcha.publickey
    });
  });
}
