//import {styleSheets} from '../styling.js';
import servers from '../../data/servers.js';
import Link from '../../data/Link.js';

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

        <button id='delete'>
          &#9986;
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

    this.classList.toggle('active');

    this.dispatchEvent(event);
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.constructor.template;

    this.item = {};

    this.init();
  }

  init(){
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    
    this.main = this.select('main');
   
    this.server = Cfg.server;

    this.main_body = document.body;

    this.main.addEventListener('click', ev => {
      this.activate();
    }, false);

    this.select('#delete').addEventListener('click', ev => {
      let gallery = this.parentNode.component;
      this.remove();
      console.log(this, this.parentNode);
      gallery.saveOrder();
    });

    var src = this.getAttribute('src');
    if(src) this.loadImg(src);
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
      video: ['mp4', 'avi', 'mpeg', 'webm'],
      audio: ['mp3', 'wav', 'acc'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      iframe: ['txt', 'pdf']
    };
  }

  connectedCallback(){
      var gallery = this.parentNode.component;
      if(gallery && gallery.link) 
        gallery.link.checkOwnership(own => {
          this.main.classList[own?'add':'remove']('own');
        });
  }

  loadImg(src){
    console.log(src);
     this.link = Link(src);
      

     if(!this.img){
       if(this.link && this.link.ext && this.ext.video.indexOf(this.link.ext)+1){
         this.img = document.createElement('img');
         this.img.controls = true;
       }
       else
        this.img = new Image;
       
       this.main.append(this.img);
     }


     this.main.append(this.img);

     this.link.load(item => {
       this.item = item;
       
       if(item.src){
			var video = this.parseVideoURL(item.src),
				vid = video.provider;
		}

        if(!item){
          this.img.src = this.link.http;
        }
        else
        if(
          (new RegExp('(' + this.ext.image.join('|').replace(/\./g, '\\.') + ')$')).test(item.name) || 
          (item.mime && item.mime.indexOf('image')+1)
        ){
          this.img.src = item.src || this.link.http;
        } 
        else
        if(
          (new RegExp('(' + this.ext.audio.join('|').replace(/\./g, '\\.') + ')$')).test(item.name) || 
          (item.mime && item.mime.indexOf('audio')+1)
        ){
          var audio = document.createElement('audio');
          this.img.replaceWith(audio);
          this.img = audio;

          var source = document.createElement('source');
          source.src = this.link.http;
          source.type = item.mime;
          audio.append(source);

          audio.controls = true;

          this.main.classList.add('audio');
        } 
        else
        if((new RegExp('(' + this.ext.video.join('|').replace(/\./g, '\\.') + ')$')).test(item.name)){
          var video = document.createElement('video');
          this.img.replaceWith(video);
          this.img = video;

          var source = document.createElement('source');
          source.src = this.link.http;
          source.type = item.mime;
          video.append(source);

          video.controls = true;
        } 
        /*
        else
        if((new RegExp('(' + this.ext.iframe.join('|').replace(/\./g, '\\.') + ')$')).test(item.name)){
          var cont = document.createElement('iframe');
          var url = this.link.http;
          if(url.indexOf('//') == 0) url = 'https:'+url;
          cont.src = 'https://docs.google.com/viewer?url='+url;
          cont.type = item.mime;

          this.img.replaceWith(cont);
          this.img = cont;
        } 
        */
        else
        if(item.segments){
          import('/components/gif.js').then(m => {
            let Gif = m.default;
            let src;

            if(item.ipfs)
              src = 'ipfs://'+item.ipfs;
            else
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
        if(item.ipfs)
          this.img.src = Link('ipfs://'+item.ipfs).http;
        else
        if(item.file && this.link.domain == 'io.cx')
          this.img.src = '//f.io.cx/'+item.file;
        else
        if(video && video.provider == 'youtube'){
          var frame = document.createElement("iframe");
          frame.setAttribute('allowfullscreen', "allowfullscreen");
          this.img.replaceWith(frame);
          frame.src = 'https://www.youtube.com/embed/'+video.id;
          this.img = frame;
        }
        else
        if(item.src && (item.src.indexOf('http')+1)){
          this.img.src = item.src;
        }
        else{
          var a = document.createElement('a');
          this.img.replaceWith(a);
          this.img = audio;
          a.href = this.link.http;
          a.target = '_blank';
          a.download = item.name;
          a.innerText = item.name;
        }


       var gap = document.createElement('div');
       gap.id = 'gap'
       this.main.prepend(gap);
        
     });
     //if(this.link.http) this.img.src = this.link.http;
  }

  // give an URL and return direct address to that video iframe
  parseVideoURL(url){
      if(typeof url !== 'string') return;
      function getParm(url, base){
            var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
            var matches = url.match(re);
            if (matches) {
                return(matches[2]);
            } else {
                return("");
            }
        }

        var retVal = {};
        var matches;
        var success = false;

        if(url.match('http(s)?://(www.)?youtube|youtu\.be') ){
          if (url.match('embed')) { retVal.id = url.split(/embed\//)[1].split('"')[0]; }
            else { retVal.id = url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
            retVal.provider = "youtube";
            var videoUrl = 'https://www.youtube.com/embed/' + retVal.id + '?rel=0';
            success = true;
        } else if (matches = url.match(/vimeo.com\/(\d+)/)) {
            retVal.provider = "vimeo";
            retVal.id = matches[1];
            var videoUrl = 'http://player.vimeo.com/video/' + retVal.id;
            success = true;
        }

       return retVal;
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