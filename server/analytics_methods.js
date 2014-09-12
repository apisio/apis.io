var Keen = Meteor.require('keen.io');
var keen = Keen.configure({
	projectId: Meteor.settings.private.keen.projectId,
	writeKey: Meteor.settings.private.keen.writeKey,
});

parser = Meteor.require('ua-parser');
geoip = Meteor.require('geoip-lite');

Meteor.methods({
	trackOutbound: function(keenEvent){
		var collection ="outboundCollection";
		// console.log(keenEvent);con
		if(process.env.ENV!="DEV"){
			keen.addEvent(collection, keenEvent);
		}
	},
	sendSimpleKeenEvent: function (collection,keenEvent) {
		if(process.env.ENV!="DEV"){
			keen.addEvent(collection, keenEvent);
		}
	},
	sendKeenEvent: function (collection,keenEvent) {
	  	//inspired by https://github.com/andrewreedy/meteor-visit-tracker/blob/master/server.js
	  	var self = this;
	    var h, r, visit, ip, geo, id;
	    // Get the headers from the method request
	    h = headers.get(self);

	    // Parse the user agent from the headers
	    r = parser.parse(h['user-agent']);

	    // Autodetect spiders and only log visits for real users
	    if (r.device != 'spider') {

	      // Get the IP address from the headers
	      ip = self.connection.clientAddress;

	      // Geo IP look up for the IP Address
	      geo = geoip.lookup(ip);

	      // Build the visit record object
	      visit = {
	        referer: h.referer,
	        ipAddress: ip,
	        userAgent:  {
	          raw: r.string,
	          browser: r.userAgent,
	          device: r.device,
	          os: r.os
	        },
	        geo: geo
	      };

	      keenEvent.identity=visit;
	      // console.log(keenEvent);
	      if(process.env.ENV!="DEV"){
  		    keen.addEvent(collection, keenEvent);
	      }
	    } else {
	      return 'Spider Detected'
	    }
	  },	
});