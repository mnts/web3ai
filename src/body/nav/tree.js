import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';

class nav extends PolymerElement{
  static get template(){
    return html`
      <style id='styleApps'></style>

      <link rel="stylesheet" href="//[[server]]/body/nav/tree.css" rel="preload" as="style">

      <style>
        #nav{
          padding: 170px 0 50px 1px;
          background-position: left;
          background-size: contain;
        }

        #nav > footer{
          width: 100%;
          padding: 2px 4px;
          position: fixed;
          bottom: 0;
          box-sizing: border-box;
          margin: 0;
          width: inherit;
          background: #17171799;
        }

        #nav > footer > button{
          background-image: var(--bg-grad);
          border: 0;
          margin-left: 5px;
        }

        #nav.light{
          background: #fbfbfb;
          box-shadow: 4px 2px 10px -5px #adadad;
        }

        #nav.light .tr>a{
          color: black;
        }

        #nav.light > footer{
          background-color: #90909082;
        }

        #nav {
            -ms-overflow-style: none;
            overflow: -moz-scrollbars-none;
        }

        #nav::-webkit-scrollbar {
            display: none;
        }

        #nav-resize{
          width: 3px;
          background: transparent;
          height: 100%;
          position: absolute;
          top: 0;
          right: -3px;
          cursor: w-resize;
        }
      </style>
      <app-drawer opened$={{opened}} id='nav'>
        <slot name='tree' id='tree'></slot>

        <footer>
          <button id='tree-add' class='a'>+</button>
          <button id='tree-bg' class='a'>
            <iron-icon style='color: white' icon='image:photo-album'></iron-icon>
          </button>
        </footer>
      </app-drawer>
    `;
  }

  static get properties() {
    return {
      opened: {
        type: Boolean,
        // Observer method identified by name
        observer: '_openedChanged'
      }
    }
  }

  // Observer method defined as a class method
  _openedChanged(nv, ov){
    console.log(this, nv);
    //this.$.nav.classList[nv?'add':'remove']('opened');
  }

  open(){
    this.$.nav.updateStyles({
      left: 0
    });
  }

  ready(){
    super.ready();

    this.server = Cfg.server;
    this.domain = document.location.host;
  }
}

window.customElements.define('pineal-nav', nav);
