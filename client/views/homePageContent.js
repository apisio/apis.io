Template.homePageContent.helpers({
    newAPIs: function(){
        if(!Session.get('nb_results')){
            var apis =  APIs.find({},{limit:5,fields:{name:1,updatedAt:1,apiFileUrl:1,slug:1},sort: {updatedAt: -1}})
            apis.fetch().forEach(function(api){
                console.log(api.slug)
                Meteor.subscribe('apisFileFromAPISlug',api.slug)
            })
            return apis;
        }
    },
    searchQuery:function(){
        return 'search='+this.name
    }
})

Template.homePageContent.rendered= function(){
    Meteor.subscribe('lastFiveAPIsModified')
}
