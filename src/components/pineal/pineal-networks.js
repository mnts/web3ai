import servers from '../../data/servers.js';
import Cfg from '../../Cfg.js';


const url = new URL(import.meta.url);

class element extends HTMLElement{
  static get is(){
    return 'pineal-networks';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          display: inline-block;
        }
      </style>

      <link rel="stylesheet" href="//${url.host}/design/interface.css">
      <link rel="stylesheet" href="//${url.host}/design/socAuth.css">
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <div id="head-socMedia">
          <button id="auth-twitter">
              <i class="fab fa-twitter"></i>
          </button>

          <button id="auth-facebook">
              <i class="fab fa-facebook"></i>
          </button>

          <!--
          <button id="auth-instagram">
              <i class="fab fa-instagram"></i>
          </button>
          -->
      </div>
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
    
    this.shadowRoot.innerHTML = this.constructor.template;
    
    this.init();
  }

  init(){
    this.select('#auth-twitter').addEventListener('click', ev => {
      const isPC = typeof window.orientation == 'undefined';
      const win = window.open(location.origin+'/auth/twitter', '_blank', {
          height: 200,
          width: 300,
          status: false
      });
    });

    const FB_btn = this.select('#auth-facebook');
    if(!Cfg.FB) FB_btn.hidden = true;

    FB_btn.addEventListener('click', ev => {
      window.FB.login((r) => {
        const res = r.authResponse;
        this.W({
          cmd: 'auth.facebook',
          token: res.accessToken,
          secret: res.signedRequest
        });
      }, {scope: 'email'});
    });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
