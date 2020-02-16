import servers from '../data/servers.js';
//import {styleSheets} from '../styling.js';


class element extends HTMLElement{
  static get is(){
    return 'pineal-user';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          display: inline-block;
          height: 48px;
          margin: 1px;
        }

        #logo{
          margin-top: 2px;
          margin-right: 8px;
          font-size: calc(var(--header-height) - 22px);
          z-index: 201;
          text-align: center;
          color: white;
          cursor: pointer;
          padding-top: 6px;
          border-radius: 50%;
          box-sizing: border-box;
          display: inline-block;
          width: calc(var(--header-height) - 8px);
          height: calc(var(--header-height) - 8px);
          background-color: #dcdcdc4f;
        }
      </style>

      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

	   <span class='fas fa-user' id='logo'></span>
    `;
  }

  W(m){
    return new Promise((ok, no) => {
       servers.connect(Cfg.api).then(ws => {
            ws.send(m, r => {
              r?ok(r):no();
            });
       });
    });
  }


  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.init();
  }

  init(){
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = element.template;
    
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
