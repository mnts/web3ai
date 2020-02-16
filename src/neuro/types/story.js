import Neuron from '../Neuron.js';

export default class story extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);
    
    this.icon = 'receipt';
  }

  static get item(){
    return {
      type: 'story',
      title: 'Fairy Tale'
    }
  }


  static get template(){
    return `
      
    `;
  }

  get app(){
    if(this.container) return this.container;

    var c = this.container = document.createElement('ilunafriq-story');
    c.classList.add('app');
    c.classList.add('app-story');
    c.setAttribute('src', this.link.url);

    return this.container;
  }

  initApp(){
    this.app();
    //this.shadowRoot.innerHTML = this.constructor.template;

    this.append();
  }

  open(link){
    if(!this.container) this.initApp();

    this.select();
  }
}
