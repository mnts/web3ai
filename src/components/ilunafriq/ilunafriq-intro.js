//import {styleSheets} from '//pineal.cc/src/styling.js';

class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-intro';
  }

  static get template(){
    return `
		<style>
			#block{
				display: none;
			text-align: center;
			}


		</style>
    	
    	<link rel="stylesheet" href="//var.best/design/interface.css" rel="preload" as="style">

	`
  }

  constructor() {
    super();

    this.server = Cfg.server;

    this.attachShadow({ mode: 'open' });
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome, styleSheets.interface];
    this.shadowRoot.innerHTML = Component.template;

    this.init();
  }

  init(){
    var width;
    
    this.$('#signup_fb').addEventListener('click', ev => {
    	document.querySelector('#account-side').classList.add('opened');
    });
    
    this.$('#signup_now').addEventListener('click', ev => {
    	document.querySelector('#account-side').classList.add('opened');
    });
  }

  
  static get observedAttributes(){
    return ['title', 'logo', 'src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        break;
      case 'logo':
        this.$('#logo').style.backgroundImage = `url(${newValue})`;
        break;
      case 'title':
        this.$('#head-title').innerText = newValue;
        break;
    }
  }
  
  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
