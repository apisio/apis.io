/* Subscriptions */
// Meteor.subscribe('apis');
// Meteor.subscribe('maintainers');

$(window).scroll(function(e){ 

  $el = $(".navbar"); 
  if ($(this).scrollTop() > 200 && $el.css('position') != 'fixed'){ 
    // UI.insert( UI.render(Template.navbar), document.body );
    $(".navbar").css({'position':'fixed','top':'0px','width':'100%'});
  }
  if ($(this).scrollTop() < 200 && $el.css('position') == 'fixed')
  {
    $('.navbar').css({'position': 'static', 'top': '0px'}); 
  } 
});