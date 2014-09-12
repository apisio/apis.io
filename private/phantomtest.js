// Put your URL below, no "?_escaped_fragment_=" necessary
var url = "http://apisearch.dev:3000/";
var page = require('webpage').create();
 
console.log('Loading page...');
page.open(url, function(status) {
    console.log('Page load status: ' + status);
    if (status == 'fail')
        phantom.exit();
 
    var lastOut = '';
    setInterval(function() {
      var ready = page.evaluate(function () {
        if (typeof Meteor !== 'undefined'
            && typeof(Meteor.status) !== 'undefined'
            && Meteor.status().connected) {
          Deps.flush();
          return DDP._allSubscriptionsReady();
        }
        return false;
      });
      if (ready) {
        var out = page.content;
        out = out.replace(/<script[^>]+>(.|\n|\r)*?<\/script\s*>/ig, '');
        out = out.replace('<meta name=\"fragment\" content=\"!\">', '');
        console.log(out);
        phantom.exit();
      } else {
        var out = 'not ready';
        if (typeof Meteor !== 'undefined') {
            if (typeof(Meteor.status) !== 'undefined') {
                if (Meteor.status().connected) {
                    out += ', all subs ready: ' + DDP._allSubscriptionsReady();
                } else {
                    out += ', Meteor not connected';
                }
            } else {
                out += ', Meteor.status undefined';
            }
        } else {
            out += ', Meteor undefined';
        }
        if (lastOut !== out) {
            // console.log(page.content);
            console.log(out);
            lastOut = out;
        }
      }
    }, 100);
 
});