import Neuron from '../neuro/Neuron.js';
export default class text extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);
  }

  initApp(){
    this.initScripts();

    this.container = this.app_div = document.createElement('div');
    this.container.classList.add('app');
    this.container.classList.add('passion');
    this.container.link = this.link;
    this.app_div.id = 'app_'+md5(this.link.url);

    this.article = document.createElement('article');
    this.app_div.appendChild(this.article);


    this.$footer = $('<footer>').appendTo(this.container);

    $('<button>').text('Save').click(ev => {
      this.link.upload(this.article.innerHTML).then(file =>  {
        $(ev.target).blink('green');
      });
    }).appendTo(this.$footer);

    this.append();
  }
  
  initScripts(){
    if(!$('script[src$="quill.min.js"]').length){
      $('<link>', {href: '/node_modules/quill/dist/quill.core.css', rel:"stylesheet"}).appendTo('body');
      $('<link>', {href: '/design/quill.snow.css', rel:"stylesheet"}).appendTo('body');
      $('<script>', {src: '/node_modules/quill/dist/quill.min.js'}).appendTo('body');
    }
  }

  append(where){
    if(!where) this.where = document.querySelector('.apps');

    this.where.append(this.container);
  }

  select(){
    $(this.container).addClass('selected').siblings('.app').removeClass('selected');
  }

  open(link){
    if(!this.container) this.initApp();

    console.log(link, this.article);

    this.select();

    if(!this.isLoaded) this.link.load(item => {
        console.log(item);
      this.link.download((data, file) => {
        console.log(data);
        this.article.innerHTML = data?(new TextDecoder("utf-8").decode(data)):'';

        this.quill = new Quill(this.article, {
          theme: 'snow',
          scrollingContainer: this.where
        });

        var $toolbar = $(this.container).find('.ql-toolbar');
        this.$footer.append($toolbar);

        $(this.app_div).find('.quill-toolbar').on("mousedown", ev => {
          event.preventDefault();
          event.stopPropagation();
        });

        this.isLoaded = true;
      });
    });
  }
}
