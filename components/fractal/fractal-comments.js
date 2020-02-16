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
    list: {
      type: Array
    },
    user_item: {
      type: Object
    }
  }};


  static get is(){
    return 'fractal-comments';
  }

  render(){
    console.log('render');
    return html`
      <link rel="stylesheet" href="//var.best/design/components/comment.css">
          
      <div id='list'>
        ${this.list.map(src => html`
          <fractal-comment src='${src}'></fractal-comment>
        `)}
      </div>
      ${account.user?html`
        <div id='comment-box'>
            <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${account.user.email}"></pineal-user>
            <div id='owner-info'>
              <a id='owner'>${account.user.title}</a>
              <textarea id='comment-area'></textarea>
            </div>
            <button id='options' @click='${this.post}'>&#x27B2;</button>
        </div>
      `:''}
    `;
  }

  updated(ev){
    find2define(this.shadowRoot);
  }

  attributeChangedCallback(name, oldVal, newVal){
    console.log('attributeChangedCallback', name, oldVal, newVal);
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

      this.collect();
    });
  }

  collect(){
      var q = {
          cmd: "load",
          filter: {
              src: this.src
          },
          sort: {
            time: 1
          },
          collection: this.collection
      };

      console.log(q);
      servers.connect(this.api).then(ws => {
        ws.send(q, async r => {
          this.list = [];
          if(r.items){
            r.items.map(item => {
              let link = Link('mongo://'+location.host+'/'+this.collection+'#'+item.id);
               link.item = item;
              
              this.list.push(link.url);

              console.log(this.list);
            });

		    console.log(await this.requestUpdate());
          }
        });
      });
  }

  post(){
    var textArea = this.select('#comment-area');
    if(!account.user || !textArea.value) return;

    var text = textArea.value;
    textArea.value = '';

    servers.connect(Cfg.api).then(ws => {
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

      ws.send(q, r => {
        if(r.item){
            let comment = r.item;

            var link = Link('mongo://'+location.host+'/'+this.collection+'#'+r.item.id);
            link.item = r.item;
            this.list.push(link.url);
                
			console.log(this.requestUpdate());

            this.link.load(item => {
               this.link.set('num_comments', (item.num_comments || 0) + 1);
            }); 
        }
      });
    });
  }

  constructor() {
    super();
    this.api = Cfg.api;
    this.item = {};
    this.user_item = {};
    this.list = [];
    this.collection = 'comments';
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  on_user(ev){
    console.log(ev);
    this.user = ev.detail.user;
    this.user_item = ev.detail.item;
  }
};

window.customElements.define(Component.is, Component);
