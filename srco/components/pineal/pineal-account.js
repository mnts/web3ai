import servers from '../../data/servers.js';
//import {styleSheets} from '../styling.js';
const url = new URL(import.meta.url);

class element extends HTMLElement{
  static get is(){
    return 'pineal-account';
  }

  static get template(){
    return`
      <style>
        main{display: none;}
        
        :host{
          display: inline-block;
          width: 190px;
        }
      </style>
      
      <style>
        @import "//${url.host}/design/interface.css";
        @import "//${url.host}/design/components/pineal-account.css";
      </style>
      
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main>
        <div class='option' id='uploadPhoto'>
          <i class='fas fa-camera'></i>
          Change photo
        </div>

        <div class='option' id='setup'>
          <i class='fas fa-wrench'></i>
          Setup profile
        </div>

        <div class='option' id='updateInfo'>
          <i class='fas fa-info'></i>
          Update your info
        </div>

        <div class='option' id='changePsw'>
          <i class='fas fa-lock'></i>
          Change password
        </div>

        <div class='option' id='logout'>
          <i class='fas fa-door-open'></i>
          Log out
        </div>
      </main>
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
  
  auth(user){
    var ev = new CustomEvent('authenticated', {
      detail: { user }
    });
    
    document.body.dispatchEvent(ev);
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.init();
  }

  init(){
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];

    this.shadowRoot.innerHTML = element.template;

    var setup_modal;
    this.$('#setup').addEventListener('click', ev => {
      if(setup_modal == null){
        let tpl = document.getElementById('account-setup-template').content;
        setup_modal = tpl.firstElementChild;
      }

      UI.modal(setup_modal);
    });

    this.$('#logout').addEventListener('click', ev => {
      this.W({
        cmd: 'logout'
      });

      document.body.dispatchEvent(new CustomEvent('logout'));	
    });

    this.$('#uploadPhoto').addEventListener('click', ev => {
      fileDialog().then(file => {
        var path = this.getAttribute('src').replace(/\/$/, "");
        var img_url = path + '/img.jpg';
        Link(img_url).upload(file[0]).then(r => {
          var image = new Image;
          image.src = 'http'+img_url.replace(/^fs/, '');
          this.$('#img').innerHTML = '';
          this.$('#img').append(image);
          this.link.set('img', image.src);
        });
      });
    });
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
