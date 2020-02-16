//import {styleSheets} from '../styling.js';


class Component extends HTMLElement{
  static get is(){
    return 'fractal-options';
  }

  static get template(){
    return `
    <style>
    	:host{
    		position: absolute;
    	}

		@media screen and (max-width: 800px){
			:host{
				//position: fixed;
			}
		}

		main{
			display: none;
		}
    </style>
    
    <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    <link rel="stylesheet" href="//${Cfg.server}/design/components/fractal-options.css" rel="preload" as="style">
  	
  	<main>
		<!--
		<h3 id='url'></h3>
		-->

		<button id='upload'>
			<i class='fas fa-file-upload'></i>
			Upload media
		</button>

		<button id='rename'>
			<i class='fas fa-signature'></i>
			Rename
		</button>

		<button id='remove'>
			<i class='fas fa-trash'></i>
			Remove
		</button>
	</main>
    `;
  }

  constructor() {
    super();

    this.server = Cfg.server;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.constructor.template;

    this.main = this.select('main');

    this.init();

    //this.hide();
  }

  init(){
    var width;
    var that = this;
	
    this.select('#upload').addEventListener('click', this.upload);
  }

  upload(){
  	
  }

  show(){
  	this.hidden = false;

  	setTimeout(ev => {
		this.outsideListener = ev => {
			if(!ev.path.some(el => (el == this)))
				this.hide(ev);
		};

		document.addEventListener('click', this.outsideListener);
  	}, 40);
  }

  hide(){
  	this.hidden = true;
	if(this.outsideListener) document.removeEventListener('click', this.outsideListener);
	delete this.outsideListener;
  }

  load(){
  	this.link.load(item => {
  		if(!item) return;
  		//this.select('#title').text(item.title || item.name);
  	});
  }
  
  static get observedAttributes(){
    return ['src', '', 'logo', 'src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        break;
    }
  }
  
  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
