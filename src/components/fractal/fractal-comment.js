//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
import Link from '../../data/Link.js';
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
    hideOwner: Boolean,
    hideName: Boolean,
    hideTime: Boolean,
    user_item: Object,
    user: {
      type: Object
    }
  }};

  static get is(){
    return 'fractal-comment';
  }

  static get styles() {
    return [css`
      
      #owner_title, #owner{
          display: block;
          font-size: 14px;
          color: grey;
          /* margin: 2px 12px; */
          text-decoration: none;
      }

      #owner_title{
          padding: 2px 5px;
      }


      #owner{
          width: 64px;
          margin-top: -20px;
      }

      pineal-user{
          margin: 8px 12px;
      }


      #info{
          display: inline-block;
          position: relative;
          vertical-align: top;
          max-width: calc(100% - 110px);
      }


      #info:after {
          display: none;
          content: "";
          position: absolute;
          bottom: 0px;
          left: -12px;
          top: 18px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 12px 12px 12px 0;
          border-color: transparent  #ececec transparent transparent;
      }

      main{
          padding: 2px 0px;
          text-align: left;
          display: flex;
      }

      #info-when{
          font-size: 11px;
          padding: 6px 12px;
          display: block;
          color: #0f0f0f87;
      }

      #comment-text{
          padding: 5px;
          background-color: #ffffff91;
          font-size: 14px;
          font-weight: normal;
          border-radius: 10px;
          color: black;
          padding: 10px 12px;
          font-family: 'Comfortaa', arial;
          white-space: pre-wrap;
      }

      [hidden]{
        display: none !important;
      }
    `];
  }

  render(){
    return html`
     <main>
      <div id='owner'>
         <pineal-user ?hidden='${this.hideOwner}' id='owner-icon' @loaded='${this.on_user}' path="${this.item.owner}" @click='${this.click_user}'></pineal-user>
      </div>

      <div id='info'>
          <a id='owner_title' href='${this.user && this.user.href}' ?hidden='${this.hideName}' target='_blank'>${this.user_item.title  || ('#'+this.user.id)}</a>
          <div id='comment-text'>${this.item.text}</div>
          <relative-time ?hidden='${this.hideTime}' id='info-when' datetime='${this.datetime}'></relative-time>
       </div>
     </main>`
  }

  constructor() {
    super();
    this.api = Cfg.api;
    this.item = {};
    this.user= {};
    this.user_item = {};
    this.hideOwner = false;
    this.hideName = false;
    this.hideTime = false;
    this.show = true;
    this.collection = 'comments';
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  
  click_user(ev){
  	this.select('#owner_title').click();
  }

  on_user(ev){
    this.user = ev.detail.user;
    this.user_item = ev.detail.item;

    setTimeout(ev => {
      this.requestUpdate();
    }, 8);
  }

  attributeChangedCallback(name, oldVal, newVal){
    super.attributeChangedCallback(name, oldVal, newVal);

    if(name == 'src')
      this.load_src();
  }

  load_src(){
    this.link = Link(this.src);

    this.link.load(item => {
      this.item = item;
      this.datetime = (new Date(item.time)).toISOString();
    });
  }

  connectedCallback(){
    super.connectedCallback();
    this.checkAround();
  }

  checkAround(){
    this.link.load(this_item => {
      const prev = this.previousElementSibling,
            next = this.nextElementSibling;

      const time =  5 * 60 * 1000;
      
      if(prev && prev.tagName == 'FRACTAL-COMMENT'){
        let src = prev.getAttribute('src');
        if(!src) return;

        let link = new Link(src);
        link.load(item => {
          prev.hideOwner = (this_item.owner == item.owner);
          prev.hideTime = (this_item.owner == item.owner && (this_item.time-item.time) < time);
          this.hideName = (this_item.owner == item.owner);
        });
      }

      if(next && next.tagName == 'FRACTAL-COMMENT'){
        let src = next.getAttribute('src');
        if(!src) return;

        let link = new Link(src);
        link.load(item => {
          this.hideOwner = (this_item.owner == item.owner);
          this.hideTime = (this_item.owner == item.owner && (item.time - this_item.time) < time);
          next.hideName = (this_item.owner == item.owner);
        });
      }
    });
  }

};


window.customElements.define(Component.is, Component);
