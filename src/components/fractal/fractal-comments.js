//import {styleSheets} from '../styling.js';

import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define, define} from '/src/services/components.js';
import Link from '../../data/Link.js';

const select = q => document.querySelector(q);
const J = NPM.urljoin;

import { LitElement, html, css } from "/node_mod/lit-element/lit-element.js";
var url = new URL(import.meta.url);

var collections = {

};

define('fractal-comment');

var Lng;

class Component extends HTMLElement{
  static get is(){
    return 'fractal-comments';
  }

  static get template(){
    return `
      <link rel="stylesheet" href="//${url.host}/design/components/comment.css">

      <style>
        :host{
          position: relative;
        }
        
        #list{
          padding-top: calc(var(--comments-list-padding-top, 0px) + 16px);
          padding-bottom: 50px;
          height: 100%;
        }

        footer{
          background: #d2d2d285;
          border-top: 1px dashed #c3c3c3;
          backdrop-filter: blur(4px);
          text-align: left;
          display: flex;
          position: absolute;
          left: 0;
          bottom: 0;
          right: 0;
        }

        *[hidden]{
          display: none !important;
        }

        footer > textarea {
            width: calc(100% - 112px);
            border-radius: 0;
        }
      </style>
      
      <div id='list'></div>

      <footer>
          <div id='owner'>
          </div>

          <textarea id='comment-area' placeholder='${this.text_write || Lng.write}'></textarea>

          <button id='send'>&#10148;</button>
      </footer>
    `;
  }

  static get observedAttributes(){
    return ['src', 'collection'];
  }

  attributeChangedCallback(name, oldVal, newVal){
    this[name] = newVal;

    if(name == 'src')
      this.load_src();
    

    if(name == 'collection')
      this.collection = newVal;
  }

  build(c){
    var comment = document.createElement('fractal-comment');

    if(typeof c == 'string')
      comment.setAttribute('src', c);

    return comment;
  }

  prepend_item(c){
    var el = this.build(c);
    this.select('#list').prepend(el);
  }

  load_src(){
    this.link = Link(this.src);

    this.filter = {
        src: this.src
    };

    this.link.load(item => {
      if(!this.item){
        var collection = collections[this.collection];
        if(!collection) collection = collections[this.collection] = {};

        collection[this.src] = this;
      }

      this.item = item;

      this.load_more().then(() => {
        setTimeout(ev => {
          this.scrollDown();
        }, 333);
        
        this.see();
      });
    });
  }

  post(){
    var textArea = this.select('#comment-area');
    if(!account.user){
      textArea.value = '';
      return this.dispatchEvent(
        new CustomEvent("gate", {
          bubbles: true
        })
      );
    }
    
    if(!account.user || !textArea.value) return;

    var text = textArea.value.trim();
    textArea.value = '';
    textArea.focus();

    if(!text) return;

    var item = {
      text,
      owner: account.user.email,
      src: this.src
    };

    var q = {
      cmd: 'save',
      collection: this.collection,
      item
    };

    if(q.collection == 'messages')
      this.send(q);
    else
      this.send(q).then(r => {
        if(r.item){
            let comment = r.item;

            this.append_item(comment);

            this.link.load(item => {
               this.link.set('num_comments', (item.num_comments || 0) + 1);
            });
        }
      });
  }

  send(m){
    return new Promise((ok, no) => {
       servers.connect(Cfg.api).then(ws => {
            ws.send(m, r => {
              r?ok(r):no();
            });
       });
    });
  }

  append_item(item){
    var link = Link('mongo://'+this.host+'/'+this.collection+'#'+item.id);
    link.item = item;
    
    const el = this.build(link.url);

    this.main.append(el);

    setTimeout(ev => {
      this.scrollDown();
    }, 99);
  }

  scrollDown(){
    this.main.scrollTo(0, this.main.scrollHeight);
    if(this.main.scrollHeight <= this.main.clientHeight)
      this.see(); 
  }

