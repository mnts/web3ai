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
      <link rel="stylesheet" href="//${url.host}/src/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <link rel="stylesheet" href="//${url.host}/design/tree.css" rel="preload" as="style">
      <style>
          .tree menu{
              display: none;
          }
      </style>
      
      <button id='x' @click='${this.deactivate}'></button>
      <main class=${this.own?'own':''}>
      
        <div id="owner-block">
            <pineal-user id='owner-icon' @loaded='${this.on_user}' @click='${this.click_user}' path="${this.item.owner || this.user_item.owner}"></pineal-user>
            <div id='owner-info'>
              <a id='owner' href='${this.user && this.user.href}' target='_blank'>
                  ${this.user_item.title  || ('#'+this.user.id)}
              </a>

              ${this.item.owner}&nbsp;
              <!--<div id='owner_seeds' @click='${this.assign_seeds}'></div>-->
            </div>
            <button id='options' class='icon fas fa-ellipsis-v'></button>
        </div>

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

        <fractal-select disabled='${!this.own}' id='category' @selected='${this.selected_category}' list_src='${Cfg.story.categories_src}' selected_src='${this.item.parent}'>
            no category
        </fractal-select>
        
        <fractal-select disabled='${!this.own}' id='genre' @selected='${this.selected_genre}' list_src='${Cfg.story.genres_src}' selected_src='${this.item.genre}'>
            no genre
        </fractal-select>
        
        
        ${this.been_activated?html`
          <fractal-htm id='article' ?editable='${!this.own}' ?disabled='${!this.own}' placeholder='Write your story here' src='${this.src}'></fractal-htm>
        `:''}
        

        <div id='info'>

          <input name='value' title='seeds' type='number' disabled='disabled' @change='${this.change}' value='${this.item.value || 0}'/>
          
          <relative-time id='info-when' datetime='${this.datetime}'></relative-time>
          

          <div id="info-block">
              <span class="forPublished" id='stat-likes'>
                  <fractal-rate @rate='${this.do_rate}' src='${this.src}'></fractal-rate>
                  ${this.item.rating?(`${Math.round(this.item.rating.average*10)/10}/${this.item.rating.total}`):''}
              </span>
              <span class="fas fa-eye forPublished" id='stat-views'>${this.item.num_views || 0}</span>
              <span @click='${this.activate_comm}' class="fas fa-comments forPublished" id='stat-comments'>${this.item.num_comments || 0}</span>
              <span class='fas fa-trash forCreate forEdit' @click='${this.do_remove}' id='stat-remove'>Remove</span>
              <span class='fas fa-check forCreate' @click='${this.do_publish}' id='stat-publish'>Publish</span>
          </div>

          <div id='share'>
			  <a href='https://www.facebook.com/sharer/sharer.php?u=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}&t=${this.item.title}' class="resp-sharing-button__link" target='_blank' aria-label="Share on Facebook">
				<div class="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
				  </div>Share on Facebook</div>
			  </a>

			  <a class="resp-sharing-button__link" href="https://twitter.com/intent/tweet/?text=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}" target="_blank" rel="noopener" aria-label="Share on Twitter">
				<div class="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
				  </div>Tweet on Twitter</div>
			  </a>

			  <!-- Sharingbutton E-Mail -->
			  <a class="resp-sharing-button__link" href="mailto:?subject=Super%20fast%20and%20easy%20Social%20Media.&amp;body=${encodeURI('https://'+location.host+'/stories/'+this.item.name)}" target="_self" rel="noopener" aria-label="Share by E-Mail">
				<div class="resp-sharing-button resp-sharing-button--email resp-sharing-button--large"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.25 14.43l-3.5 2c-.08.05-.17.07-.25.07-.17 0-.34-.1-.43-.25-.14-.24-.06-.55.18-.68l3.5-2c.24-.14.55-.06.68.18.14.24.06.55-.18.68zm4.75.07c-.1 0-.2-.03-.27-.08l-8.5-5.5c-.23-.15-.3-.46-.15-.7.15-.22.46-.3.7-.14L12 13.4l8.23-5.32c.23-.15.54-.08.7.15.14.23.07.54-.16.7l-8.5 5.5c-.08.04-.17.07-.27.07zm8.93 1.75c-.1.16-.26.25-.43.25-.08 0-.17-.02-.25-.07l-3.5-2c-.24-.13-.32-.44-.18-.68s.44-.32.68-.18l3.5 2c.24.13.32.44.18.68z"/></svg></div>Send by E-Mail</div>
			  </a>     
	      </div>


          <div id='extra'></div>
          <div id='feedback-block'>
            ${this.been_activated?html`
              <fractal-comments src='${this.src}'></fractal-comments>
            `:''}
          </div>
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