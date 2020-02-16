//import {styleSheets} from '../styling.js';
import {fix4name} from '../../utilities/item.js';
import servers from '../../data/servers.js';
import account from '../../account.js';
var url = new URL(import.meta.url);


class Component extends HTMLElement{
  static get is(){
    return 'fractal-publish';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
          vertical-align: top;
          position: relative;
        }

        #img{
          min-height: 20px;
        }

        main{
          display: none;
        }

        #gallery{
          
        }
        
      </style>
      
      <link rel="stylesheet" href="//${url.host}/design/components/fractal-publish.css">
      <link rel="stylesheet" href="//${url.host}/design/components/pineal-item.css">
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    
      <main>
        <h2 id='title' contenteditable placeholder='Story title'></h2>
        <textarea id='description' placeholder='Short description of the story'></textarea>

        <div id="info-block">
            <span class="fas fa-trash forCreate forEdit" id='stat-remove'>Remove</span>
            <span class="fas fa-check forCreate" id='stat-publish'>Publish</span>
        </div>
        <slot></slot>
      </main>
    `;
  }

  load(){
    this.link.load(item => this.fill(item));
  }


  read(){
    var item = _.extend({},
      this.item, {
      title: this.$('#title').textContent,
      description: this.$('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(account.user) item.owner = account.user.email;

    return item;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
  }

  init(){
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = this.constructor.template;
    

    this.server = Cfg.server;

    this.main_body = document.body;

    if(this.item){
      if(this.item.icon){
        if(this.item.icon.indexOf('://') + 1)
          this.icon_http = this.item.icon;
      }
    }
    
      
    this.$('#stat-publish').addEventListener('click', ev => {
      //this.activate();
      let item = this.read();

      var path = this.getAttribute('to').replace(/\/$/, "");

      var rname = Math.random().toString(36).substr(7);
      
      var url = path + '/' + rname,
          link = Link(url);

      link.save(item);

      this.activate(link);

    }, false);

    this.$('#stat-remove').addEventListener('click', ev => {
      this.remove();
    }, false);
  }

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  activate(link){
    var event = new CustomEvent("open_item", {
      detail: {
        url: link.url 
      }
    });

    this.dispatchEvent(event);
  }

  updateSrc(){
    if(!this.src) return;
  
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }

  static get observedAttributes(){
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log(name, oldValue, newValue);
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        this.$('#title').setAttribute('disabled', 'disabled');
        this.$('#description').setAttribute('disabled', 'disabled');
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  initApp(){
    this.app_div = document.createElement('div');
    this.app_div.classList.add("app");
    this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }
};


window.customElements.define(Component.is, Component);