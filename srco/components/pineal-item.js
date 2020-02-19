//import {styleSheets} from '../styling.js';
import {fix4name} from '../utilities/item.js';
import servers from '../data/servers.js';


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
        }

        #img{
          min-height: 20px;
        }
      </style>
      
      <link rel="stylesheet" href="//${Cfg.server}/design/components/pineal-item.css">

      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">



      <main>
        <button id='x' class='fas fa-times'></button>
        <div id='img'></div>
        <button id='upload'>
          <i class='fas fa-upload'></i>
        </button>
        <input id='title' placeholder='write title'/>
        <textarea id='description' placeholder='Short description of the story'></textarea>

        <div id="owner-block">
            <img src="//${Cfg.server}/design/user.png" alt='O'/>
            <div id='owner-info'>
              <a id='owner'></a>
              <relative-time id='info-when'></relative-time>
            </div>
        </div>

        <div id="info-block">
            <span class="fas fa-thumbs-up forPublished" id='stat-likes'>0</span>
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
    
    var event = new CustomEvent("open_item", {
      detail: {
        url: this.link.url 
      }
    });

    console.log(event);
    this.dispatchEvent(event);

    return;
    
    if(this.classList.contains('active')) return;
    $(this).siblings('.active').removeClass('active');
    this.classList.add('active');
    
    var path = this.getAttribute('src');
    if(path && !this.$('#article').getAttribute('src')) this.$('#article').setAttribute('src', path.replace(/\/$/, "") + '/article.htm');
  }

  fill(item){
    var path = this.getAttribute('src').replace(/\/$/, "");

    this.$('#title').value = item.title || item.name;
    this.$('#description').value = item.description;

    if(item.img){
      var image = new Image;
      image.src = item.img;
      image.onload = ev => {
        this.$('#img').append(image);
      };
    }

    if(item.stat){
      this.$('#stat-likes').innerText = item.stat.likes;
      this.$('#stat-views').innerText = item.stat.views;
      this.$('#stat-comments').innerText = item.stat.comments;
    }


    if(item.time) this.$('#info-when').setAttribute('datetime', (new Date(item.time)).format());

    this.$('#owner').innerText = item.owner || 'anonymous';

    this.item = _.extend({}, this.item, item);
  }

  read(){
    var item = _.extend({},
      this.item, {
      title: this.$('#title').value,
      description: this.$('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(Acc.main) item.owner = Acc.main.user.email;

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
    
    this.$('#title').addEventListener('click', ev => {
      console.log(ev);
      this.activate();
    }, false);
    
    this.$('#img').addEventListener('click', ev => {
      this.activate();
    }, false);

    this.$('#x').addEventListener('click', ev => {
      this.classList.remove('active');
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

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }


  updateSrc(){
    if(!this.src) return;
  
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }

  static get observedAttributes(){
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log(name, oldValue, newValue);
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        this.$('#title').setAttribute('disabled', 'disabled');
        this.$('#description').setAttribute('disabled', 'disabled');
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