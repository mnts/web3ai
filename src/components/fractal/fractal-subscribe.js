  //import {styleSheets} from '../styling.js';
import account from '../../account.js';
import User from '../../acc/User.js';
import servers from '../../data/servers.js';
var url = new URL(import.meta.url);
import {find2define} from '/src/services/components.js';
import {observe as observeModal} from '/src/services/modal.js';

import {LitElement, html, css} from "/node_mod/lit-element/lit-element.js";

var myReviews = {};

document.body.addEventListener('authenticated', function(ev){
    servers.connect(Cfg.api).then(ws => {
      let q = {
        cmd: 'load',
        filter: {
          owner: account.user.email
        }
      };
      
      ws.send()
    });
});

var Components = [];

function ucf(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

class Component extends LitElement{
  static get is(){
    return 'fractal-subscribe';
  }

  static get styles() {
    return [css`
       :host{
        width: auto;
        height: auto;
        display: inline-block
      }

      [hidden]{
        display: none !important;
      }

      button{
        display: inline-block;
        border-radius: 5px;
        color: white;
        background: var(--color);
        border: 0;
        padding: 6px 8px;
        font-weight: bold;
        cursor: pointer;
        outline: none;
      }

      #unsubscribe{
            background: green;
      }

      #pending{
        display: none;
        border: 1px solid orange !important;
      }

      :host(.priced:not(.payed)) #pending{
        display: block;
      }

      :host(.priced:not(.payed)) #subscribe{
        display: block;
      }
    `];
  }
  
       

 render(){
        //  ?contenteditable='${this.classList.contains('toCreate')}'
    return html`
      <main>
        <button id='subscribe' @click=${this.subscribe} ?hidden=${!account.user || this.item}>Subscribe to ${ucf(this.user.name || ('#'+this.user.id))}</button>
        <button id='pending' @click=${this.resubscribe} title='${Lang.subs.pending_tip}' ?hidden=${!account.user || !this.item || !this.item.price || this.item.payed}>Subscribe to ${ucf(this.user.name || ('#'+this.user.id))}</button>
        <button id='unsubscribe' @click=${this.unsubscribe} ?hidden=${!account.user || !this.item || (this.item.price && !this.item.payed)}>${Lang.subs.unsubscribe}</button>
      </main>
    `;
  }


  static get properties(){
    return {
      path: {
        type: String
      },
    }
  }

  updated(){
    const item = this.item;
    if(!item) return this.classList.remove('subscribed', 'priced', 'payed');

    if(this.item.price)
      this.classList.add('priced');

    this.classList.add('subscribed');
    this.classList[item.payed?'add':'remove']('payed');
  }

  constructor() {
    super();

    this.collection = 'subscribers';

    this.item = false;

    Components.push(this);


    document.body.addEventListener('authenticated', ev => {
      this.performUpdate();
    });

    this.initUser();
  }

  initUser(){
    const path = this.getAttribute('path');
    if(!path) return;

    this.user = User(path);
    this.user.load(item => {
      this.initSbsc();  
    });
  }

  initSbsc(){
    if(!this.user) return;
    if(!account.user) return;

    this.classList[(this.user.item && this.user.item.intro_video)?
      'add':'remove'
    ]('priced');
    
    this.W({
      cmd: 'get',
      collection: 'subscribers',
      filter: {
        owner: account.user.email,
        to: this.user.email
      }
    }).then(r => {
      this.item = r.item || false;
      this.performUpdate();
    });
  }

  intro(){
    const id = 'video_intro-'+this.user.id;
    var intro = document.querySelector(id);
    if(!intro){
      intro = document.createElement('ilunafriq-video_intro')

      intro.classList.add('modal');
      intro.id = id;
      document.body.append(intro);
      find2define();
      observeModal(intro);
      intro.setAttribute('user', this.user.email);
    }
    
    return intro;
  }

  subscribe(){
    if(!this.user) return;
    if(!account.user) return document.querySelector('#account-icon').click();

    
    this.user.axon.link.load(item => {
      const sbsc = {
        to: this.user.email
      };

      var intro_video;
      if(item.intro_video){
        intro_video = this.intro();
        sbsc.price = Cfg.acc.subs_price;
      }

      this.W({
        cmd: 'save',
        collection: 'subscribers',
        item: sbsc
      }).then(r => {
        this.item = r.item || false;

        const src = 'https://'+location.host+'/subscribers#'+this.item.id,
              price = this.item.price * 1/Cfg.token2cur;

        if(intro_video){
          intro_video.setAttribute('src', src);
          intro_video.setAttribute('price', price);
          intro_video.classList.add('on');
        }
        
        this.performUpdate();
      });
    });
  }

  resubscribe(){
    this.unsubscribe().then(r => {
      this.subscribe();
    });
  }

  unsubscribe(){
    return new Promise((ok, no) => {
      if(!this.user || !account.user || !this.item) return ok();

      this.W({
        cmd: 'remove',
        collection: 'subscribers',
        id: this.item.id
      }).then(r => {
        this.item = false;
        ok();
        this.performUpdate();
      });
    });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  W(m){
    return new Promise((ok, no) => {
       servers.connect(Cfg.api).then(ws => {
            ws.send(m, r => {
              r?ok(r):no();
            });
       });
    });
  }

  attributeChangedCallback(name, oldValue, newValue){
    super.attributeChangedCallback();
    switch(name){
      case 'path':
        this.initUser();
        break;
    }
  }
};


document.addEventListener('ws.cmd.insert', ev => {
  console.log(ev);
    const d = ev.detail;
    var item = d.m.item;

    if(d.m.collection != 'subscribers') return;

    Components.map(component => {
      if(component.user.email == item.to){
        component.item = item;
        component.performUpdate(item);
      }
    });
});

document.addEventListener('ws.cmd.update', ev => {
    const d = ev.detail;

    if(d.m.collection != 'subscribers') return;

    var item = d.m.item;

    Components.map(component => {
      if(component.item && component.user.email == item.to){
        Object.assign(component.item, d.m.fields);
        component.performUpdate();
      }
    });
});
      


window.customElements.define(Component.is, Component);
