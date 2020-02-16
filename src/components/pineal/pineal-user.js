import servers from '../../data/servers.js';
import User from '../../acc/User.js';

//import {styleSheets} from '../styling.js';


class element extends HTMLElement{
  static get is(){
    return 'pineal-user';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          display: inline-block;
          margin: 1px;
          width: 48px;
	      height: 48px;
	      vertical-align: middle;
        }

        main{
          margin-right: 8px;
          font-size: calc(var(--header-height) - 22px);
          z-index: 201;
          text-align: center;
          color: white;
          cursor: pointer;
          border-radius: 50%;
          box-sizing: border-box;
          display: inline-block;
          width: inherit;
	      height: inherit;
	      margin: 0;
	      padding: 0;
	      overflow: hidden;
          background-color: #dcdcdc4f;
          background-image: url('/design/user.png');
          background-size: 32px 32px;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        main > img, main > video, main > pineal-media{
	      margin: 0;
	      padding: 0;
	      	width: inherit;
			height: inherit;
        }
      </style>

	  <main></main>
    `;
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


  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.init();
  }

  init(){
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = element.template;
    this.main = this.select('main');
	
	document.body.addEventListener('authenticated', ev => {
		var user = ev.detail.user;
		if(this.user && user.email == this.user.email)
			this.load(user.email);
	});
  }

  load(path){
     this.user = User(path);

     this.user.load(item => {
     	if(!item) return;
        
        this.setAttribute('title', item.title || item.name || item.email || item.owner);

		this.dispatchEvent(new CustomEvent("loaded", {
		  detail: {item, user: this.user}
		}));
        
		if(item.image){
		   var media = document.createElement('fractal-media');
		   media.classList.add('fill');
		   media.setAttribute('src', item.image);

		   this.main.innerHTML = '';
		   this.main.append(media);
		}
     });

  }

  static get observedAttributes(){
    return ['src', 'path', 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.load(newValue);
        break;
      case 'path':
        this.load(newValue);
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
