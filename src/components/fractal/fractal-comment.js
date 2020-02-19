//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
var url = new URL(import.meta.url);

import { LitElement, html, css } from "/node_mod/lit-element/lit-element.js";

class Component extends LitElement{
  static get properties(){return {
    src: {
      type: String,
      observe: true
    },
    item: {
      type: Object
    },
    user_item: Object,
    user: {
      type: Object
    }
  }};

  static get is(){
    return 'fractal-comment';
  }

  render(){
    return html`
     <link rel="stylesheet" href="//${url.host}/design/components/comment.css">
  
     <main>
      <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${this.item.owner}" @click='${this.click_user}'></pineal-user>
      <div id='owner-info'>
         <a id='owner_title' href='${this.user && this.user.href}' target='_blank'>${this.user_item.title  || ('#'+this.user.id)}</a>
         <div id='comment-text'>${this.item.text}</div>
          <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
       </div>
     </main>`
  }

  constructor() {
    super();
    this.api = Cfg.api;
    this.item = {};
    this.user= {};
    this.user_item = {};
    this.collection = 'comments';
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  
  click_user(ev){
  	this.select('#owner_title').click();
  }

  on_user(ev){
    console.log(ev);
    this.user = ev.detail.user;
    this.user_item = ev.detail.item;

    setTimeout(ev => {
      this.requestUpdate();
    }, 8);
  }

  attributeChangedCallback(name, oldVal, newVal){
    super.attributeChangedCallback(name, oldVal, newVal);

    if(name == 'src'){
      this.load_src();
    }
    
  }

  load_src(){
    console.log(this.src);
    this.link = Link(this.src);

    this.link.load(item => {
      this.item = item;
      this.datetime = (new Date(item.time)).toISOString();
    });
  }

};


window.customElements.define(Component.is, Component);
