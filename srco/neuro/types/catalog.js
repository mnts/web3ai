import Neuron from '../Neuron.js';
export default class catalog extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

    this.icon = 'grip-horizontal';
  }

  static get item(){
    return {
      type: 'catalog',
      title: 'Catalog',
      name: 'catalog'
    }
  }

  initApp(){
    this.initScripts();

    var apps = this.where = document.querySelector('.apps');
    this.container = document.createElement('catalogem-items');
    var attrs = {
      src: this.link.url,
      class: 'app',
      id: 'app_'+md5(this.link.url)
    };

    for(var key in attrs){
      this.container.setAttribute(key, attrs[key]);
    }


    apps.append(this.container);
    lazyDefine();
  }

  select(){
    $(this.container).addClass('selected').siblings('.app').removeClass('selected');
  }

  open(link){
    if(!this.container) this.initApp();

    this.select();
  }
}
