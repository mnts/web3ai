//import {styleSheets} from '../styling.js';

const select = q => document.querySelector(q);
var url = new URL(import.meta.url);

class Component extends HTMLElement{
  static get is(){
    return 'fractal-head';
  }

  static get template(){
    return `<style>
      #main_header {
        color: #fff;
        left: 0 !important;
        right: 0 !important;
        padding: 0;
        width: 100%;
        position: absolute;
        top: 0;
        background-color: var(--color);
	    transition: background-color .4s;
        z-index: 65;
        height: var(--header-height);
        --user-height: calc(var(--header-height) - 8px);
        display: none;
      }

      #nav{
        display: inline-flex;
    	padding: 0 12px 0 0;
      }


      #main_header > *, #main_header > ::slotted(*){
        vertical-align: middle;
      }

      #title{
        flex-grow: 1;
        font-size: 24px;
        margin: auto;
      } 

      @media screen and (min-width: 600px){
        #nav {
	       width: var(--nav-width);
        }
      }

      @media screen and (max-width: 800px){
        #head-title{
          display: none;
        }
      }

      #space{
      	flex-grow: 1;
      	text-align: center;
      }
    </style>
    
    <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    <link rel="stylesheet" href="//${url.host}/design/components/fractal-head.css" rel="preload" as="style">
  
    <header id='main_header' part='main'>
      <div id='nav'>
        <button id='nav-toggle' title='Navigation' class='fas fa-bars'></button>
   
        <div id='logo'></div>

        <div id='title'>
          <slot name='title'></slot>
        </div>
      </div>
      <slot name='left'></slot>

      <div id='space'>
          <slot name='center'></slot>
      </div>

      <slot></slot>


      <paper-icon-button id='wipe' icon="restore" title='Wipe and reset' on-tap="wipe"></paper-icon-button>
      <paper-toggle-button id='toggle_spell' title='Spell check' color='red'></paper-toggle-button>
      <paper-icon-button icon="copyright"></paper-icon-button>

      <div id='shadow' part='shadow'></div>
    </header>
    `;
  }

  constructor() {
    super();

    this.server = url.host;

    this.attachShadow({ mode: 'open' });
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;

    this.init();
  }

  init(){
    var width;
    var that = this;

    this.main = this.$("#main_header");
    
    /*
    interact(this.$('#nav-toggle')).draggable({
      onstart(ev){
        width = $('#nav').width();
      },

      onmove(ev){
        width += ev.dx;
        that.parentNode.style.setProperty('--nav-width', width+'px');
      },

      onend(ev){
        console.log(ev);
        //chrome.storage.sync.set({'nav-width': $('#nav').width()});
      }
    });
    */


    this.main.addEventListener('click_node', ev => {
        this.open(ev.detail.node);
    });
    
	/*
    interact(this.$('#nav-toggle')).on('tap', ev => {
      this.load_nav();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });
    */

    const side = select('#navigation-side'),
	      icon = this.select('#nav-toggle');

	let toggleIcon = () => {
		var isOpened = side.classList.contains('opened');
		icon.classList[isOpened?'add':'remove']('close');
	}

	(new MutationObserver(muts => muts.forEach(mut => {
		if(mut.attributeName == 'class')
			toggleIcon();
	}))).observe(side, {
		attributes: true
	});

	icon.addEventListener('click', ev => {
		side.classList.toggle('opened');

		if(!select('#navigation')){
			let tag = this.getAttribute('navigation') || 'pineal-nav';

			var tpl = document.createElement('template');						
			tpl.innerHTML = `<${tag} id='navigation' src='${Index.main_url}'></${tag}>`;

			side.appendChild(tpl.content);

		}
	});

	var clickLogo = ev => {
		let href = this.getAttribute('href');
		if(href)
			document.location.href = href;
		else
			this.goHome();
	};

    this.$('#logo').addEventListener('click', clickLogo);
    this.$('#title').addEventListener('click', clickLogo);
  }

  open(node){
    //console.dir(node);
     if(node instanceof HTMLElement){
    /*
        if(node.tagName == 'DIV' || typeof node.can != 'function'){
          $('#head-add').hidden = true;
          $('#head-upload').hidden = true;
          $('#head-options').hidden = true;
        }
        else{
          node.can('add').then(() => {
            $('#head-add').hidden = false;
          }, () => {
            $('#head-add').hidden = true;
          });

          node.can('upload').then(() => {
            $('#head-upload').hidden = false;
          }, () => {
            $('#head-upload').hidden = true;
          });
        }
     */
       return;
     }


      if(node.isFolder()) return node.toggle();

      $('.tree .active').removeClass('active');

      if(node.neuron && node.neuron.open){
          node.neuron.open();
          
          if(document.body.classList.contains('mobile'))
              document.body.classList.add("closed");
      }
      else
          node.toggle();

    	document.body.classList.remove('home');
      node.$node.addClass('initiated active');
  }

  goHome(){
    document.getElementById('body').open('#home')
    document.body.classList.add('home');
	var activated = document.querySelector('.item[activated]');
	if(activated) activated.deactivate()
	history.replaceState({}, null, "/");
  }

  
  static get observedAttributes(){
    return ['title', 'menu_icon', 'logo', 'src', 'style_src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        break;

      case 'style_src':
      	let node = document.createElement("link");
      	node.rel = "stylesheet";
      	node.href= newValue;

      	this.main.append(node);
		break;

	  case 'menu_icon':
	      if(newValue == 'false')
	          this.select('#nav-toggle').remove();
	      else
            this.select('#nav-toggle').setAttribute('class', 'fas '+newValue);
		break;
		
      case 'logo':
	      if(newValue == 'false')
	          this.select('#logo').remove();
	          
        this.$('#logo').style.backgroundImage = `url(${newValue})`;
        break;
      case 'title':
      case 'title':
        this.$('#title').innerText = newValue;
        break;
    }
  }

  wipe(){
    if(confirm('Reset and wipe all local data saved by pineal tab?')){
      chrome.storage.sync.clear();
      location.href = location.href;
    }
  }

  load_nav(ev){
    let toggle = () => document.body.classList.toggle('closed');
    if(this.previousElementSibling.nodeName == 'PINEAL-NAV'){
      toggle();
      return;
    }

    this.$nav = $("<pineal-nav>", {
      src: 'mem://self/Lib.item'
    //  class: 'closed'
    }).insertBefore(this);
    setTimeout(ev => toggle(), 20);
  }
  
  toggleDrawer() {
    this.$.drawer.toggle();
  }

  select(qs){
    return this.shadowRoot.querySelector(qs);
  }
  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
