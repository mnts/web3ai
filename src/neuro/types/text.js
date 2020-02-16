import Neuron from '../Neuron.js';
export default class text extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

  }

  static get item(){
    return {
      type: 'text',
      title: 'Text'
    }
  }

  initApp(){
    this.initScripts();

    this.container = this.app_div = document.createElement('fractal-htm');
    this.container.classList.add('app');
    this.container.classList.add('passion');

    this.link.load(item => {
      this.container.setAttribute('src', this.link.url);
    });
    
    this.app_div.id = 'app-'+md5(this.link.url);

    this.append();
  }

  open(link){
    if(!this.container) this.initApp();

    this.select();
  }
}
