window.Account = {
  init: () => {
    $('#account-save').click(ev => {
      var info = {};

      var formPref = document.forms['account-preferences'];
      for(var i = 0, input; input = formPref.elements[i++];){
        if(input.value)
          info[input.name] = input.value;
      };

      Acc.update({
        pref: Account.readPreferences()
      });

      $('#account-save').blink('green');

      ev.preventDefault();
      return false;
    });

    $('#account-birth').datepicker({
      formatDate:	'm/d/Y'
    });
  },

  buildPreferences: id => {
    $('#account-prefer').empty();
    return new Promise(function(resolve, reject){
      W({
        cmd: 'load',
        filter: {
          tid: id
        },
        collection: 'tree'
      }, r => {
        var ids = [];
        (r.items || []).forEach(item => {
          ids.push(item.id);
          var $block = $('<div>', {id: 'prefer_'+item.id}).appendTo('#account-prefer');
          $block.data(item);
          $block.append('<h4>'+item.description+'</h4>');
        });

        W({
          cmd: 'load',
          filter: {
            tid: {$in: ids}
          },
          collection: 'tree'
        }, r => {
          (r.items || []).forEach(item => {
            var $selection = $('<div>').data(item);
            var $check = $("<span>", {class: 'check'}).appendTo($selection);
            $('<span>', {class: 'text'}).appendTo($selection)
            .text(item.title).click(ev => {
              $check.click();
            });
            $selection.appendTo('#prefer_'+item.tid);
          });

          resolve();
        });
      });
    });
  },

  setPreferences: (pref) => {
    pref = pref || Acc.user.pref || [];
    if(!pref.length) return;

    $('#account-prefer .check').removeClass('v').each(function(){
      var item = $(this).parent().data();
      console.log(item);
      if(pref.indexOf(item.name)+1) $(this).addClass('v');
    });
  },

  readPreferences: () => {
    var pref = [];

    $('#account-prefer .check.v').each(function(){
      var item = $(this).parent().data();
      if($(this).hasClass('v'))
        pref.append(item.name);
    });

    return pref;
  }
};
