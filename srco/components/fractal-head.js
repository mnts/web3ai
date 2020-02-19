//import {styleSheets} from '../styling.js';


class Component extends HTMLElement{
  static get is(){
    return 'fractal-head';
  }

  static get template(){
    return `
    
    <style>
      #main_header {
        color: #fff;
        left: 0 !important;
        right: 0 !important;
        padding: 0;
        width: 100%;
        background: var(--bg-grad);
        position: absolute;
        top: 0;
        z-index: 46;
        height: var(--header-height);
        --user-height: calc(var(--header-height) - 8px);
        display: none;
      }

      #nav{
        display: inline-flex;
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
    </style>
    
    <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    <link rel="stylesheet" href="//${Cfg.server}/design/components/fractal-head.css" rel="preload" as="style">
  
    <header id='main_header'>
      <div id='nav'>
        <div id='logo'></div>

        <div id='title'>
          <slot name='title'></slot>
        </div>
        <button id='nav-toggle' title='Navigation' class='fas fa-bars'></button>
      </div>

      <slot></slot>

      <paper-icon-button id='wipe' icon="restore" title='Wipe and reset' on-tap="wipe"></paper-icon-button>
      <paper-toggle-button id='toggle_spell' title='Spell check' color='red'></paper-toggle-button>
      <paper-icon-button icon="copyright"></paper-icon-button>

      <div id='shadow'></div>
    </header>
    `;
  }

  constructor() {
    super();

    this.server = Cfg.server;

    this.attachShadow({ mode: 'open' });
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;

    this.init();
  }

  init(){
    var width;
    var that = this;

    this.main = this.$("#main_header");
    
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


    this.main.addEventListener('click_node', ev => {
        this.open(ev.detail.node);
    });
    

    interact(this.$('#nav-toggle')).on('tap', ev => {
      this.load_nav();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });

    this.$('#logo').addEventListener('click', this.goHome);
    this.$('#title').addEventListener('click', this.goHome);
  }

  open(node){
      if(node.isFolder()) return node.toggle();

      $('.tree .active').removeClass('active');

      if(node.neuron && node.neuron.open){

          node.neuron.open();

          if(document.body.classList.contains('mobile'))
              document.body.classList.add("closed");
      }
      else
          node.toggle();

      node.$node.addClass('initiated active');
  }

  goHome(){
    var container = document.querySelector('#home');
    $(container).addClass('selected').siblings('.app').removeClass('selected');
    $('#nav .active').removeClass('active');
  }

  
  static get observedAttributes(){
    return ['title', '', 'logo', 'src'];
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
      node_src: 'mongo://localhost:4000/tree?domain=pineal.lh',
    //  class: 'closed'
    }).insertBefore(this);
    setTimeout(ev => toggle(), 20);
  }
  
  toggleDrawer() {
    this.$.drawer.toggle();
  }
  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
