window.Users = {
  initApp: function(){
    $('<div>', {class: 'app', id: 'users'}).appendTo('body');
    $('<div>', {id: 'users-list', class: 'list'}).appendTo('#users');
    Users.initTable();

    Users.$header = $('<footer>').appendTo('#users');


    $('<button>', {class: 'a', id: 'users-loadGrid'}).click(ev => {
      Users.load();
    }).text('Grid').appendTo(Users.$header);

    $('<button>', {class: 'a', id: 'users-loadTable'}).css({'margin-left': '-7px'}).click(ev => {
      Users.loadTable();
    }).text('Table').appendTo(Users.$header);

    User.init();
    Users.initInvitation();
  },

  initInvitation: () => {
    var $form = $(`<form name='inviteAdvisor' id='inviteAdvisor' class='modal'>
      <input name='firstName' placeholder='First name'/>
      <input name='lastName' placeholder='Last name'/>
      <input name='email' placeholder='Email'/>
      <input name='phone' placeholder='Phone'/>
      <button name='ok' type='submit'>Invite</submit>
    </form>`).appendTo(document.body);

    $form[0].onsubmit = ev => {
      var form = ev.target;
      ev.preventDefault();

      var user = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        owner: Acc.user.id,
        type: 'advisor'
      };

      var invitation = {
        tid: Cfg.givhub.invitations_tid,
        user,
        title: user.firstName+' '+user.lastName,
        start: (new Date).getTime(),
        description: 'GivHub advisor invitation',
        owner: Acc.user.id,
        from: 'GivHub <info@mygivmo.com>',
        subject: 'GivHub advisor invitation',
        type: 'invitation'
      };

      Tree.add(invitation).then(item => {
        let context = {tid: item.id, user, acc: Acc.user};
        console.log(context, item);
        W({cmd: 'whiskers', fid: Cfg.givhub.inviteAdv_tpl, context}, r => {
          Tree.set(item.id, {file: r.fid});

          $(form.ok).blink('green');
          if(r.ok) alert('Invitation sent');
          $('#modal').click();
        });
      });
    }

    $('<button>', {class: 'a fr'}).click(ev => {
      UI.modal('#inviteAdvisor');
    }).text('Invite advisor').appendTo(Users.$header);
  },

  tableAttr: ['id', 'title', 'email', 'name', 'date', 'type', 'firtName', 'lastName', 'actions'],
  tableHead: [
    {
      name: 'id',
      title: '#',
      width: 30
    },
    {
      name: 'image',
      title: 'Image',
      width: 50,
      mod: item => {
        var file = item.image || item.avatar || item.photo;
        if(file){
          var img = new Image;
          img.src = Cfg.files + file;
          return img;
        }
      }
    },
    {
      name: 'title',
      title: 'Title',
      edit: true,
      mod: item => {
        return Acc.fullName(item)
      },

      ready: function($td){
        $td.addClass('clickable');
        var user = $td.closest('tr').data();
        $td.click(function(){
          User.open(user.id);
        });
      }
    },
    {
      name: 'email',
      title: 'E-mail',
      edit: true,
      width: 180
    },
    {
      name: 'name',
      title: 'userName',
      edit: true,
      width: 140
    },
    {
      name: 'regTime',
      title: 'date',
      mod: item => {
        if(!item.regTime) return '';
        return new Date(item.regTime).format('%F %H:%M')
      },
      width: 110
    },
    {
      name: 'type',
      title: 'Type',
    },
    {
      name: 'firstName',
      title: 'First Name',
      edit: true,
      width: 100
    },
    {
      name: 'lastName',
      title: 'Last Name',
      edit: true,
      width: 100
    },
    {
      title: 'Actions',
      ready: function($td){
        var user = $td.closest('tr').data();
        var $remove = $('<button>', {class: 'user-remove fa fa-times'})
        .appendTo($td).click(ev => {
          Users.remove(user.id);
        });
      }
    }
  ],

  initTable: function(){
    var $table = $('<table>', {id: 'users-table', class: 'list'}).appendTo('#users'),
        $thead = $('<thead>').appendTo($table),
        $tbody = $('<tbody>', {id: 'users-tbody'}).appendTo($table),
        $tr = $('<tr>').appendTo($thead);

      Users.tableHead.forEach(item => {
        var $th = $('<th>').appendTo($tr).text(item.title);
        $th.data(item);
        if(item.width) $th.width(item.width);
      });

      $('#users-table').on('change', 'input.text', function(ev){
        var $input = $(this),
            user = $input.closest('tr').data();

        console.log($input);

        var set = {};
        set[this.name] = this.value;
        Users.update(user.id, set);
      });
  },

  buildTr: function(user){
    var $user = $('<tr>', {class: 'user', id: 'userT-'+user.id});
    $user.data(user);

    $('#users-table > thead > tr > th').each(function(){
      var $th = $(this),
          th = $th.data(),
          $td = $('<td>').appendTo($user);

      var val = th.name?user[th.name]:'';

      if(th.mod) $td.append(th.mod(user));
      else if(th.edit){
        var $input = $('<input>', {spellcheck: false, name: th.name, class: 'text'});
        $input.val(val).appendTo($td);
      }
      else $td.text(val);

      if(th.ready) th.ready($td);
    });

    return $user;
  },


  build: function(user){
    var $user = $('<div>', {class: 'user', id: 'user-'+user.id});
    $user.data(user);

    var file = user.image || user.avatar || user.photo;
    var $image = $('<div>', {class: 'user-image'}).appendTo($user);
    if(file) $image.css({
      'background-image': 'url('+Cfg.files+file+')',
      'background-size': 'cover'
    });

    var title = Acc.fullName(user);
    var $title = $('<p>', {class: 'user-title'}).text(title).appendTo($user);

    $image.add($title).click(function(ev){
      User.open(user.id);
    });

    var $name = $('<p>', {class: 'user-name'}).text(user.name).appendTo($user)

    $('<span>', {class: 'user-id'}).text(user.id).appendTo($name)
      .prepend('&nbsp;<i class="fa fa-hashtag"></i>');

    if(user.email)
      $('<p>', {class: 'user-email'}).text(user.email).appendTo($user)
        .prepend('<i class="fa fa-envelope"></i>');

    $('<p>').appendTo($user).text(new Date(user.time || user.regTime).format('%F %H:%M'))
      .prepend('<i class="fa fa-clock-o"></i>');


    return $user;
  },

  load: function(){
    var filter = {};
    if(!Acc.user.super) filter.owner = Acc.user.id;

    W({
      cmd: 'load', filter,
      collection: 'acc',
      sort: {time: -1}
    }, function(r){
      $('#users-loadGrid').addClass('on');
      $('#users-loadTable').removeClass('on');

      var $list = $('#users-list').empty().show();
      $list.siblings('.list').hide();

      (r.items || []).forEach(item => {
        var $item = Users.build(item);
        $list.append($item);
      });
    });
  },

  update: function(id, set){
    return new Promise(function(resolve, reject){
      W({
        cmd: 'update',
        collection: 'acc',
        set: set,
        id: id
      }, function(r){
        r?resolve(r.item):reject();

        if(r.item){
          Users.rebuild(r.item);
        }
      });
    });
  },

  remove: function(id){
    return new Promise(function(resolve, reject){
      if(confirm('Remove user #'+id+' ?'))
        W({
          cmd: 'removeUser',
          id: id
        }, function(r){
          if(r.done){
            if($('#users-table').is(':visible')){
              $('#userT-'+id).hide('fast', ev => {
                $('#userT-'+id).remove();
                resolve(r);
              });
            }

            if($('#users-list').is(':visible')){
              $('#user-'+id).hide('fast', ev => {
                $('#user-'+id).remove();
                resolve(r);
              });
            }
          }
          else
            reject();
        });
    });
  },

  loadTable: function(){
    if(!Acc.user) return;
    var filter = {};
    if(!Acc.user.super) filter.owner = Acc.user.id;

    W({
      cmd: 'load', filter,
      collection: 'acc',
      sort: {time: -1}
    }, function(r){
      $('#users-loadGrid').removeClass('on');
      $('#users-loadTable').addClass('on');

      var $list = $('#users-tbody').empty();
      $('#users-table').show().siblings('.list').hide();

      (r.items || []).forEach(item => {
        var $item = Users.buildTr(item);
        $list.append($item);
      });
    });
  },

  rebuild: function(user){
    if($('#users-table').is(':visible')){
      var $user = Users.buildTr(user);
      $('#userT-'+user.id).replaceWith($user);
    }

    if($('#users-list').is(':visible')){
      var $user = Users.build(user);
      $('#user-'+user.id).replaceWith($user);
    }
  }
};

$(function(){
  Users.initApp();

  $('<div>', {id: 'user'}).appendTo('#catalogem');
});

Site.ready.push(function(){

  $('#user').on('change', 'input', function(){
    $(this).addClass('changed');
  });
});

Acc.on.push(function(){
  Users.loadTable();
});
