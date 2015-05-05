Router.map(function () {
    this.route('index', {
      path: '/',
      template: 'home',
      waitOn: function(){
        // if(this.params.search)
          // return [Meteor.subscribe('apisFiles'),Meteor.subscribe('apis'),Meteor.subscribe('maintainers')];
          return [Meteor.subscribe('apisCount'),Meteor.subscribe('maintainersCount')]
      },
      onBeforeAction: function(){
        Session.set('active', 'home');

        var search_val = this.params.query.search;
        if(this.params.query.limit)
            Session.set('paging_limit',parseInt(this.params.query.limit,10))

        if(this.params.query.offset)
            Session.set('paging_skip',parseInt(this.params.query.offset,10))

        // If search parameter specified
        if(search_val){
          // Search is string or 'tag:keyword' or '*'
          var reg = new RegExp(/(tag)(:)( )*((?:[a-z0-9]*))/i);
          if(search_val.match(reg)) {
            var arr = search_val.split(":");
            switch(arr[0]){
              case 'tag':
                Session.set("search_tags", arr[1].trim());
                break;
              default:
                FlashMessages.sendError("Search format is incorrect");
                break;
            }
          }else{ //normal search
            if(search_val=="*")
              Session.set("search_keywords"," ");
            else
              Session.set("search_keywords", search_val)//.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\$&")); //taken from atmosphere repo
          }
        }else{ //load home page
          Meteor.subscribe('lastFiveAPIsModified')
        }

        Meteor.call("sendKeenEvent","pathCollection",{path:'/'});
        GAnalytics.pageview();
        this.next()
      }
   })
})
