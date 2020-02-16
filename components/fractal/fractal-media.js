//import {styleSheets} from '../styling.js';
import servers from '../../src/data/servers.js';

var url = new URL(import.meta.url);

class Component extends HTMLElement{
  static get is(){
    return 'fractal-media';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
          vertical-align: top;
          scroll-snap-align: start;
        }

        #img{
          min-height: 20px;
        }

        #title{
          display: none;
        }

        #owner-block{
          display: none;
        }
      </style>
      
      <link rel="stylesheet" href="//${url.host}/design/components/fractal-photo.css">
      
      <main>
        <h2 id='title'></h2>

        <div id="owner-block">
            <img src="//${url.host}/design/user.png" alt='O'/>
            <div id='owner-info'>
              <a id='owner'></a>
              <relative-time id='info-when'></relative-time>
            </div>
        </div>

        <slot></slot>
      </main>
    `;
  }
  
  load(){
    this.link.http;
  }

  activate(){
    if(this.classList.contains('fill')) return;
    if(!this.parentNode) return;
    if(this.parentNode.getAttribute('onclick') == 'none') return;
    
    var event = new CustomEvent("zoom_item", {
      detail: {
        url: this.link.url 
      }
    });

    this.main.classList.toggle('active');

    this.dispatchEvent(event);
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
    
    this.main = this.select('main');
   
    this.server = Cfg.server;

    this.main_body = document.body;

    this.main.addEventListener('click', ev => {
      this.activate();
    }, false);
  }

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  
  static get observedAttributes(){
    return ['src'];
  }

  get ext(){
    return {
      video: ['mp4', 'avi', 'mpeg', 'webm']
    };
  }

  loadImg(src){
     this.link = Link(src);
     if(!this.img){
       if(this.link && this.link.ext && this.ext.video.indexOf(this.link.ext)+1){
         this.img = document.createElement('video');
         this.img.controls = true;
       }
       else
        this.img = new Image;
       
       this.main.append(this.img);
     }

     this.link.load(item => {
        if(item.segments){
          import('/components/gif.js').then(m => {
            let Gif = m.default;
            let src;
            if(item.file && this.link.domain == 'io.cx')
              src = '//f.io.cx/'+item.file;
            
            if(src){
              this.gif = new Gif(src, gif => {
                this.gif.canvas.addEventListener('click', ev => {
                  this.gif.play();
                });
                this.img.replaceWith(this.gif.canvas);
              });
            }
            else this.img.src = item.src;
          });
        }
        else
        if(item.src)
          this.img.src = item.src;
        else
        if(item.file && this.link.domain == 'io.cx')
          this.img.src = '//f.io.cx/'+item.file;
     });
     if(this.link.http) this.img.src = this.link.http;
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.loadImg(newValue);
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }
};


window.customElements.define(Component.is, Component);