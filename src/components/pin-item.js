console.log('Elementttt');

class elem extends PolymerElement{
  static get template(){
    return html`
      <link rel="stylesheet" href="/design/components/pin-item.css">
      <style>

      </style>

      <template is="dom-if" if="{{link.http}}">
        <img src='{{link.http}}' alt='{{link.item.name}}'/>
      </template>

      <main>
        <h2>{{link.item.title}}</h2>
        <h4>{{link.url}}</h4>
        <slot></slot>
      </main>
    `;
  }

  static get is(){
    return 'pin-itm';
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

  constructor(){
    console.log('pin-item construct');
    
    super();
  }



  static get properties(){
    return{
      title: {
        type: String,
      },

      src: {
        type: String,
        observer: 'updateSrc'
      },

      items: {type: Array},

      featuredItems: {type: Array}
    }
  }


  updateSrc(){
    if(!this.src) return;
  
    this.link = Link(this.src);
    console.log(this.link);
    this.link.load(item => {
      console.log(item);
      this.set('item', item);
    });
  }
};


window.customElements.define(elem.is, elem);
