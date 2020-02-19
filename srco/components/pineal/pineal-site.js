import servers from '../data/servers.js';
//import {styleSheets} from '../styling.js';


class element extends HTMLElement{
  static get is(){
    return 'pineal-site';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
        }

        #main{
          display: none;
        }

        input{
          width: 128px;
        }

        form{
          color: white;
          text-align: center;
          display: flex;
        }
      </style>

      <style>
        @import "//${Cfg.server}/design/interface.css";
        @import "//${Cfg.server}/design/components/pineal-site.css";
      </style>
      
      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      
      <form id='main'>
        <i class='fas fa-globe'></i>
        <input placeholder='user name' name='name' style='text-align: right'/>
        <input placeholder='domain name' name='domain'/>
        
        <button name='create' type='submit'>Create</button>
      </form>
    `;
  }

  constructor(){
    super();

    this.attachShadow({ mode: 'open' });
    this.init();
  }
  
  init(){
    this.shadowRoot.innerHTML = this.constructor.template;
//    this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome,];

    this.form = this.$('#main').elements;
  
    
     var that = this;
     var main = this.$('#main');
     main.addEventListener('submit', ev => {
        this.W({
          cmd: ''
        }).then(r => {

        });
        ev.preventDefault();
        return false;
     });

     this.form.name.addEventListener('change', ev => {
        let input = ev.path[0];
        input.classList.remove('err');
     });

     this.form.domain.addEventListener('change', ev => {
        let input = ev.path[0];
        input.classList.remove('err');
     });
  }
  
  connectedCallback(){
  }

  static get observedAttributes(){
    return ['name', 'domain'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log(name, oldValue, newValue);
    switch(name){
      case 'name':
        this.form.name.value = newValue;
        break;
      case 'domain':
        this.form.domain.value = newValue;
        this.form.domain.disabled = 'disabled';
        break;
    }
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

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

};


window.customElements.define(element.is, element);
