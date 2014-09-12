APIs = new Meteor.Collection("APIs");

// APIs.attachSchema(apiSchema);

APIs.allow({
    'insert': function (userId,doc) {
        /* user and doc checks ,
        return true to allow insert */
        return true; 
    },
    'update': function(){
        return true;
    }
});