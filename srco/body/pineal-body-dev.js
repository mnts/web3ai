class pineal_body extends PolymerElement{
  static get template(){
    return html`
    <link rel="stylesheet" type="text/css" href="//${Cfg.server}/src/body/pineal-body_dev.css">

    <main>
      <app-toolbar id='main_header'>
        <paper-icon-button icon="" id='toggle_nav'></paper-icon-button>

        <div condensed-title>{{title}}</div>
        <paper-icon-button id='edit' icon="create"></paper-icon-button>
        <paper-icon-button id='change_bg' icon="image:burst-mode"></paper-icon-button>
        <paper-toggle-button tittle='Toggle' checked$={{$.toggle_nav.checked}}></paper-toggle-button>
        <paper-icon-button icon="menu"></paper-icon-button>
      </app-toolbar>

      <slot></slot>
    </main>
    `;
  }

  ready(){
    super.ready();

    $(this.$.change_bg).click2ipfs(hash => {
      console.log(hash);
      var link = new Link('ipfs://'+hash);

      console.log(link);
    });

    this.$.edit.addEventListener('click', ev => {
      document.getElementById('nav').classList.toggle('closed');
    });

    this.$.toggle_nav.addEventListener('checked-changed', ev => {
      this.set('nav', ev.detail.value);

      this.notifyPath('$.toggle_nav.checked');
      //this.$.drawer.classList[ev.detail.value?'add':'remove']('visible');
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


window.customElements.define('pineal-body-dev', pineal_body);
