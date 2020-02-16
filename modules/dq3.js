var App = Site.apps.home = window.Home = {
  init: () => {
    App.$ = $('<div>', {class: 'app', id: 'home'}).appendTo(document.body);

    /*
    $('<button>').click(ev => {
      Site.openApp('users');
    }).text('Manage users').appendTo(App.$);
    

    $('<button>').click(ev => {
      Site.openApp('orders');
    }).text('Manage orders').appendTo(App.$);

    */
  }
};

$(function(ev){
  Home.init();
});
