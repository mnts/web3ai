window.Membership = Site.apps.membership = {
  plan: {
    merchant_preferences: Cfg.membership.merchant_preferences,
    name: Cfg.membership.name,
    description: Cfg.membership.description,
    type: "INFINITE",
  },

  init: () => {
    Cfg.membership.plans.forEach(item => {
      if(!item.title) return;
      var $item = $('<div>').data(item);

      $('<h3>').text(item.title).appendTo($item);
      $('<p>').html(item.description).appendTo($item);
      $('<h4>').text('$'+item.priceYear+'/year').appendTo($item);
      $('<p>').html('or<br/>$'+item.priceMonth+'/month').appendTo($item);
      $('<button>', {class: 'purchase'}).text('PURCHASE')
      .appendTo($item).click(ev => {
        if(!Acc.user) Site.openApp('login');

        Membership.item = item;
        $('#membership-yearlyPrice').text(item.priceYear);
        $('#membership-monthlyPrice').text(item.priceMonth);


        UI.modal('#membership-modal');

        $('#membership-payOptions > .select:first-child').click();
        $('#membership-payTypes > .select:nth-child('+(Acc.payment_method?1:2)+')').click();
      });

      $item.appendTo('#membership-plans');
    });

    $('#membership-birth').datepicker({
      formatDate:	'm/d/Y'
    });

    $('#membership-payOptions > .select').click(function(){
      var payDef = $.extend({},
        Cfg.membership.payment_definition,
        Membership.item[($(this).index()?'monthly':'yearly')+'_payment_definition']
      );

      Membership.plan.merchant_preferences.setup_fee = payDef.amount;
      Membership.plan.payment_definitions = [payDef];
    });

    $('#membership-payTypes > .select').click(function(){
      if($(this).index())
        Membership.payer = {
          payment_method: "paypal",
        };
      else
      if(Acc.payment_method){
        Membership.payer = {
          payment_method: "credit_card",
          funding_instruments: [{
            credit_card: _.pick(
              Acc.payment_method, 'number', 'type',
            'expire_year', 'expire_month', 'cvv2',
            'first_name', 'last_name')
            /*
            credit_card_token: {
                "credit_card_id": Acc.payment_method.paypal_id
            }
            */
          }]
        };
      }
      else
        Membership.payer = {
          payment_method: "credit_card"
        };
    });

    $('#membership-plans').on('click', '.purchase', function(){
      var item = $(this).parent().data();
    });

    $('#membership-purchase').click(function(ev){
      $(this).hide();

      $('#membership-purchase').hide();
      $('#membership-loading').show();

      if(!Acc.payment_method && Membership.payer.payment_method == "credit_card")
        return $('#account-setupCard').click();

      var form = document.forms['membership'];

      //Membership.payer.birth = (new Date(form.birth.value)).getTime()/1000;
      //Membership.payer.email = form.email.value;

      W({
        cmd: 'paypal.billing.create',
        plan: Membership.plan,
        payer: Membership.payer,
      }, r => {
        if(r.url){
          var item = _.pick(r, 'token', 'agreement', 'plan');
          item.birth = (new Date(form.birth.value)).getTime()/1000;
          item.email = form.email.value;

          window.open(r.url, '_self');

          /*
          W({
            cmd: 'save',
            item: item,
            collection: 'membership'
          }, () => {
          });
          */
        }
        else{
          $('#membership-purchase').show().blink('red');
          $('#membership-loading').hide();

          if(r.err) alert(r.err.response.message);
        }
      });

      ev.preventDefault();
      return false;
    });
  },

  create: res => {

  },
};

$(function(){
  $('#membership-modal').data({onOpen: modal => {
    $('#membership-purchase').show();
    $('#membership-loading').hide();

    var form = document.forms['membership'];
		form.email.value = Acc.user.email || '';
    $(form.email).focus();
		form.birth.value = Acc.user.birth?((new Date(Acc.user.birth*1000)).short()):'';
  }});
});
