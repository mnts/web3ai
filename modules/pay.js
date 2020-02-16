window.Pay = {
  init: function(){
    Pay.form = document.forms.payMethod;

    $('#account-setupCard').click(function(){
      $('#payMethod-card').show();
      $('#payMethod-paypal').hide();

      $(Pay.form.create).show();
      $(Pay.form.update).hide();

      UI.modal('#payMethod');
    });


    $('#payMethod-select-card').click(ev => {
      $('#payMethod-card').show();
      $('#payMethod-paypal').hide();
    });

    $('#payMethod-select-paypal').click(ev => {
      $('#payMethod-card').hide();
      $('#payMethod-paypal').show();
    });

    $('#payMethod-select-card, #payMethod-select-paypal').click(ev => {
      var $box = $('#payMethod');
		  $box.height(Math.min($box[0].scrollHeight, $('body').height() - 50));
    });

    $(Pay.form.cardNumber).change(function(){
      var t = creditCardType(this.value);
      if(t.length) Pay.form.cardType.value = t[0].type.replace(/-/g, "")
    });


    $('#account-cards').on('click', '.so', function(){
      var $so = $(this),
          $card = $so.closest('.card'),
          item = $card.data();

      Acc.update({payment_method: item.id});
      $so.addClass('active');
      $card.siblings('.card').find('.so').removeClass('active');
    })

    $("#card-month").tip({
  		pos: 'b',
  		id: 'card-months',
      fixed: true,
      event: 'click'
  	});

    $('#card-months > .option').click(function(){
      $('#card-month').val($(this).index()+1);
      $('.tip').hide();
    });

    $("#card-year").tip({
  		pos: 'b',
  		id: 'card-years',
      fixed: true,
      event: 'click'
  	});

    $('#card-years > .option').click(function(){
      $('#card-year').val($(this).text());
      $('.tip').hide();
    });

    $(Pay.form.create).click(ev => {
      Pay.createCard();

      ev.preventDefault();
      return false;
    });

    $(Pay.form.update).click(ev => {
      Pay.updateCard();

      ev.preventDefault();
      return false;
    });
  },

  readCard: function(){
    var item = {
      first_name: Pay.form.firstName.value,
      last_name: Pay.form.lastName.value,
    };

    if($('#payMethod-card').is(':visible')){
      item.method = 'credit_card';
      item.type = Pay.form.cardType.value;
      item.number = Pay.form.cardNumber.value.replace(/\s/g, "");
      item.expire_year = parseInt(Pay.form.expire_year.value);
      item.expire_month = parseInt(Pay.form.expire_month.value);
      item.cvv = item.cvv2 = Pay.form.cvv.value;
    }

    if($('#payMethod-paypal').is(':visible')){
      item.method = 'paypal';
      item.email = Pay.form.email.value;
    }

    return item;
  },

  validateCard: function(item){
    if(!item.first_name) $(Pay.form.firstName).blink('red');
    if(!item.last_name) $(Pay.form.lastName).blink('red');

    return new Promise((resolve, reject) => {
      if(item.method == 'credit_card'){
        if(item.number.length < 16) $(Pay.form.cardNumber).blink('red');
        if(!item.expire_year) $(Pay.form.expire_year).blink('red');
        if(!item.expire_month) $(Pay.form.expire_month).blink('red');
        if(!item.cvv) $(Pay.form.cvv).blink('red');
      }
      else {
        resolve();
      }


      if($(Pay.form).find('.red').length)
        reject();
      else
        W({
        	cmd: 'paypal.credit_card.create',
        	card: _.pick(item, 'expire_month', 'expire_year', 'external_customer_id',
            'first_name', 'last_name', 'number', 'type', 'payer_id')
        }, r => {
          if(!r.card) $(Pay.form.create).blink('red');
          r.card?resolve(r.card.id):reject();
        });
    });
  },

  buildCard: function(item){
    var $item = $('<div>', {class: 'card'});
    $item.data(item);

    if(item.number){
      $('<i>', {class: "card-icon fa fa-credit-card"}).appendTo($item);

      var $active = $('<div>', {class: 'card-active'}).text('Main: ').appendTo($item),
          $so = $('<span>', {class: "so"}).appendTo($active);
      if(Acc.user.payment_method == item.id) $so.addClass('active');

      var number = item.number.replace(/\d{12}(\d{4})/, "xxxx xxxx xxxx $1");

      $('<p>', {class: 'card-email'}).text(item.email).appendTo($item);
      $('<p>', {class: 'card-number'}).text(number).appendTo($item);
      $('<p>', {class: 'card-till'}).text('Valid Thru').appendTo($item);
      $('<p>', {class: 'card-year'}).text(item.expire_year).appendTo($item);
      $('<span>').text('-').appendTo($item);
      $('<p>', {class: 'card-month'}).text(item.expire_month).appendTo($item);
    }

    if(item.email){
      $('<i>', {class: "card-icon fa fa-cc-paypal"}).appendTo($item);
      $('<p>', {class: 'card-email'}).text(item.email).appendTo($item);
    }

    $('<p>', {class: 'card-firstName'}).text(item.first_name).appendTo($item);
    $('<p>', {class: 'card-lastName'}).text(item.last_name).appendTo($item);

    return $item;
  },

  createCard: function(){
    var item = Pay.readCard();
    item.payer_id = item.external_customer_id = 'mess_'+Acc.user.id;

    Pay.validateCard(item).then(function(id){
      item.paypal_id = id;
      W({
        cmd: 'save',
        item: item,
        collection: 'payment_methods'
      }, r => {
        if(!r.item) $(Pay.form.create).blink('red');
        else{
          $('#account-cards .active').removeClass('active');
          Acc.update({payment_method: r.item.id});
          Acc.payment_method = r.item;
          $(Pay.form.create).blink('green');
          setTimeout(function(){
            var $item = Pay.buildCard(r.item);
            $('#account-cards').prepend($item);
            UI.closeModals();

            if($('#membership').is(':visible'))
              UI.modal('#membership-modal');
          }, 600);
        };
      });
    }, () => {
      $(Pay.form.create).blink('red');
    });
  },

  loadCards: function(){
    W({
      cmd: 'load',
      collection: 'payment_methods',
      filter: {
        owner: Acc.user.id
      },
      sort: {time: -1}
    }, function(r){
      var $list = $('#account-cards').empty();

      (r.items || []).forEach(item => {
          var $item = Pay.buildCard(item);
          $('#account-cards').append($item);
      });
    });
  }
};

Acc.on.push(function(){
  if($('#payMethod').is(':visible')) return;

  $.get('/apps/pay.htm', function(r){
    $('#foot').before(r);
    Pay.init();
  });

  if(Acc.user.payment_method)
    W({
      cmd: 'get',
      collection: 'payment_methods',
      id: Acc.user.payment_method
    }, r => {
      if(r.item)
        Acc.payment_method = r.item;
    });
});
