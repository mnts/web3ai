class Component extends Lib.GestureEventListeners(PolymerElement){
  static get is(){
    return 'pineal-body';
  }

  static get template(){
    return html`
    <link rel="stylesheet" href="//{{server}}/src/body/pineal-body.css" rel="preload" as="style">
    
    <style>
      :host{
        overflow: important;
      }
    
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
        height: 48px;
        display: flex;
      }


      #main_header > *, #main_header > ::slotted(*){
        vertical-align: middle;
        height: 42px;
        margin: auto;
      }

      #main_header > ::slotted(paper-icon-button){
        display: inline-block !important;
      }

      #content{
        padding-top: 50px;
        height: calc(100vh - 50px);
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

    <main>
      <header id='main_header'>
        <paper-icon-button id='nav' title='Navigation' icon='menu'></paper-icon-button>
        <paper-icon-button src="/img/logo.png" id='logo'></paper-icon-button>

        <div id='head-title'></div>

        <slot name='ctrl'></slot>


        <!--
        <paper-icon-button id='wipe' icon="restore" title='Wipe and reset' on-tap="wipe"></paper-icon-button>
        <paper-toggle-button id='toggle_spell' title='Spell check' color='red'></paper-toggle-button>
        <paper-icon-button icon="copyright"></paper-icon-button>
        -->
        <div id='shadow'></div>
      </header>

      <div id='content'>
        <slot></slot>
      </div>
    </main>
    `;
  }

  ready(){
    super.ready();

    this.server = Cfg.server;

    this.main_body = document.body;

    var width;
    
    interact(this.$.logo).draggable({
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

    interact(this.$.nav).on('tap', ev => {
      this.load_nav();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });
    /*

    this.$.toggle_spell.addEventListener('change', ev => {
      console.log(ev.detail);
      document.body.spellcheck = ev.detail;
    });

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

  constructor() {
    super();
  }

  static get properties(){
    return{
      title: {
        type: String
      },

      nav_on: {
        type: Boolean,
        observer: '_observe_nav'
      },

      nv: {
        type: Boolean,
        notify: true,
        value: true,
        readOnly: false
      },

      nav: {
        type: Boolean,
        notify: true,
        value: false
      },

      thresholdTriggered:{
        type: Boolean,
        observer: '_observe_threshold'
      },

      items: {type: Array},

      featuredItems: {type: Array},

      page: {
        type: String,
        computed: '_computePage(onDetailPage)',
        reflectToAttribute: true
      },

      route: Object,
      subRoute: Object,
      sectionData: Object,
      idData: Object,
      onDetailPage: Boolean,
    }
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
};


window.customElements.define(Component.is, Component);
