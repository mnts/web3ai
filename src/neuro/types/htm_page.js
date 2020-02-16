import Neuron from '../Neuron.js';

export default class htm_page extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

    this.icon = 'av:web';
  }

  open(link){
    if(!this.app_div) this.initApp();

    Index.apps.element.open(this.app_div);
  }

  initApp(){
    this.app_div = document.createElement('div');

    this.app_div.classList.add("app");
    //this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }

  loadHTM(){
    this.htm_div = document.createElement('div');

    this.link.download(content => {
      this.htm_div.innerHTML = new TextDecoder("utf-8").decode(content || '');
    });
  }
}
