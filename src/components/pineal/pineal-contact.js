//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
const extend = NPM.extend;

import Link from '/src/data/Link.js';

import {LitElement, html, css} from "/node_mod/lit-element/lit-element.js";

const url = new URL(import.meta.url);


export default class Component extends LitElement{
  static get is(){
    return 'pineal-contact';
  }

  static get properties(){return {
    src: {
      type: String
    },

    item: {
      type: Object
    },

    user_item: {
      type: Array
    },
  }}

  static get styles() {
    return [css`
        :host{
          display: block;
          vertical-align: top;
          position: relative;
          overflow: hidden;
        }

        :host(.selected){
          background-color: #2222;
        }

        main{
          display: flex;
          padding: 3px 6px;
          position: relative;
          background-color: #00000000;
          transition: background-color 0.3s;
        }
        
        main:hover{
          background-color: #33333322;
        }

        #new{
            position: absolute;
            display: none;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: var(--color);
            width: 8px;
            height: 8px;
            left: 2px;
            top: 4px;
        }
        
        main > aside{
          display: inline-block;
          vertical-align: top;
          padding-left: 3px;
          flex-grow: 1;
        }

        main > aside > h2,
        main > aside > h3{
          font-weight: normal;
          white-space: nowrap;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          margin: 0;
        }


        :host(.new) main > aside > h2,
        :host(.new) main > aside > h3{
            font-weight: bold;
        }

        :host(.new) #new{
            display: block;
        }

        main > aside > h2{
          color: var(--color);
          font-weight: bold;
          font-size: 14px;
          padding: 4px 3px 2px 1px;
        }

        main > aside > h3{
          color: #555;
          font-size: 8px;
          padding: 2px 3px 2px 1px;
        }
    `];
  }

 render(){
    return html`
      <main>
          <div id='new'></div>
          <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${this.users[0]}"></pineal-user>
          <aside @click='${this.click_user}'>
            <h2>${this.user.title}</h2>
            <h3>${this.item.last?this.item.last.text:''}</h3>
          </aside>
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
    
    document.body.addEventListener('authenticated', ev => {
      this.performUpdate();
    });
    
    document.addEventListener('ws.cmd.change', ev => {
      const d = ev.detail.m;

      if(!this.item || this.item.id != d.id) return;

      //extend(this.item, d.fields);
      for(var prop in d.fields){
          _.set(this.item, prop, d.fields[prop]);
      }

      this.see();
      this.requestUpdate();
    });
  }

  see(){
    if(!account.user || !this.item) return;
    
    if(this.item.seen){
      const I_seen = this.item.seen[account.user.id];
      this.classList[(
        !I_seen || !this.item.time || I_seen < this.item.time
      )?'add':'remove']('new');
    }
    else this.classList.add('new');
    
    setTimeout(() => {
      const nav_chats = document.querySelector('#nav-chat');
      if($(nav_chats).is(':visible')){
        const new_n = this.parentNode.querySelectorAll('.new').length;
        nav_chats.classList[new_n?'add':'remove']('new');

        var new_num = document.querySelector('#nav-chat > .new');
        if(!new_num){
          new_num = document.createElement('span');
          nav_chats.append(new_num);
          new_num.classList.add('new');
        }

        new_num.textContent = new_n;
      }
    }, 200);
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

    if(name == 'src')
      this.load_src(newVal);
  }

  load_src(src){
    this.link = Link(src);
    this.link.load(item => {
        this.item = item;
        
        var users = [...item.users];
        if(account.user){
          var i = users.indexOf(account.user.item.owner);
          if(i !== -1) users.splice(i, 1);
        }

        this.users = users;
        this.see();
        
        this.requestUpdate();
    });
  }

  click_user(ev){
  	this.select('#owner-icon').click();
  }

  on_user(ev){
    this.user = ev.detail.user;
    //extend(this.user_item, ev.detail.item);
    setTimeout(ev => {
      this.requestUpdate();
    }, 90);
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);