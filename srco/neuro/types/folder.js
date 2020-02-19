import Neuron from '../Neuron.js';
export default class folder extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);
  }

  static get item(){
    return {
      type: 'folder',
      title: 'Folder',
      name: 'folder',
      children: [
        'mem://self/Index.types.folder.item',
        'mem://self/Index.types.gallery.item',
        'mem://self/Index.types.catalog.item',
        //'mem://self/Index.types.source.item',
        'mem://self/Index.types.text.item'
      ]
    }
  }

  initApp(){
    this.initScripts();

    var apps = this.where = document.querySelector('.apps');
    var wrap = this.wrap = new Wrapper(this.link, {
      $parent: $(apps),
      template: {
        element: 'div'
      },
      inherit: {
        template: {
          element: 'pin-itm'
        },
        noChildren: true
      }
    });

    wrap.loadPromise.then(item => {
      this.container = this.wrap.element;
      this.container.classList.add('app');
      this.container.id = 'app_'+md5(this.link.url);
      apps.append(this.container);

      this.select();
    });
  }

  select(){
    $(this.container).addClass('selected').siblings('.app').removeClass('selected');
  }

  open(link){
    if(!this.container) this.initApp();

    this.select();
  }
}
