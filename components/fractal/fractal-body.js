//import {styleSheets} from '../styling.js';
import Axon from '../../src/neuro/Axon.js';


class Component extends HTMLElement{
  static get is(){
    return 'fractal-body';
  }

  static get template(){
    return `
    <link rel="stylesheet" href="//${Cfg.server}/design/components/fractal-body.css" rel="preload" as="style">
    
    <style>

    </style>


    <main>
       <slot></slot>
    </main>
    `;
  }

  constructor() {
    super();

    this.server = Cfg.server;
    
    this.attachShadow({ mode: 'open' });
  //  this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;

    this.init();
  }

  init(){

    /*
    this.set('need_auth', true);
    Index.stack.getUser().then(user => {
      this.set('blockstack_user', user);
      console.log(user);
      this.authenticated = true;
      this.need_auth = false;
    });
    */

    
    this.addEventListener('open_item', ev => {
      var url = ev.detail.url;

      
      let id = 'app-'+md5(url);
      
      var app = document.getElementById(id);

      if(app)
        this.open(app)
      else {
        var axon = this.axon = new Axon(url);

        axon.get_neuron().then(neuron => {
          console.log(neuron);

          neuron.app.id = id;
          this.open(neuron.app);
        });  
      }
    }, true);
  }

  upload(files, ev){
    var app = document.querySelector('#body > .app.selected');
    console.dir(ev);
    if(app.upload) app.upload(files);
  }


  wipe(){
    if(confirm('Reset and wipe all local data saved by pineal tab?')){
      chrome.storage.sync.clear();
      location.href = location.href;
    }
  }

  load_nav(ev){
    let toggle = () => document.body.classList.toggle('closed');
    if(this.previousElementSibling.nodeName == 'PINEAL-NAV'){
      console.log(document.body.classList);
      toggle();
      return;
    }

    this.$nav = $("<pineal-nav>", {
      node_src: 'mongo://localhost:4000/tree?domain=pineal.lh',
    //  class: 'closed'
    }).insertBefore(this);
    setTimeout(ev => toggle(), 20);
  }

  
  open(app){
    if(!app.parentNode) this.append(app);
    $(app).addClass('selected').siblings('.app').removeClass('selected');
    document.getElementById('head').open(app);
    lazyDefine();
  }

  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
