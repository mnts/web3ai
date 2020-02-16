$(function(ev){
  var $p = $('<p>', {class: 'field'}).text('Type').appendTo('#user-info-fields'),
      id = 'user-types',
      $subs = $('<div>', {class: 'tip', id: id}).appendTo('body');

  var $input = $('<input>', {
    name: 'type',
    readonly: 'true'
  }).tip({
    pos: 't',
		id: id,
  }).appendTo($p);

  var types = [
    {name: 'student', title: 'Student/user'},
    {name: 'advisor', title: 'Advisor/manager'},
    {name: 'organization', title: 'Organization/admin'}
  ];

  types.forEach(function(plan){
    var $plan = $('<div>', {class: 'option', name: plan.name}).text(plan.title);
    $plan.data(plan);
    $plan.appendTo($subs);
  });

  $subs.append("<span class='tri'></span>").on('click', '.option', function(){
    $input.val($(this).attr('name')).addClass('changed');
  });
})
