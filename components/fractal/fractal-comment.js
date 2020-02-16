//import {styleSheets} from '../styling.js';
import account from '../../src/account.js';
import {fix4name} from '../../src/utilities/item.js';
import servers from '../../src/data/servers.js';
import {find2define} from '../../src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";

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
     <link rel="stylesheet" href="//var.best/design/components/comment.css">
  
     <main>
      <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${this.item.owner}"></pineal-user>
      <div id='owner-info'>
         <b id='owner_title'>${this.user_item.title}</b>
         <div id='comment-text'>${this.item.text}</div>
          <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
       </div>
     </main>`;
  }

  constructor() {
    super();
    this.api = Cfg.api;
    this.item = {};
    this.user_item = {};
    this.collection = 'comments';
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
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
