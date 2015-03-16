sitemaps.add('/sitemap.xml', function() {
    var updatedDate = "03/16/2015"
  // required: page
  // optional: lastmod, changefreq, priority, xhtmlLinks, images, videos
  return [
    { page: '/apis/add', lastmod: new Date(updatedDate) },
    { page: '/lint', lastmod: new Date(updatedDate), changefreq: 'monthly' },
    { page: '/builder', lastmod: new Date(updatedDate), changefreq: 'monthly'},
    { page: '/apiDoc', lastmod: new Date(updatedDate), changefreq: 'monthly'},
    { page: '/faq', lastmod: new Date(updatedDate), changefreq: 'monthly'},
    { page: '/about', lastmod: new Date(updatedDate), changefreq: 'monthly'},
    { page: '/about?jojo', lastmod: new Date(updatedDate), changefreq: 'monthly'}
  ];
});

sitemaps.add('/allAPIs_sitemap.xml', function() {
  var out = [];
  var apis = APIs.find().fetch();
  _.each(apis, function(api) {
    //   var url = new URL(Meteor.absoluteUrl('?search='+api.name))
    out.push({
      page: '?search='+api.name.replace('&','&amp;'),
      lastmod: api.updatedAt,
      changefreq: 'monthly'
    });
  });
  return out;
});
