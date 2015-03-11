Router.map(function () {
    this.route('maintainers.show',{
    	path: '/maintainers/:slug',
    	template: 'maintainerShow',
      waitOn: function(){
        return [Meteor.subscribe('maintainer',this.params.slug),Meteor.subscribe('apisFilesByMaintainer',this.params.slug)];
      },
      yieldTemplates: {
        'navbar': {to: 'navbar'},
      },
      onBeforeAction:function(){
        GAnalytics.pageview();
        Meteor.call("sendKeenEvent","pathCollection",{path: this.path});
        this.next()
      },
    	data: function() {
    		return {
          apiFiles: APIFiles.find({$or:[{"maintainers.slug": this.params.slug},{"maintainer.slug": this.params.slug}]}),
          maintainer: Maintainers.findOne({slug: this.params.slug})
        }
      }
    });
})
