import icons from '../data/fa-free.js';

$('<link>', {href: '/src/modals/FA_pick.css', rel: 'stylesheet'}).appendTo(document.body);

export default class FA_Pick{
  constructor(){
    this.init();
    this.click = this.click.bind(this);
  }

  init(){
    this.$ = $('<div>', {class: 'modal '+this.constructor.name});
    this.$.appendTo(document.body);

    this.$items = $('<div>', {class: 'list'});
    this.$items.appendTo(this.$);

    this.laydown();
  }

  open(){
    $('.modal').hide();
    $('#modal').show();
    this.$.show();
  }

  close(){
    $('.modal, #modal').hide();
  }

  laydown(){
    this.$items.empty();

    if(typeof icons == 'object'){
      console.log(icons);
      if(icons.length)
        icons.forEach(name => {
          let $icon = this.build(name);
          this.$items.append($icon);
        });
      else
        for(var key in icons){
          if(icons.hasOwnProperty(key)){
            let $icon = this.build(key, icons[key]);
            this.$items.append($icon);
          }
        }
    }

    this.$items.children('.item').click(ev => {
      this.click(ev.currentTarget);
    });
  }

  click(node){
    var item = $(node).data();
    if(typeof this.pick == 'function')
      this.pick(item);

    this.close();
  }

  build(name, id){
    var $item = $('<div>', {class: 'item'}).data({id, name});
    var $icon = $('<i>', {class: 'fas fa-'+name});
    $item.append($icon);

    $('<h4>').text(name).appendTo($item);

    return $item;
  }
}
