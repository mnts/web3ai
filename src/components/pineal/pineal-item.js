//import {styleSheets} from '../styling.js';
import account from '../../account.js';
import {fix4name} from '../../utilities/item.js';
import servers from '../../data/servers.js';
import {find2define} from '../../services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;

const url = new URL(import.meta.url);


class Component extends HTMLElement{
  static get is(){
    return 'pineal-item';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
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
      </style>
      
      <link rel="stylesheet" href="//${url.host}/design/components/pineal-item.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main>
        <button id='x'></button>
        <pineal-gallery id='gallery' view='fill'></pineal-gallery>
        <h2 id='title' placeholder='Title'></h2>
        <textarea id='description' placeholder='Short description'></textarea>
                
        <div id="owner-block">
            <pineal-user id='owner-icon'></pineal-user>
            <div id='owner-info'>
              <a id='owner'></a>
              <relative-time id='info-when'></relative-time>
            </div>
            <button id='options' class='icon fas fa-ellipsis-v'></button>
        </div>

        <div id="info-block">
            <span class="forPublished" id='stat-likes'>
              <fractal-rate value="3" average='4'></fractal-rate>
            </span>
            <span class="fas fa-eye forPublished" id='stat-views'>0</span>
            <span class="fas fa-comments forPublished" id='stat-comments'>0</span>
            <span class="fas fa-trash forCreate forEdit" id='stat-remove'>Remove</span>
            <span class="fas fa-check forCreate" id='stat-publish'>Publish</span>
        </div>
        <slot></slot>
      </main>
    `;
  }

  load(){
    this.link.load(item => this.fill(item));
  }

  activate(){
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

  deactivate(){
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

  fill(item){

    console.log(item);
    var path = this.getAttribute('src');

    $(this).data(item);

    let title = item.title || this.item.title || item.name;
    this.$('#title').textContent = title;

    console.log(title);
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

  read(){
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

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
  }

  init(){
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

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  updateSrc(){
    if(!this.src) return;
  
    this.classList.remove('toCreate');
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }

  static get observedAttributes(){
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  initApp(){
    this.app_div = document.createElement('div');
    this.app_div.classList.add("app");
    this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }

  loadHTM(){
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