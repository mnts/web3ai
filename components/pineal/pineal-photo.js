
/*
console.log('Elementttt');

class elem extends PolymerElement{
  static get template(){
    return html`
      <link rel="stylesheet" href="/design/components/pineal-photo.css" rel="preload" as="style">
      <style></style>

      <main>
        <header>
          <h2>[[link.item.name]]</h2>
          <time-ago datetime$="[[datetime]]"></time-ago>
        </header>
        <img id='photo' src='{{link.http}}' alt='{{link.item.name}}'/>
      </main>
    `;
  }

  static get is(){
    return 'pineal-photo';
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

    /*

    var element = this;
    this.$.photo.addEventListener('load', ev => {
      element.width = this.width;
      element.height = this.height;
    });


    this.$.photo.addEventListener('click', ev => {
      var className = 'selected';
      $(this).toggleClass(className).siblings('.'+className).removeClass(className);
    });


    //this.set('datetime', (new Date(this.link.item.time)).format());
  }

  constructor(){    
    super();
  }

  static get properties(){
    return{
      title: {
        type: String,
      },

      create: Boolean,

      src: {
        type: String,
        observer: 'updateSrc'
      }
    }
  }


  updateSrc(){
    if(!this.src) return;
  
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }
};


window.customElements.define(elem.is, elem);
*/