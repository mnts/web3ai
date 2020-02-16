$(function(){
  var App = window.Orders = Site.apps.orders = {
  initApp: function(){
    App.$ = $('<div>', {class: 'app', id: 'orders'}).appendTo('body');
    $('<div>', {id: 'orders-list', class: 'list'}).appendTo('#users');
    App.initTable();

    App.$header = $('<footer>').appendTo(App.$);
  },

  open: p => {
    App.loadTable();
  },

  tableAttr: ['id', 'transaction_id', 'price', 'client', 'sweep', 'order', 'wonOrder', 'scratch', 'date', 'type', 'who', 'host', 'description', 'actions'],
  tableHead: [
    {
      name: 'id',
      title: '#',
      width: 30
    },

    {
      name: 'transaction_id',
      title: 'transaction#',
      width: 50
    },

    {
      name: 'price',
      title: 'Price',
      mod: item => {
        return (item.price || 0)+'$'
      },
      width: 60
    },

    {
      name: 'client',
      title: 'Client info',
      mod: item => {
        if(!item.user) return '';
        return item.user.firstName +' '+ item.user.lastName+' '+ item.user.phone+' '+ item.user.email;
      },
      width: 60
    },

    {
      name: 'sweep',
      title: 'Sweep',
      mod: item => {
        if(!item.sweep) return '';
        return item.sweep;
        return new Date(item.sweep).format('%F %H:%M')
      },
      width: 110
    },

    {
      name: 'order',
      title: 'WordOrder',
      mod: item => {
        if(!item.order) return 'no';
        return item.order.join(',')
      },
      width: 60
    },

    {
      name: 'wonOrder',
      title: 'WO Won time?',
      mod: item => {
        if(!item.wonOrder) return 'no';
        return new Date(item.wonOrder).format('%F %H:%M')
      },
      width: 110
    },

    {
      name: 'scratch',
      title: 'Scratch',
      mod: item => {
        if(!item.scratch) return 'no';
        return (item.scratchBig?'!':'')+'#'+item.scratch
      },
      width: 60
    },

    {
      name: 'created',
      title: 'date',
      mod: item => {
        if(!item.created) return '';
        return new Date(item.created).format('%F %H:%M')
      },
      width: 110
    },

    {
      name: 'type',
      title: 'Type',
      width: 50
    },

    {
      name: 'title',
      title: 'Title',
      width: 150,
      mod: item => {
        return Acc.fullName(item)
      },

      ready: function($td){
      }
    },
    {
      name: 'host',
      title: 'host',
      width: 140
    },

    {
      name: 'description',
      title: 'Description',
    },
    {
      title: 'Actions',
      ready: function($td){
        var item = $td.closest('tr').data();
        var $remove = $('<button>', {class: 'order-remove fa fa-times'})
        .appendTo($td).click(ev => {
          App.remove(item.id);
        });
      }
    }
  ],

  initTable: function(){
    var $table = $('<table>', {id: 'orders-table', class: 'list'}).appendTo('#orders'),
        $thead = $('<thead>').appendTo($table),
        $tbody = $('<tbody>', {id: 'orders-tbody'}).appendTo($table),
        $tr = $('<tr>').appendTo($thead);

      App.tableHead.forEach(item => {
        var $th = $('<th>').appendTo($tr).text(item.title);
        $th.data(item);
        if(item.width) $th.width(item.width);
      });

      $('#orders-table').on('change', 'input.text', function(ev){
        var $input = $(this),
            item = $input.closest('tr').data();

        console.log($input);

        var set = {};
        set[this.name] = this.value;
        App.update(item.id, set);
      });
  },

  buildTr: function(item){
    var $item = $('<tr>', {class: 'order', id: 'orderT-'+item.id});
    $item.data(item);

    $('#orders-table > thead > tr > th').each(function(){
      var $th = $(this),
          th = $th.data(),
          $td = $('<td>').appendTo($item);

      var val = th.name?item[th.name]:'';

      if(th.mod) $td.append(th.mod(item));
      else if(th.edit){
        var $input = $('<input>', {spellcheck: false, name: th.name, class: 'text'});
        $input.val(val).appendTo($td);
      }
      else $td.text(val);

      if(th.ready) th.ready($td);
    });

    return $item;
  },

  loadTable: function(){
    W({
      cmd: 'load',
      collection: 'orders',
      sort: {time: 1}
    }, function(r){

      var $list = $('#orders-tbody').empty();
      $('#orders-table').show().siblings('.list').hide();

      (r.items || []).forEach(item => {
        var $item = App.buildTr(item);
        $list.append($item);
      });
    });
  }
};

  App.initApp();
});
