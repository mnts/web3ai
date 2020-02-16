import Neuron from '../Neuron.js';
export default class gallery extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

    this.icon = 'images';
  }

  static get item(){
    return {
      type: 'gallery',
      title: 'Gallery',
      name: 'gallery'
    }
  }

  initApp(){
    this.initScripts();

    var apps = this.where = document.querySelector('.apps');
    this.container = document.createElement('pineal-gallery');
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
