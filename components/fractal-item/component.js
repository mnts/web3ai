//import {styleSheets} from '../styling.js';
import account from '../../src/account.js';
import {fix4name} from '../../src/utilities/item.js';
import servers from '../../src/data/servers.js';
import {find2define} from '../../src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
const extend = NPM.extend;

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";
import { setPassiveTouchGestures } from "../../node_mod/@polymer/polymer/lib/utils/settings.js";
import { installMediaQueryWatcher } from "../../node_mod/pwa-helpers/media-query.js";
import { installOfflineWatcher } from "../../node_mod/pwa-helpers/network.js";
import { installRouter } from "../../node_mod/pwa-helpers/router.js";
import { updateMetadata } from "../../node_mod/pwa-helpers/metadata.js"; // This element is connected to the Redux store.


const url = new URL(import.meta.url);

//import { classMap } from '../../node_mod/lit-html/directives/class-map/index.js';
//import { styleMap } from '../../node_mod/lit-html/directives/style-map/index.js';

//import {main} from './style.js';

export default class Component extends LitElement{
  static get properties(){return {
    src: {
      type: String,
      observe: true
    },

    item: {
      type: Object
    },

    user_item: {
      type: Object
    },

    owner_title: {
      type: String
    },

    own: {
      type: Boolean
    },

    datetime: {
      type: String
    },

    activated: {
      type: Boolean,
      reflect: true
    },

    been_activated: {
      type: Boolean
    }
  }}

  static get is(){
    return 'fractal-item';
  }

  static get styles() {
    return [css`
        :host{
          display: inline-block;
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

        span#stat-likes{
          padding: 0 10px;
        }

        fractal-rate{
          color: white;
          --icon-size: 22px;
          --color: var(--color2);
        }
    `];
  }

 render(){
    console.log('render', this.item, this.src);
        //  ?contenteditable='${this.classList.contains('toCreate')}'
    return html`
      <link rel="stylesheet" href="//${url.host}/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main class=${this.own?'own':''}>
        <button id='x' @click='${this.deactivate}'></button>
        <pineal-gallery id='gallery' @click='${this.activate}' src='${this.src || 'toCreate'}' view='${this.activated?'carousel':'fill'}'></pineal-gallery>
        
        <h2 
          id='title'
          @blur='${this.change}' 
          ?contenteditable='${this.classList.contains('toCreate')}'
          @click='${this.activate}' 
          placeholder='Title'>${this.item.title}</h2>

        <button id='rename' 
          @click='${this.do_rename}'
          ?hidden='${!this.own || this.classList.contains('toCreate')}'
         >&#xb6;</button>

        <textarea 
          id='description'
          @change='${this.change}' 
          placeholder='Short description' 
          ?disabled='${!this.own}'
        >${this.item.description}</textarea>
        
        ${this.been_activated?html`
          <fractal-htm id='article' ?editable='${!this.own}' ?disabled='${!this.own}' placeholder='Write your story here' src='${this.src}'></fractal-htm>
        `:''}
        
        <div id="owner-block">
            <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${this.item.owner || this.user_item.owner}"></pineal-user>
            <div id='owner-info'>
              <a id='owner'>${this.user_item.title}</a>
              <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
            </div>
            <button id='options' class='icon fas fa-ellipsis-v'></button>
        </div>

        <div id="info-block">
            <span class="forPublished" id='stat-likes'>
              <fractal-rate @rate='${this.do_rate}' src='${this.src}'></fractal-rate>
              ${this.item.num_reviews || 0}
            </span>
            <span class="fas fa-eye forPublished" id='stat-views'>${this.item.num_views || 0}</span>
            <span @click='${this.activate}' class="fas fa-comments forPublished" id='stat-comments'>${this.item.num_comments || 0}</span>
            <span class='fas fa-trash forCreate forEdit' @click='${this.do_remove}' id='stat-remove'>Remove</span>
            <span class='fas fa-check forCreate' @click='${this.do_publish}' id='stat-publish'>Publish</span>
        </div>

        <div id='feedback-block'>
          ${this.been_activated?html`
            <fractal-comments src='${this.src}'></fractal-comments>
          `:''}
        </div>

        <slot></slot>
      </main>
    `;
  }
  
  updated(ev){
    find2define(this.shadowRoot);
  }

  constructor() {
    super(); // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    this.item = {};
    this.src = '';
    this.user_item = {};
    
    setPassiveTouchGestures(true);
  }

  connectedCallback(){
    super.connectedCallback();
    if(this.classList.contains('toCreate')){
      this.user_item = account.user.item;
      this.own = true;
    }
  }

  firstUpdated(ch) {
    //console.log('firstUpdated', ch, this.src);
    //this.load_src();
  }

  attributeChangedCallback(name, oldVal, newVal){
    super.attributeChangedCallback(name, oldVal, newVal);

    if(name == 'src'){
      this.load_src();
    }
    
  }

  load_src(){
    this.link = Link(this.src);

    this.link.load(item => {
      this.link.checkOwner(own => {
        this.own = !!own;      
        this.item = item;
        var tit = this.select('#title');
        if(tit) tit.textContent = item.title;
        if(item.time) this.datetime = (new Date(item.time)).toISOString();
      });
    });
  }

  on_user(ev){
    this.user = ev.detail.user;
    extend(this.user_item, ev.detail.item);
    setTimeout(ev => {
      this.requestUpdate();
    }, 90);
  }

  siblings(sel){ 
    var ch = this.parentElement.children;
    return [...ch].filter(c => {
      return c.nodeType == 1 && c!=this && c.matches(sel)
    });
  }

  activate(ev){
  console.log('activate');
    if(this.activated || this.classList.contains('toCreate')) return;
    var title = this.select('#title');
    if(!title) return;
    if(title.getAttribute('contenteditable')) return;

    this.activated = true;
    this.been_activated = true;

    this.siblings('[activated]').map(el => {
      console.log(el);
      el.deactivate();
    });

    this.link.set('num_views', (this.item.num_views || 0) + 1);

    history.pushState({}, title, '/stories/' + this.item.id);
    console.log('new statre ', history);

    this.dispatchEvent(new CustomEvent("activate", {
      detail: {item: this.item},
      bubbles: true,
      cancelable: false,
      composed: true
    }));
  }

  do_publish(ev){
      let item = this.read();

      var tit = this.select('#title');
      tit.removeAttribute('contenteditable');

      var event = new CustomEvent("publish", {
        detail: {item}
      });

      this.dispatchEvent(event);
  }

  do_remove(ev){
    console.log('remov');
      this.remove();
  }
  
  do_rate(ev){

  }

  do_rename(ev){
      let tit = this.select('#title');
      tit.setAttribute('contenteditable', true);
      tit.focus();
  }

  change(ev){
    console.log('changee');
    if(this.classList.contains('toCreate')) return;
    ev.target.removeAttribute('contenteditable');
    console.dir(ev.target);
    if(this.link) this.link.set(ev.target.name || ev.target.id, ev.target.value || ev.target.textContent);
  }


  read(){
    var item = _.extend({},
      this.item, {
      title: this.select('#title').textContent,
      description: this.select('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(account.user) item.owner = account.user.email;

    return item;
  }

  deactivate(){
    this.activated = false;
    this.dispatchEvent(new CustomEvent("deactivate", {
      detail: {item: this.item},
      bubbles: true,
      cancelable: false,
      composed: true
    }));
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);