//import {styleSheets} from '../styling.js';
import {fix4name} from '../utilities/item.js';
import servers from '../data/servers.js';


class Component extends HTMLElement{
  static get is(){
    return 'fractal-photo';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
          vertical-align: top;
        }

        #img{
          min-height: 20px;
        }
      </style>
      
      <link rel="stylesheet" href="//${Cfg.server}/design/components/fracta-photo.css">
      
      <main>
        <button id='x' class='fas fa-times'></button>
        <div id='img'></div>
        <input id='title' placeholder='write title'/>
        <textarea id='description' placeholder='Short description of the story'></textarea>

        <div id="owner-block">
            <img src="//${Cfg.server}/design/user.png" alt='O'/>
            <div id='owner-info'>
              <a id='owner'></a>
              <relative-time id='info-when'></relative-time>
            </div>
        </div>

        <div id="info-block">
            <span class="fas fa-thumbs-up forPublished" id='stat-likes'>0</span>
            <span class="fas fa-eye forPublished" id='stat-views'>0</span>
            <span class="fas fa-comments forPublished" id='stat-comments'>0</span>
            <span class="fas fa-trash forCreate forEdit" id='stat-remove'>Remove</span>
            <span class="fas fa-check forCreate" id='stat-publish'>Publish</span>
        </div>
        <slot></slot>
      </main>
    `;
  }

  load(){
    this.link.http;
  }

  activate(){
    var event = new CustomEvent("open_item", {
      detail: {
        url: this.link.url 
      }
    });

    this.dispatchEvent(event);
  }
  
  read(){
    var item = _.extend({},
      this.item, {
      title: this.$('#title').value,
      description: this.$('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(Acc.main) item.owner = Acc.main.user.email;

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
    this.shadowRoot.innerHTML = Component.template;
   
    this.server = Cfg.server;

    this.main_body = document.body;

    this.$('#img').addEventListener('click', ev => {
      this.activate();
    }, false);
  }

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
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