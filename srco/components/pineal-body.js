//import {styleSheets} from '../styling.js';


class Component extends HTMLElement{
  static get is(){
    return 'pineal-body';
  }

  static get template(){
    return `
    <link rel="stylesheet" href="//${Cfg.server}/src/components/pineal-body.css" rel="preload" as="style">
    
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
        z-index: 9;
        height: var(--header-height);
        display: flex;
        --user-height: calc(var(--header-height) - 8px);
      }


      #main_header > *, #main_header > ::slotted(*){
        vertical-align: middle;
      }

      #head-title{
        flex-grow: 1;
      }

      @media screen and (min-width: 750px){
        #nav{
          display: none;
        }
      }
    </style>

      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">


    <main>
      <header id='main_header'>
        <button id='nav' title='Navigation' class='fas fa-bars'></button>
        <div style="background-image: url(/img/logo.png)" id='logo'></div>

        <div id='head-title'></div>

        <slot name='ctrl'></slot>

        <paper-icon-button id='wipe' icon="restore" title='Wipe and reset' on-tap="wipe"></paper-icon-button>
        <paper-toggle-button id='toggle_spell' title='Spell check' color='red'></paper-toggle-button>
        <paper-icon-button icon="copyright"></paper-icon-button>

        <div id='shadow'></div>
      </header>

      <div id='content'>
        <slot></slot>
      </div>
    </main>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;

    this.init();
  }

  init(){

    this.server = Cfg.server;

    this.main_body = document.body;

    

    var width;
    
    interact(this.$('#logo')).draggable({
      onstart(ev){
        width = $('#nav').width();
      },

      onmove(ev){
        width += ev.dx;
        this.parentNode.updateStyles({'--nav-width': width+'px'});
      },

      onend(ev){
        console.log(ev);
        //chrome.storage.sync.set({'nav-width': $('#nav').width()});
      }
    });

    interact(this.$('#nav')).on('tap', ev => {
      this.load_nav();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });

    /*
    this.set('need_auth', true);
    Index.stack.getUser().then(user => {
      this.set('blockstack_user', user);
      console.log(user);
      this.authenticated = true;
      this.need_auth = false;
    });
    */
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
      console.log(document.body.classList);
      toggle();
      return;
    }

    this.$nav = $("<pineal-nav>", {
      node_src: 'mongo://localhost:4000/tree?domain=pineal.lh',
    //  class: 'closed'
    }).insertBefore(this);
    setTimeout(ev => toggle(), 20);
  }

  
  open(app){
    if(!app.parentNode) this.append(app);
    $(app).addClass('selected').siblings('.app').removeClass('selected');
  }

  toggleDrawer() {
    this.$.drawer.toggle();
  }


  static get observers(){
    return [];
  }

  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
