class element extends PolymerElement{
  static get template(){
    return html`
      <style>
        main{
          display: block;
        }
      </style>

      <main>
        <slot></slot>
      </main>
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

      featuredItems: {type: Array}
    }
  }

  toggleDrawer() {
    this.$.drawer.toggle();
  }


  static get observers(){
    return [];
  }
};


window.customElements.define('pin-catalog', element);
