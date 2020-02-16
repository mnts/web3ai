//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;

import { LitElement, html, css } from "/node_mod/lit-element/lit-element.js";
var url = new URL(import.meta.url);

class Component extends LitElement{
  static get properties(){return {
    src: {
      type: String,
      observe: true
    },
    list: {
      type: Array
    },
    text_empty: {
      type: String
    },
    text_write: {
      type: String
    },
    user_item: {
      type: Object
    }
  }};

  static get is(){
    return 'fractal-comments';
  }

  render(){
    return html`
      <link rel="stylesheet" href="//${url.host}/design/components/comment.css">
      
        <div id='list'>
          ${this.list.length
            ?this.list.map(src => html`<fractal-comment src='${src}'></fractal-comment>`)
            :(this.text_empty || 'No one commented yet')
          }
        </div>
      ${account.user?html`
        <div id='comment-box'>
            <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${account.user.email}"></pineal-user>
            <div id='owner-info'>
              <a id='owner'>${account.user.title}</a>
              <textarea id='comment-area' placeholder='${this.text_write || 'Write your comment'}'></textarea>
            </div>
            <button id='options' @click='${this.post}'>&#10148;</button>
        </div>
      `:''}
    `;
  }

  updated(ev){
    find2define(this.shadowRoot);
  }

  attributeChangedCallback(name, oldVal, newVal){
    super.attributeChangedCallback(name, oldVal, newVal);

    if(name == 'src'){
      this.load_src();
    }
    
  }

  load_src(){
    this.link = Link(this.src);
    
    /*
      setInterval(ev => {
        this.collect();
      }, 1900);
    */

    if(!this.link) return this.collect();

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
      
      servers.connect(this.api).then(ws => {
        ws.send(q, async r => {
          this.list = [];
          if(r.items){
            r.items.map(item => {
              let link = Link('mongo://'+location.host+'/'+this.collection+'#'+item.id);
               link.item = item;
              
              this.list.push(link.url);
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
    textArea.focus();

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
                
			this.requestUpdate();

            this.link.load(item => {
               this.link.set('num_comments', (item.num_comments || 0) + 1);
            }); 
        }
      });
    });
  }

  firstUpdated(){
    this.$('#comment-area').bindEnter(ev => {
      this.post();
    });
  }

  constructor() {
    super();
    this.api = Cfg.api;
    this.item = {};
    this.user_item = {};
    this.list = [];
    this.collection = 'comments';

    document.body.addEventListener('authenticated', ev => {
      this.performUpdate();

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

window.customElements.define(Component.is, Component);
