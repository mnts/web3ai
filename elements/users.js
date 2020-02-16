class Users{
    constructor(){

    }

    build(user){
      var $user = $('<div>', {class: 'user'});
      var img = new Image;
      img.src = Cfg.files + (user.icon || user.image);
      $user.append(img);

      var flName = (user.firstName+' '+user.lastName);
      var title = user.title || (flName.length>3)?flName:0 || '#'+user.id;
      $('<h3>').text().appendTo($user);

      return $user;
    }

    load(filter){
      WS({
        cmd: 'load',
        collection: 'acc',
        filter,
        limit: 100
      }, r => {
        $('<div>', {})
      });
    }
};

$(document).on('connected', function(user){
  var nav = html`
    <div id='users-nav'>
      <div id='users-list'></div>
      <div id='users-search'></div>
    </div>
  `;
  var $users = $('<div>').appendTo('body');

});
