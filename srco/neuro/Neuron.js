
export default class Neuron{
  constructor(item){
    //console.log('Neuron: ', item);

    //this.icon = 'settings';
  }


  initApp(){
    this.initScripts();

    this.container = document.createElement('div');
    this.container.classList.add('app');
    this.container.classList.add('notab');
    this.container.id = 'app-'+md5(this.link.url);
    this.container.link = this.link;
    $(this.container).css({
      height: 'calc(100% - 50px)'
    });

    this.editor = new JSONEditor(this.container, {
      modes: ['tree', 'view', 'form', 'code', 'text']
    });

    this.$footer = $('<footer>').appendTo(this.container);

    $('<button>').text('Save').click(ev => {
      this.link.set(this.editor.get()).then(file => {
        $(ev.target).blink('green');
      });
    }).appendTo(this.$footer);
  }
  
  append(where){
    if(!where) this.where = document.querySelector('.apps');

    this.where.append(this.container);
  }

  select(){
    $(this.container).addClass('selected').siblings('.app').removeClass('selected');
  }


  initScripts(){
    if(!$('script[src$="jsoneditor.min.js"]').length){
      $('<script>', {src: '/node_modules/jsoneditor/dist/jsoneditor.min.js'}).appendTo('body');
      $('<link>', {href: '/node_modules/jsoneditor/dist/jsoneditor.min.css', rel:"stylesheet"}).appendTo('body');
    }
  }

  open(link){
    if(!this.container) this.initApp();

    document.querySelector('#body').open(this.container);

    if(!this.isLoaded) this.link.load(item => {
      this.editor.set(item);
    });
  }
}
