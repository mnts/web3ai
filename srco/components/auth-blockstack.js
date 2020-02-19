class element extends PolymerElement{
  static get is(){
    return 'auth-blockstack';
  }

  static get template(){
    return html`
      <link rel="stylesheet" href="//[[server]]/src/components/auth-blockstack.css" rel="preload" as="style">
      <style>
        main{
          display: block;
        }

        :host{
          display: block;
        }
      </style>
      

      <template is="dom-if" if="{{need_auth}}">
        <button id='blockstack_auth' onclick='[[blockstack_auth]]'>
          <img src='//[[server]]/img/blockstack.png'/>
          Sign In
        </button>
      </template>

      <template is="dom-if" if="{{blockstack_user}}">
        <button id='blockstack_logout' onclick='[[blockstack_logout]]'>
          <img src='//[[server]]/img/blockstack.png'/>
          Sign Out
        </button>
      </template>
    `;
  }

  constructor(){
    super();
    this.server = Cfg.server;
    this.domain = document.location.host;
  }


  ready(){
    super.ready();

    if(window.Index && Index.stack){
      if(Index.stack.name)
        blockstack.lookupProfile(Index.stack.name).then(prof => {
          this.title = prof.name;
          this.updateStyles({'--logo': 'url('+prof.image[0].contentUrl+')'});
        });


      this.set('need_auth', true);
       Index.stack.getUser().then(user => {
        this.set('blockstack_user', user);
        this.authenticated = true;
        this.need_auth = false;
      }); 
    }
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
            'furniture'
          ];
        }
      },

      title: String,

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

      route: Object,
      subRoute: Object,
      sectionData: Object,
      idData: Object,
      onDetailPage: Boolean,
    }
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
};


window.customElements.define(element.is, element);
