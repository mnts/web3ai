//import {styleSheets} from '../styling.js';
import account from '../src/account.js';
import {fix4name} from '../src/utilities/item.js';
import servers from '../src/data/servers.js';
import {find2define} from '../src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
var url = new URL(import.meta.url);

import { LitElement, html, css } from "../node_mod/lit-element/lit-element.js";
import { setPassiveTouchGestures } from "../node_mod/@polymer/polymer/lib/utils/settings.js";
import { installMediaQueryWatcher } from "../node_mod/pwa-helpers/media-query.js";
import { installOfflineWatcher } from "../node_mod/pwa-helpers/network.js";
import { installRouter } from "../node_mod/pwa-helpers/router.js";
import { updateMetadata } from "../node_mod/pwa-helpers/metadata.js"; // This element is connected to the Redux store.

class Component extends LitElement{
  static get is(){
    return 'fractal-item';
  }

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
    }
  }}

  render(){
    return html`
      <link rel="stylesheet" href="//${url.host}/design/components/pineal-item.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main>
        <button id='x'></button>
        <pineal-gallery id='gallery' src=${this.src} view='${this.activated?'carousel':'fill'}'></pineal-gallery>
        <h2 id='title' @click='${this.activate}' placeholder='Title'>${this.item.title}</h2>
        <textarea id='description' placeholder='Short description'>${this.item.description}</textarea>
        
        <pineal-htm id='article' ?disabled='${!this.own}' placeholder='Write your story here' src='${this.item.content}'></pineal-htm>

        <div id="owner-block">
            <pineal-user id='owner-icon' @loaded='${this.on_user}' path="${this.item.owner}"></pineal-user>
            <div id='owner-info'>
              <a id='owner'>${this.user_item.title}</a>
              <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
            </div>
            <button id='options' class='icon fas fa-ellipsis-v'></button>
        </div>

        <div id="info-block">
            <span class="forPublished" id='stat-likes'>
              <fractal-rate @rate='${this.do_rate}'></fractal-rate>
              ${this.item.num_votes || 0}
            </span>
            <span class="fas fa-eye forPublished" id='stat-views'>${this.item.num_views || 0}</span>
            <span class="fas fa-comments forPublished" id='stat-comments'>${this.item.num_comments || 0}</span>
            <span class="fas fa-trash @click=${this.do_remove} forCreate forEdit" id='stat-remove'>Remove</span>
            <span class="fas fa-check @click=${this.do_publish} forCreate" id='stat-publish'>Publish</span>
        </div>
        <slot></slot>
      </main>
    `;
  }

  constructor() {
    super(); // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    this.item = {};
    this.user_item = {};
    
    setPassiveTouchGestures(true);
    
    this.test = { stuff: 'hi', otherStuff: 'wow' };
    console.log(this.src);
  }

  firstUpdated(ch) {
    console.log('firstUpdated', ch, this.src);
    //this.load_src();
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
      this.link.checkOwnership(own => {
        this.own = !!own;      
        this.item = item;
        this.datetime = (new Date(item.time)).format();
      });
    });
  }

  on_user(ev){
    console.log(ev);
    this.user = ev.detail.user;
    this.user_item = ev.detail.item;
  }

  activate(){
    this.activated = true;
  }

  do_publish(ev){
    
  }

  do_remove(ev){

  }
  
  do_rate(ev){

  }

  activatea(){
    /*
    var event = new CustomEvent("open_item", {
      detail: {
        url: this.link.url 
      }
    });

    this.dispatchEvent(event);

    return;
    */
    if(this.$('#title').getAttribute('contenteditable')) return;

    if(this.classList.contains('active')) return;
    $(this).siblings('.active').removeClass('active');
    this.classList.add('active');

    this.$('#gallery').setAttribute('view', 'carousel');
    this.$('#gallery').setAttribute('onclick', false);

    
    var path = this.getAttribute('src');
    if(path && !this.article){
      this.article = document.createElement('fractal-htm');
      this.$('main').insertBefore(this.article, this.$('#owner-block'));
      this.article.setAttribute('id', 'article');
      this.article.setAttribute('placeholder', 'Write your story here');
      this.article.setAttribute('contentEditable', true);
      this.article.setAttribute('src', this.content);


      if(this.link)
        this.link.checkOwnership(own => {
          this.article[own?'setAttribute':'removeAttribute']('disabled', 'disabled');
        });
    }

    var item = this.item;
	var num_views = item.stat?((item.stat.views || 0)+1):1;
    
    if(this.link) this.link.set('stat.views', num_views);

    this.dispatchEvent(new CustomEvent("activate", {
      detail: {item},
      bubbles: true,
      cancelable: false,
      composed: true
    }));

    //setTimeout(ev => {
      //this.scrollIntoView();
      select('#body').scroll(0, 0);
    //}, 900);
  }

  deactivatea(){
    this.classList.remove('active');
    this.$('#gallery').setAttribute('view', 'fill');
    this.$('#gallery').setAttribute('onclick', 'none');

    this.dispatchEvent(new CustomEvent("deactivate", {
      detail: {item: this.item},
      bubbles: true,
      cancelable: false,
      composed: true
    }));
  }

  filla(item){
    return;
    console.log(item);
    var path = this.getAttribute('src');

    $(this).data(item);

    let title = item.title || this.item.title || item.name;
    this.$('#title').textContent = title;
    
    if(title){
      this.$('#title').removeAttribute('contenteditable');
    }
    else{
      this.$('#title').setAttribute('contenteditable', true);
      this.$('#title').focus();
    }

    if(item.description)
      this.$('#description').value = item.description;
      
    if(this.link)
      this.link.checkOwnership(own => {
        this.$('#description')[own?'setAttribute':'removeAttribute']('disabled', 'disabled');
        
        if(this.article)
           this.article[own?'setAttribute':'removeAttribute']('disabled', 'disabled');
      });

    if(this.link)
      this.$('#gallery').setAttribute('src', this.link.url);
      
    if(item.stat){
      this.$('#stat-views').innerText = item.stat.views || 0;
      this.$('#stat-comments').innerText = item.stat.comments || 0;
    }

    if(item.time) this.$('#info-when').setAttribute('datetime', (new Date(item.time)).format());

    if(item.owner){
      this.$('#owner').innerText = item.owner;
      this.$('#owner-icon').setAttribute('path', item.owner);
    }
    
    this.$('#owner-block').hidden = !item.owner;

    this.item = _.extend({}, this.item, item);
  }

  reada(){
    var item = _.extend({},
      this.item, {
      title: this.$('#title').textContent,
      description: this.$('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(account.user) item.owner = account.user.email;

    return item;
  }

  inita(){
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;
    

    this.server = Cfg.server;

    this.main_body = document.body;

    if(this.item){
      if(this.item.icon){
        if(this.item.icon.indexOf('://') + 1)
          this.icon_http = this.item.icon;
      }
    }

    /*
    this.$('#upload').addEventListener('click', ev => {
      fileDialog().then(file => {
        var path = this.getAttribute('src').replace(/\/$/, "");
        var img_url = path + '/img.jpg';
        Link(img_url).upload(file[0]).then(r => {
          var image = new Image;
          image.src = 'http'+img_url.replace(/^fs/, '');
          this.$('#img').innerHTML = '';
          this.$('#img').append(image);
          this.link.set('img', image.src);
        });
      });
    });
    */

    (new MutationObserver(m => m.forEach(mut => {
      if(mut.attributeName == 'title'){
        let title = mut.target.attributes.title.value;
        this.$('#owner').innerText = title || this.$('#owner').innerText || 'unkown';
      }
    }))).observe(this.select('#owner-icon'), {
		attributes: true
	});
    
    this.$('#gallery').addEventListener('click', ev => {
      this.activate();
    }, false);

    this.$('#title').addEventListener('click', ev => {
      this.activate();
    }, false);

    this.$('#stat-views').addEventListener('click', ev => {
      this.activate();
    }, false);
    
    this.$('#stat-comments').addEventListener('click', ev => {
      this.activate();
    }, false);

    
    
    
    this.$('#options').addEventListener('click', ev => {
      if(!this.options){
        this.options = document.createElement('fractal-options');
        this.options.setAttribute('src', this.getAttribute('src'));
        this.shadowRoot.append(this.options);
        this.options.show();        
      }
      else{
        this.options[this.options.hidden?'show':'hide'](); 
      }
    }, false);

    this.$('#x').addEventListener('click', ev => {
      this.deactivate();
    });
      
    this.$('#stat-publish').addEventListener('click', ev => {
      //this.activate();
      let item = this.read();
      //item.id = Math.random().toString(36).substr(7);
      var event = new CustomEvent("publish", {
        detail: {item}
      });

      this.dispatchEvent(event);
    }, false);

    this.$('#stat-remove').addEventListener('click', ev => {
      this.remove();
    }, false);
  }

  hrefa(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  selecta(selector){
    return this.shadowRoot.querySelector(selector);
  }

  $a(selector){
    return this.shadowRoot.querySelector(selector);
  }

  updateSrca(){
    if(!this.src) return;
  
    this.classList.remove('toCreate');
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }

  initAppa(){
    this.app_div = document.createElement('div');
    this.app_div.classList.add("app");
    this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }

  loadHTMa(){
    this.link.download(content => {
      if(!content) return;
      this.prevHTML = this.innerHTML = typeof content == 'string'?
        content:
        new TextDecoder("utf-8").decode(content || '');
      this.focus();
    });
  }
};


window.customElements.define(Component.is, Component);