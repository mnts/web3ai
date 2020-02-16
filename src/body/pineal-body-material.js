class pineal_body extends PolymerElement{
  static get template(){
    return html`
    <link rel="stylesheet" href="//[[server]]/src/body/pineal-body.css" rel="preload" as="style">
    <link rel="stylesheet" href="//[[server]]/design/fonts.css" rel="preload" as="style">

    <style>
      #main_header {
        --app-header-background-front-layer: {
          background-image: var(--cover-image);
        };
      }

      paper-tab {
        @apply --layout-flex-none;
      }

      paper-tab a {
        @apply --layout-horizontal;
        @apply --layout-center-center;
      }

      app-header {
        opacity: 0.9;
        --app-header-shadow: {
          box-shadow: inset 0px 5px 6px -3px rgba(0, 0, 0, 0.2);
          height: 10px;
          bottom: -10px;
        };
      }
    </style>

    <div style='display: none'>
      <input type="file" id="file4cover" onchange='[[uploadCover]]'>
    </div>

    <app-header-layout has-scrolling-region>
      <app-header id='main_header' threshold='200' condenses fixed 
        effects="[[_computeEffects(fadeBackground, parallaxBackground, waterfall)]]"
        slot="header"
      >
        <app-toolbar id='toolbar_top'>
          <paper-icon-button icon="eject" id='toggle_nav'></paper-icon-button>

          <div condensed-title></div>

          <paper-icon-button id='edit' icon="create"></paper-icon-button>
          <paper-icon-button id='change_bg' icon="image:burst-mode" onclicka='[[changeCover]]'></paper-icon-button>
          <paper-toggle-button tittle='Toggle shit' checked$={{$.toggle_nav.checked}}></paper-toggle-button>
          <paper-icon-button icon="menu"></paper-icon-button>
        </app-toolbar>


        <app-toolbar id='toolbar_middle'>
          <paper-icon-button icon="chevron-left"></paper-icon-button>
          <div condensed-title></div>
          <paper-icon-button icon="chevron-right"></paper-icon-button>
        </app-toolbar>

        <app-toolbar>
          <div main-title>
            <div id="face-big"></div>
            <div id="face-text">
              <h2>{{title}}</h2>
              <h4>Distributable neuro systems</h4>
            </div>
          </div>

          <template is="dom-if" if="{{need_auth}}">
            <button id='blockstack_auth' onclick='[[blockstack_auth]]'>
              <span class='blockstack-icon'>&#8280;</span>
              Blockstack Sign In
            </button>
          </template>

          <template is="dom-if" if="{{blockstack_user}}">
            <button id='blockstack_logout' onclick='[[blockstack_logout]]'>
              <span class='blockstack-icon'>&#8280;</span>
              Sign Out
            </button>
          </template>
          <!--

            <span id='auth-or'>
              or
            </span>
          -->
        </app-toolbar>

        <paper-tabs id='main_nav' scrollable sticky>
          <paper-tab id='tab_person'>
            <a id='face' href='#home' target='_top'></a>
          </paper-tab>

          <template is="dom-repeat" items="[[tabs]]" as="tab">
            <paper-tab>
              <a href='#[[tab.id]]' target='_top'>[[tab.title]]</a>
            </paper-tab>
          </template>
        </paper-tabs>

        <template is="dom-if" if="{{blockstack_user}}">
          <div id='acc-bubble' class='if_account' style='background-image: url([[blockstack_user.image.0.contentUrl]])'></div>
        </template>
      </app-header>


      <slot></slot>
    </app-header-layout>
    `;
  }

  ready(){
    super.ready();


    this.server = Cfg.server;
    this.domain = document.location.host;

    $(this.$.change_bg).click2ipfs(hash => {
      this.background_src = 'ipfs://'+hash;
      this.link.set('element.attributes.background_src', this.background_src);
    });

    this.$.main_header.addEventListener('threshold-triggered-changed', ev => {
      this.set('threshold', ev.detail.value);
      this.$.tab_person.classList[ev.detail.value?'add':'remove']('threshold');
    });

    this.$.toggle_nav.addEventListener('checked-changed', ev => {
      this.set('nav', ev.detail.value);
      console.log(this.nv);

      this.notifyPath('$.toggle_nav.checked');
      //this.$.drawer.classList[ev.detail.value?'add':'remove']('visible');
    });

    //this.updateBackground();
    this.observeApps();

    if(this.link)
      this.link.load(item => {
        if(item.title)
          this.title = item.title;

        if(Index.stack.name)
          blockstack.lookupProfile(Index.stack.name).then(prof => {
            console.log(prof);
            this.title = prof.name;

            console.log(prof.image[0].contentUrl);
            //if(prof.image && prof.image[0])
            this.updateStyles({'--logo': 'url('+prof.image[0].contentUrl+')'});
          });
      });


    this.set('need_auth', true);
    if(window.Index && Index.stack) Index.stack.getUser().then(user => {
      this.set('blockstack_user', user);
      console.log(user);
      this.authenticated = true;
      this.need_auth = false;
    });
  }

  blockstack_auth(){
    blockstack.redirectToSignIn(
      window.location.origin, 
      window.location.origin+'/manifest.json', 
      ['publish_data', 'store_write', 'email']
    );
  }

  blockstack_logout(){
    blockstack.signUserOut(window.location.href);
    this.authenticated = false;
  }

  updateTabs(){
    var tabs = [];

    (this.nav_tabs || []).forEach(item => {
      let tab = _.pick(item, 'title', 'name');
      
      var element_name = item.element?(
        typeof item.element == 'string'?
          item.element:
          item.element.name
        ):'app';

      var id = element_name+'-'+md5(item.url);
      
      tab.title = item.title || item.title;

      tabs.push(tab);
    });

    this.childNodes.forEach(app => {
      app.classList.add('app');

      var $app = $(app);


      if(app.link && app.link.item && !$app.hasClass('notab')){
        var item = app.link.item;
        var element_name = item.element?(
          typeof item.element == 'string'?
            item.element:
            item.element.name
          ):'app';

        var id = element_name+'-'+md5(app.link.url);

        let tab = {
          id,
          title: app.link.item.title || app.link.item.name,
          name: app.link.item.name,
          node: app
        };

        tabs.push(tab);
      }

      //item.title = 
    });

    this.set('tabs', tabs);
  }

  open(app){
    if(!app.parentNode) this.append(app);
    $(app).addClass('selected').siblings('.app').removeClass('selected');
  }

  observeApps(){
    // Options for the observer (which mutations to observe)
    var config = {childList: true};

    // Callback function to execute when mutations are observed
    var callback = (mutationsList, observer) => {
      for(var mutation of mutationsList){
        if(mutation.type == 'childList'){
          this.updateTabs();
          console.log(mutation);
          for(var node of mutation.addedNodes) {

          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(this, config);


    window.addEventListener('hashchange', ev => {
    });
  }

  constructor() {
    super();
  }

  readNav(src){
    if(src) Link(src).children(links => {
      this.nav_tabs = [];
      var left = links.length;
      links.forEach(link => {
        let item = {
          url: link.url
        };

        this.nav_tabs.append(item);

        link.load(itm => {
          left--;

          _.extend(item, itm);

          if(left<1) this.updateTabs();
        });
      });
    });
  }

  changeCover(){
    this.$.file4cover.click();
  }

  uploadCover(ev){
    ev.preventDefault();

    var file = (ev.target.files || ev.dataTransfer.files)[0];

    if(!file.type.match('image.*')) return;


  }

  static get properties(){
    return{

      sections: {
        type: Array,
        value: function() {
          return [
            'feature',
            'latest',
            'fashion',
            'furniture',
            'beauty',
            'food',
            'travel',
            'projects',
            'investors'
          ];
        }
      },

      title: String,
      
      nav_src: {
        type: String,
        observer: 'readNav'
      },

      background_src: {
        type: String,
        observer: 'updateBackground',
        value: 'http://dcms.lh/img/neur.jpg'
      },

      nav_on: {
        type: Boolean,
        observer: '_observe_nav'
      },

      need_auth: {
        type: Boolean,
        notify: true,
        value: true
      },

      authenticated: {
        type: Boolean,
        notify: true,
        value: false
      },

      thresholdTriggered:{
        type: Boolean,
        observer: '_observe_threshold'
      },

      selectedTab: {
        type: Number,
        computed: '_computeSelectedTab(sections, sectionData.section)'
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

      condenses: {type: Boolean, value: true},
      fixed: {type: Boolean, value: true},
      reveals: {type: Boolean, value: false},
      shadow: {type: Boolean, value: false},
      blendBackground: {type: Boolean, value: true},
      fadeBackground: {type: Boolean, value: false},
      parallaxBackground: {type: Boolean, value: true},
      resizeSnappedTitle: {type: Boolean, value: false},
      resizeTitle: {type: Boolean, value: true},
      waterfall: {type: Boolean, value: true}
    }
  }

  updateBackground(){
    console.dir(this.background_src, 'updateBackground');

    if(!this.background_src) return;
    if(
      (this.background_src.indexOf('http://')+1)  ||
      (this.background_src.indexOf('https://')+1)
    ) return this.background_http = this.background_src;
  
    var link = Link(this.background_src);
  console.log(link);
    if(!link || !link.http) return;
    this.updateStyles({'--cover-image': 'url('+link.http+')'});
    console.log(this.customStyle);
  }

  toggleDrawer() {
    this.$.drawer.toggle();
  }

  _computeEffects(){
    return [
      this.blendBackground ? 'blend-background ' : '',
      this.fadeBackground ? 'fade-background ' : '',
      this.parallaxBackground ? 'parallax-background ' : '',
      this.resizeSnappedTitle ? 'resize-snapped-title ' : '',
      this.resizeTitle ? 'resize-title ' : '',
      this.waterfall ? 'waterfall ' : ''
    ].join('');
  }

  _removeIf(propName, value) {
    if(this[propName] && value) {
      this[propName] = false;
    }
  }


  static get observers(){
    return [];
  }
};


window.customElements.define('pineal-body', pineal_body);
