class element extends PolymerElement{
  static get template(){
    return html`
    <link rel="stylesheet" type="text/css" rel="preload" as="style" href="//${Cfg.server}/src/body/pin-body.css">


    <style>
      #logo{
        background-image: url('//${Cfg.server}/img/notospy.png');
      }


      paper-tab {
        @apply --layout-flex-none;
        --paper-tab-ink: var(--color2);
      }

      paper-tab a {
        @apply --layout-horizontal;
        @apply --layout-center-center;
      }
    </style>


    <template is="dom-if" if="{{blockstack_user}}">
      <style>
        .if_account{
          display: block;
        }

        .no_account{
          display: hidden;
        }
      </style>
    </template>


    <template is="dom-if" if="{{!blockstack_user}}">
      <style>
        .if_account{
          display: hidden;
        }

        .no_account{
          display: block;
        }
      </style>
    </template>

    <main>
      <app-toolbar id='main_header'>
        <div id='logo'></div>


        <paper-tabs id='main_nav'>
          <paper-tab id='tab_person'>
            <div id='face'></div>
            <a>{{title}}</a>
          </paper-tab>


          <paper-tab>
            <a>Trending</a>
          </paper-tab>

          <paper-tab>
            <a>New</a>
          </paper-tab>
          
          <paper-tab>
            <a>Hot</a>
          </paper-tab>

          <paper-tab>
            <a>Promoted</a>
          </paper-tab>

          <paper-tab>
            <paper-icon-button icon="lock"></paper-icon-button>
          </paper-tab>
        </paper-tabs>
            
        <button id='blockstack_auth' class='no_account'>
          <span id='auth-blockstack-icon'>&#8280;</span>
          Blockstack Sign In
        </button>

        <template is="dom-if" if="{{blockstack_user}}">
          <div id='acc-bubble' class='if_account' style='background-image: url([[blockstack_user.image.0.contentUrl]])'></div>
        </template>

        <paper-icon-button id='edit' icon="create"></paper-icon-button>
        <paper-toggle-button tittle='Toggle' checked$={{$.toggle_nav.checked}}></paper-toggle-button>
        <paper-icon-button icon="menu"></paper-icon-button>
      </app-toolbar>

      <slot></slot>
    </main>
    `;
  }

  ready(){
    super.ready();

    this.server = Cfg.server;

    $(this.$.change_bg).click2ipfs(hash => {
      console.log(hash);
      var link = new Link('ipfs://'+hash);

      console.log(link);
    });

    this.$['blockstack_auth'].addEventListener('click', ev => {
      blockstack.redirectToSignIn();
    });
    
    Index.getBlockstackUser().then(user => {
      this.set('blockstack_user', user);
    });

    this.$.edit.addEventListener('click', ev => {
      document.getElementById('nav').classList.toggle('closed');
    });
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

  toggleDrawer() {
    this.$.drawer.toggle();
  }


  static get observers(){
    return [];
  }
};


window.customElements.define('pin-body', element);
