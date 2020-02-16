window.User = {
  init: function(){
    $('<div>', {id: 'user'}).appendTo('#catalogem');
    User.$user = User.$ = $('<div>', {class: 'side right', id: 'user'}).hide().appendTo('#users');


    var $image = $('<div>', {id: 'user-image'}).appendTo(User.$user);
    $('<button>', {id: 'user-image-upl'}).text('Upload').appendTo($image)
    .uploadImage({
      w: 300,
      cb: function(file){
        $('#user-image > img').remove();
        var img = new Image;
        img.onload = () => {
          $image.append(img);

          if(User.id)
            User.update({image: file.id});
        };
        $('#user-image').data(file);
        img.src = Cfg.files + file.id;
      }
    });

    $('<h1>', {id: 'user-title', class: 'usr-l'}).appendTo(User.$user);

    var $regTime = $('<span>', {id: 'user-regTime'});
    $('<p>', {title: 'Registered at', class: 'usr-l'}).appendTo(User.$user)
      .append('<i class="fa fa-clock-o"></i>')
      .append($regTime);

    $('<p>', {
      id: 'user-id',
      class: 'usr-l fa fa-hashtag'
    }).appendTo(User.$user);


    var $field = $('<div>', {id: 'user-name'}).appendTo(User.$user);
    $field.append('<i class="fa fa-user-tag"></i>');
    $('<input>', {id: 'user-name-input', placeholder: 'userName', name: 'name'}).bindEnter(function(){
      User.update({name: this.value}).then(user => {
        $(this).blink(user?'green':'red');
      });
    }).appendTo($field);

    var $email = $('<div>', {id: 'user-email'}).appendTo(User.$user);
    $email.append('<i class="fa fa-envelope"></i>');
    $('<input>', {id: 'user-email-input', placeholder: 'user@email', name: 'email'}).bindEnter(function(){
      User.update({email: this.value}).then(user => {
        $(this).blink(user?'green':'red');
      });
    }).appendTo($email);
    

    var $tid = $('<div>', {id: 'user-tree'}).appendTo(User.$user);
    $tid.append('<i class="icon type-folder"></i>');
    $('<input>', {id: 'user-tree-input', placeholder: 'Start directory ID', name: 'tid'}).bindEnter(function(){
      User.update({tid: this.value}).then(user => {
        $(this).blink(user?'green':'red');
      });
    }).appendTo($tid);

    User.initOpenClose();
    User.tools.psw();
    User.tools.actions();
    User.tools.info();
    User.tools.extra();
  },

  tools: {
    psw: function(){
      User.$psw = $('<div>', {id: 'user-psw'}).appendTo('#user');
      var $ctrl = $('<header>', {id: 'user-psw-head'}).appendTo(User.$psw);
      $ctrl.text('Set password').prepend('<i class="fa fa-caret-right"></i>');

      var $tool = $('<div>', {id: 'user-psw-tool', class: 'tool'}).appendTo(User.$psw).hide();

      var $psw = $('<input>', {
        id: 'user-psw-password',
        name: 'password',
        type: 'password',
        placeholder: 'password'
      }).appendTo($tool);

      $('<input>', {
        id: 'user-psw-repassword',
        type: 'password',
        placeholder: 'repeat'
      }).appendTo($tool);

      $('<button>', {class: 'usr-l'}).text('change').click(function(ev){
        var $btn = $(this);

        User.validate.psw();

    		if($tool.find('.err').length == 0)
          W({
            cmd: 'changePassword',
            password: $psw.val(),
            id: User.id
          }, function(r){
            $btn.blink(r.done?'green':'red');
          });
      }).appendTo($tool);

      $ctrl.click(ev => {
        $tool.slideToggle('fast', ev => {
          $ctrl.children('i').removeClass('fa-caret-right fa-caret-down')
            .addClass('fa-caret-'+($tool.is(':visible')?'down':'right'));
        });
      });
    },

    info: function(){
      var $box = $('<form>', {
        id: 'user-info',
        class: 'tool'
      }).appendTo(User.$user);

      var fields = [
        'firstName', 'lastName', 'company',
        'country', 'state', 'city', 'address',
        'phone', 'website'
      ];

      var $fields = $('<div>', {id: 'user-info-fields'}).appendTo($box);
      fields.forEach(function(field){
        var $p = $('<p>').appendTo($fields).text(field);

        $input = $('<input>', {name: field}).appendTo($p);
      });


      $('<button>', {class: 'usr-l'}).text('update').click(function(ev){
        var set = {};
        var $button = $(this);
        $box.find('.changed').each(function(ev){
          set[this.name] = this.value;
        });

        User.update(set).then(ev => {
          $button.blink('green');
        });

        ev.preventDefault();
        return false;
      }).appendTo($box);
    },

    actions: function(){
      var $tool = $('<div>', {id: 'user-actions-tool', class: 'tool'}).appendTo(User.$);

      $('<button>', {id: 'user-remove', class: 'usr-l'})
        .text('Remove').appendTo($tool).click(ev => {
          Users.remove(User.id).then(() => {
            User.hide();
          });
        });
      $('<button>', {id: 'user-create', class: 'usr-n'}).text('Create')
      .appendTo($tool).click(ev => {
        User.register();
      });
    },

    extra: function(){
      var $p = $('<p>', {class: 'field'}).text('Registered').appendTo(User.$);
      $('<span>', {class: 'check', id: 'user-isConfirmed'})
      .appendTo($p).click(function(ev){
        setTimeout(() => {
          var v = $(this).hasClass('v');
          User.update({confirmed: v});
        }, 800);
      });

      var $p = $('<p>', {class: 'field'}).text('Super').appendTo(User.$);
      $('<span>', {class: 'check', id: 'user-isAdmin'})
      .appendTo($p).click(function(ev){
        setTimeout(() => {
          var isAdmin = $(this).hasClass('v');
          User.update({super: isAdmin});
        }, 800);
      });
    }
  },

  register: function(){
    var set = {};
    $('#user').find('.changed').each(function(ev){
      if(this.name)
        set[this.name] = this.value;
    });

    set.image = $('#user-image').data('id');

    User.validate.email();
    User.validate.psw();

    var psw = set.password;
    delete set.password

    if($('#user').find('.err').length == 0)
      W({
        cmd: 'createUser',
        password: psw,
        user: set
      }, function(r){
        $('#user-create').blink(r.user?'green':'red');

        Users.load();
      });

    return set;
  },

  validate: {
    email: function(){
    		$('#user-email-input').err(checkEmail($('#user-email-input').val())?0:'Wrong');
    },

    psw: function(){
      var $psw = $('#user-psw-password'),
          $repsw = $('#user-psw-repassword');

      $psw.err(($psw.val() < 4)?'Too short':0);
      if($psw.val().length>=4)
        $psw.err(($psw.val() != $repsw.val())?'Must be the same':0);
    }
  },

  update: function(set){
    return new Promise(function(resolve, reject){
      W({
        cmd: 'update',
        collection: 'acc',
        set: set,
        id: User.id
      }, function(r){
        r?resolve(r.item):reject();

        if(r.item)
          Users.rebuild(r.item);
      });
    });
  },

  load: user => {
    User.clean();
    console.log(user);
    User.id = user.id;
    User.data = user;
    $('#user').data(user);
    $('#user-title').show().text(Acc.fullName(user));

    $('#user input').each(function(){
      this.value = user[this.name] || '';
    });

    var img_file = (user.image || user.avatar);
    if(img_file){
      var img = new Image;
      img.onload = () => {
        $('#user-image').append(img);
      };
      img.src = Cfg.files + img_file;
    }

    if($('#user-psw-tool').is(':visible'))
      $('#user-psw-head').click();

    $('#user-regTime').text(new Date(user.time || user.regTime).format('%F %H:%M'));
    $('#user-id').text(user.id);

    $('#user-isAdmin')[user.super?'addClass':'removeClass']('v');

    User.onLoad.forEach(load => {
      load(user);
    });

    $('#user .usr-l').show();
    $('#user .usr-n').hide();
  },
  onLoad: [],

  read: function(id){
    return new Promise(function(resolve, reject){
      W({
        cmd: 'get',
        collection: 'acc',
        id: id
      }, function(r){
        r?resolve(r.item):reject();
      });
    });
  },

  initOpenClose: function(){
    /*
    $('<button>', {class: "fa fa-times", id: 'user-close'})
    .prependTo(User.$).click(ev => {
      User.hide();
    });
    */

    $('<button>', {class: "", id: 'user-openCreate'}).text('Create user')
    .appendTo('#users > footer').click(ev => {
      User.show();
      User.new();
    }).prepend("<i class='fa fa-user-plus'></i>");;
        //width: calc(100% - 300px);
  },

  show: () => {
    UI.side('#user');
    return;
    User.$.show().animate({right: 0}, 'fast', function(){
      $('#users-list').width('calc(100% - 300px)');
    });
  },

  hide: () => {
    UI.closeSides();
    return;
    User.$.animate({right: -300}, 'fast', function(){
      User.$.hide();
      $('#users-list').width('100%');
      $('.user').removeClass('active');
    });
  },

  open: id => {
    var open = () => {
      User.read(id).then(function(user){
        $('#user-'+id).addClass('active')
          .siblings().removeClass('active');
        User.show();
        User.load(user);
      });
    }

    UI.side('#user');

    /*
    if($('#user').is(':visible'))
      $('#user').animate({right: -20}, 'fast', function(){
        open();
      });
    else
    */

    open();
  },

  clean: () => {
    $('#user, #user-image').removeData();
    $('#user .changed').removeClass('changed');
    $('#user input').val('');
    $('#user-image > img').remove();
    delete User.id;
  },

  new: function(){
    User.clean();
    $('#user .usr-l').hide();
    $('#user .usr-n').show();
    $('.user').removeClass('active');
    if($('#user-psw-tool').is(':hidden'))
      $('#user-psw-head').click();
  },
};