  see(){
    if(!account.user) return;
    if(!this.main.childElementCount)
      return this.send({
        cmd: 'seen',
        collection: this.link.collection,
        id: this.link.id
      });
      
    const last = this.main.querySelector(':last-child');
    setTimeout(() => {
      if(!last.item) return;

      const time = last.item.time;

      if(
        (!this.lastSeen || time > this.lastSeen) &&
        this.link &&
        this.link.collection == 'chats' && 
        $(this).is(':visible')
      ){
        this.send({
          cmd: 'seen',
          collection: this.link.collection,
          id: this.link.id
        });

        this.lastSeen = time;
      }
    }, 400);
  }
  
  click_user(ev){
  	this.select('#owner').click();
  }

  constructor() {
    super();
    this.api = Cfg.api;
    //this.item = {};
    this.host = location.host;
    this.user_item = {};
    this.limit = 50;
    this.list = [];
    this.collection = 'comments';
    this.selector = 'fractal-comment';

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.constructor.template;

    this.main = this.select('#list');

    this.select('#send').addEventListener('click', ev => this.post(), false);

    
    $(this.select('#comment-area')).bindEnter(ev => {
      this.post();
    });

    account.authenticated.then(() => {
      //this.select('footer').hidden = false;
    });
  }


  connectedCallback(){
    //let src = this.getAttribute('src');
    //if(src) this.setSrc();
    this.listen_scroll();
  }

  listen_scroll(){
    this.select('#list').addEventListener('scroll', ev => {
      var cont = ev.target;

      if(cont.scrollTop == 0)
        this.load_more();
      
      if(cont.scrollHeight - cont.scrollTop - cont.clientHeight < 20)
        this.see();
    });
  }

  load_more(){
    if(this.classList.contains('loaded_all')) return;
    if(this.classList.contains('loading_more')) return;
    this.classList.add('loading_more');

    const count = this.main.querySelectorAll(this.selector).length;
    
    return new Promise((ok, no) => {
      this.filtrate({}, {skip: count}).then(links => {
        if(links.length) this.prepend_links(links);
        else this.classList.add('loaded_all');

        this.classList.remove('loading_more');

        ok();
      }).catch(err => {});
    });
  }

  prepend_links(links){
    (links || []).forEach(link => {
      this.prepend_item(link.url);
    });
  }

  filtrate(filter, cf = {}){
    this.filter = _.extend({}, this.filter, filter);

    var query = Object.assign({}, this.filter.query);

    var q = {
      cmd: "load",
      filter: this.filter,
      sort: {
        time: -1
      },
      limit: this.limit,
      collection: this.collection
    };

    if(cf.skip) q.skip = cf.skip;

    return new Promise((ok, no) => {
      this.send(q).then(r => {
        if(!r.items) return ok([]);

        let links = [];
        r.items.map(item => {
          var url = 'mongo://'+this.host+'/'+this.collection+'#'+item.id,
              link = Link(url);

          link.item = item;

          links.push(link);
        });

        ok(links);
      });
    });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  $(selector){
    return $(this.select(selector));
  }

  on_user(ev){
    console.log(ev);
    this.user = ev.detail.user;
    this.user_item = ev.detail.item;
  }
};

Lng = Lang.components[Component.is] || {};

var au = new Audio('/design/audio/blink.mp3');

document.addEventListener('ws.cmd.insert', ev => {
    const d = ev.detail;
    var item = d.m.item;

    let src = item.src;
    var collection = collections[d.m.collection];

    if(d.m.collection == 'messages')
      Link(item.src).load(itm => {
        const chats = document.querySelector('#chats'),
              contacts = chats.select('pineal-contacts'),
              contact = contacts.prepend_item(itm);

        if(
          d.m.collection == 'messages' && 
          item.owner !== account.user.item.owner &&
          !contact.classList.contains('selected')
        ){
          au.play(0);
        }
      });

    if(!collection || !src) return;

    let element = collection[src];
    if(!element) return;

	element.append_item(item);
});


window.customElements.define(Component.is, Component);
