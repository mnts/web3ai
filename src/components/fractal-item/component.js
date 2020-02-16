//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
const extend = NPM.extend;

import {LitElement, html, css} from "/node_mod/lit-element/lit-element.js";
import {setPassiveTouchGestures} from "/node_mod/@polymer/polymer/lib/utils/settings.js";
import {installMediaQueryWatcher} from "/node_mod/pwa-helpers/media-query.js";
import {installOfflineWatcher} from "/node_mod/pwa-helpers/network.js";
import {installRouter} from "/node_mod/pwa-helpers/router.js";
import {updateMetadata} from "/node_mod/pwa-helpers/metadata.js"; // This element is connected to the Redux store.

import shareStyle from "../shareStyle.js";
import shareButtons from "../share.js";

import "../fractal/fractal-comments.js";

const url = new URL(import.meta.url);

//import { classMap } from '../../node_mod/lit-html/directives/class-map/index.js';
//import { styleMap } from '../../node_mod/lit-html/directives/style-map/index.js';

//import {main} from './style.js';

export default class Component extends LitElement{
  static get properties(){return {
    src: {
      type: String
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


        #share{
	     display: none;
        }
        
        span#stat-likes{
          padding: 0 10px;
        }

        fractal-rate{
          color: white;
          --icon-size: 22px;
          --color: var(--color2);
        }
    `, shareStyle];
  }

 render(){
        //  ?contenteditable='${this.classList.contains('toCreate')}'
    return html`
      <link rel="stylesheet" href="//${url.host}/src/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
      
      <button id='x' @click='${this.deactivate}'></button>
      <main class=${this.own?'own':''}>
        <pineal-gallery id='gallery' @click='${this.activate}' src='${this.src || 'toCreate'}' view='${this.activated?'carousel':'fill'}'></pineal-gallery>
        
        <input 
          id='title'
          @change='${this.change}' 
          ?readonly='${!this.classList.contains('toCreate')}'
          @click='${this.activate}' 
          placeholder='Title'></input>

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
            <span @click='${this.activate_comm}' class="fas fa-comments forPublished" id='stat-comments'>${this.item.num_comments || 0}</span>
            <span class='fas fa-trash forCreate forEdit' @click='${this.do_remove}' id='stat-remove'>Remove</span>
            <span class='fas fa-check forCreate' @click='${this.do_publish}' id='stat-publish'>Publish</span>
        </div>

        <div id='share'>
         	<!-- Sharingbutton Facebook -->
  <a href='https://www.facebook.com/sharer/sharer.php?u=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}&t=${this.item.title}' class="resp-sharing-button__link" target='_blank' aria-label="Share on Facebook">
	<div class="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
	  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
	  </div>Share on Facebook</div>
  </a>

  <!-- Sharingbutton Twitter -->
  <a class="resp-sharing-button__link" href="https://twitter.com/intent/tweet/?text=&amp;url=http%3A%2F%2Fspiritual.casa" target="_blank" rel="noopener" aria-label="Share on Twitter">
	<div class="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
	  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
	  </div>Tweet on Twitter</div>
  </a>

  <!-- Sharingbutton E-Mail -->
  <a class="resp-sharing-button__link" href="mailto:?subject=Super%20fast%20and%20easy%20Social%20Media.&amp;body=spiritual.casa target="_self" rel="noopener" aria-label="Share by E-Mail">
	<div class="resp-sharing-button resp-sharing-button--email resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
	  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.25 14.43l-3.5 2c-.08.05-.17.07-.25.07-.17 0-.34-.1-.43-.25-.14-.24-.06-.55.18-.68l3.5-2c.24-.14.55-.06.68.18.14.24.06.55-.18.68zm4.75.07c-.1 0-.2-.03-.27-.08l-8.5-5.5c-.23-.15-.3-.46-.15-.7.15-.22.46-.3.7-.14L12 13.4l8.23-5.32c.23-.15.54-.08.7.15.14.23.07.54-.16.7l-8.5 5.5c-.08.04-.17.07-.27.07zm8.93 1.75c-.1.16-.26.25-.43.25-.08 0-.17-.02-.25-.07l-3.5-2c-.24-.13-.32-.44-.18-.68s.44-.32.68-.18l3.5 2c.24.13.32.44.18.68z"/></svg></div>Send by E-Mail</div>
  </a>
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


  constructor() {
    super(); // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    this.item = {};
    this.src = '';
    this.user_item = {};
    this.user = {};
    
    setPassiveTouchGestures(true);

    
    document.body.addEventListener('authenticated', ev => {
      this.performUpdate();
    });
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
    if(this.classList.contains('toCreate')){
      this.select('#gallery').includeAdd();
    }
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
      this.item = item;
      var tit = this.select('#title');
      if(tit) tit.value = item.title;
      if(item.time) this.datetime = (new Date(item.time)).toISOString();

      this.link.checkOwnership(own => {
        this.own = !!own;
      });
    });
  }

  updated(changedProperties) {
    find2define(this.shadowRoot);

    var title = this.select('#title');
    
    if(this.item)
      title.value = this.item.title || this.item.name || '';
        
    if(title && !this.is_ready){
      let event = new CustomEvent("ready");
      this.dispatchEvent(event);
      this.is_ready = true;
    }
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

  activate_comm(ev){
    this.activate();

    setTimeout(ev => {  
      this.select('main').scrollTop = 999
    }, 400);
  }


  activate(ev){
    if(!account.user) return $('#account-icon').click();
    if(this.activated || this.classList.contains('toCreate')) return;
    var title = this.select('#title');
    if(!title) return;
    if(!title.readOnly) return;

    this.activated = true;
    this.been_activated = true;

    this.siblings('[activated]').map(el => {
      console.log(el);
      el.deactivate();
    });

    this.link.set('num_views', (this.item.num_views || 0) + 1);

    history.pushState({page: 2}, title, "/stories/"+this.item.name);

    this.dispatchEvent(new CustomEvent("activate", {
      detail: {item: this.item},
      bubbles: true,
      cancelable: false,
      composed: true
    }));
  }

  do_publish(ev){
      let item = this.read();

      if(item.name.length < 5)
        return $(this.select('#title')).blink('red');
      /*
      var tit = this.select('#title');
      tit.removeAttribute('contenteditable');
      */
      
      var event = new CustomEvent("publish", {
        detail: {item}
      });

      this.dispatchEvent(event);
  }

  do_remove(ev){
    var really = confirm('Are you sure you wanna remove it?')
    if(!really) return;
    
    if(this.link)
      this.link.remove(r => {
        this.remove();
      });
    else
      this.remove();
  }
  
  do_rate(ev){

  }

  do_rename(ev){
      let tit = this.select('#title');
      tit.removeAttribute('readonly');
      tit.focus();
  }

  change(ev){
    if(this.classList.contains('toCreate')) return;
    if(ev.target.id == 'title') ev.target.setAttribute('readonly', true);
    if(this.link) this.link.set(ev.target.name || ev.target.id, ev.target.value || ev.target.textContent);
  }


  read(){
    var item = _.extend({},
      this.item, {
      title: this.select('#title').value,
      description: this.select('#description').value,
      owner: ''
    });

    this.requestUpdate('item');


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

    var active_img = this.select('#gallery').select('.active');
    if(active_img) active_img.classList.remove('active')

    history.back();
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);