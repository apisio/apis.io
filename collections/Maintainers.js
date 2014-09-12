 Maintainers = new Meteor.Collection("maintainers");
// Maintainers = new Meteor.Collection("maintainers", {
//     schema: new SimpleSchema({
//         name: {
//             type: String,
//             label: "name",
//             max: 200,
//         },
//         slug: {
//             type: String,
//             label: "slug",
//             max: 80,
//             optional: true,
//             autoValue: function() {
//               if (this.field('name').isSet) {
//                 return URLify2(this.field('name').value);
//               }
//             },
//         },
//         twitter: {
//             type: String,
//             label: "twitter",
//             max: 200,
//             optional:true,
//         },
//         facebook: {
//             type: String,
//             label: "facebook",
//             max: 200,
//             optional:true,
//         },
//         github: {
//             type: String,
//             label: "github",
//             max: 200,
//             optional:true,
//         },
//         linkedin: {
//             type: String,
//             label: "linkedin",
//             max: 200,
//             optional:true,
//         },
//         website: {
//             type: String,
//             label: "website",
//             max: 200,
//             optional:true,
//         },
//         email: {
//             type: String,
//             label: "email",
//             max: 200,
//             optional:true,
//         },
//     })
// });

Maintainers.allow({
    'insert': function (userId,doc) {
        /* user and doc checks ,
        return true to allow insert */
        return true; 
    },
    'update': function(){
        return true;
    }
});