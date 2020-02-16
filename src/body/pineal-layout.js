class layout extends PolymerElement{
  static get template(){
    return html`

        <slot></slot>
    `;
  }

  ready(){
    super.ready();

    /*
    this.$.toggle_nav.addEventListener('checked-changed', ev => {
      this.set('nav', ev.detail.value);
      console.log(this.nv);

      this.notifyPath('$.toggle_nav.checked');
      //this.$.drawer.classList[ev.detail.value?'add':'remove']('visible');
    });
    */
  }

  constructor() {
    super();
  }

  static get properties(){
    return{

      sections: {
        type: Array,
        value: function() {
          return [
            'feature',
            'latest'
          ];
        }
      },

      nav_on: {
        type: Boolean,
        observer: '_observe_nav'
      },

      nav: {
        type: Boolean,
        notify: true,
        value: false
      },

      items: {type: Array},

      featuredItems: {type: Array},

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


window.customElements.define('pineal-layout', layout);
