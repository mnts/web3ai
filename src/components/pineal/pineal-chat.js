import servers from '../../data/servers.js';
const url = new URL(import.meta.url);
import account from '../../account.js';
import Link from '../../data/Link.js';

import '../fractal/fractal-comments.js';

class element extends HTMLElement{
  static get is(){
    return 'pineal-chat';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          position: relative;
          display: inline-block;
          width: 400px;
        }

        :host
          height: 100%;
        }

        fractal-comments{
          height: calc(100% - 7px);
        }
        
        header{
          background: #464646a8;
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          position: absolute;
          z-index: 6;
          top: 0;
          left: 0;
          right: 0;
        }

        header > pineal-user{
          margin: 6px 12px;
        }

        header > h2{
          flex-grow: 1;
          color: white;
        }
        
        #close, #block, #unblock{
          height: 28px;
          width: 28px;
          border: 0;
          background: white;
          color: var(--color, black);
          box-shadow: 0 0 6px #353535;
          cursor: pointer;
          padding-top: 2px;
          font-weight: bold;
          margin: 0 8px;
          outline: none;
          border-radius: 50%;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        }

        #block, #unblock{
          color: white;
        }

        [hidden]{
          display: none !important;
        }

        .pulse-button {
          animation: pulse 1.5s infinite;
        }
        .pulse-button:hover {
          animation: none;
        }

        @-webkit-keyframes pulse {
          0% {
            transform: scale(.9);
          }

          70% {
            transform: scale(1);
            box-shadow: 0 0 20px #cc31cc;
          }

          100% {
            transform: scale(.9);
            box-shadow: 0 0 0 #cc31cc;
          }
        }

      </style>

      <style>
          .tree menu{
              display: none;
          }
      </style>

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <header>
        <pineal-user></pineal-user>
        <h2></h2>
        <button id='block' style='background-image: url(/img/block.png)' class='pulse-button' title='Swerve'></button>
        <button id='unblock' style='background: #23ab35' class='fa fa-check' title='Unblock'></button>
        <button id='close' class='fa fa-times'></button>
      </header>

      <fractal-comments collection='messages' style='--comments-list-padding-top: 60px'></fractal-comments>
    `;
  }
  
  constructor(){
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = this.constructor.template;
    this.item = {};
    
    this.select('#close').addEventListener('click', ev => {
      this.setAttribute('hidden', true);

      var event = new CustomEvent("close");
      this.dispatchEvent(event);
    });

    this.select('#block').addEventListener('click', ev => {
        this.block();
    });
    
    this.select('#unblock').addEventListener('click', ev => {
        this.unblock();
    });
  }

  block(){
    //var y = confirm('Would you like to Swerve?');
    //if(!y) return;
    var blocked = account.user.axon.link.item.blocked || [];
    if(blocked.indexOf(this.user.email)+1) return;
    blocked.push(this.user.email);
    account.user.axon.link.set('blocked', blocked);
    this.select('fractal-comments').select('footer').hidden = true;
    this.checkBlock();

    var audio = new Audio('/sounds/swerve.mp3');
    audio.play();
  }

  unblock(){
    var y = confirm('Unswerve user?');
    if(!y) return;
    var blocked = account.user.axon.link.item.blocked || [];
    var ind = blocked.indexOf(this.user.email);
    if(ind<0) return;
    blocked.splice(ind, 1);
    account.user.axon.link.set('blocked', blocked);
    this.checkBlock();
  }

  init(){
    this.collection_name = 'chats';
    
    this.url = this.cid? 
      `mongo://${Cfg.server}/${this.collection_name}#${this.cid}`:
      this.src;


    let owner = account.user?
      account.user.item.owner:
      false;
    
    if(!owner) return false;

    const userEl = this.select('header  > pineal-user');

    userEl.addEventListener('loaded', ev => {
      this.user = ev.detail.user;
      this.user_item = ev.detail.item;

      this.user.axon.link.monitor(c => {
          if(!c.blocked) return;
          this.checkBlock();
       });

      this.checkBlock();

      this.select('header > h2').innerText = this.user.title;
    });

    this.link = new Link(this.url);
    this.link.load(item => {
      let users = (item.users || []).filter(v => {
        return v != owner;
      });

      var user_path = users[0];

      this.select('header  > pineal-user').setAttribute('path', user_path);
    });
    
    if(this.url)
      this.select('fractal-comments').setAttribute('src', this.url);
  }

  checkBlock(){
      var doI = ((account.user.axon.link.item.blocked || []).indexOf(this.user_item.owner) + 1);
      this.select('fractal-comments').select('footer').hidden = (
        ((this.user_item.blocked || []).indexOf(account.user.email) + 1) || doI
      )

      this.select('#block').hidden = doI;
      this.select('#unblock').hidden = !doI;
  }

  static get observedAttributes(){
    return ['src', 'cid'];
  }

  see(){
    this.select('fractal-comments').see();
  }

  attributeChangedCallback(name, oldValue, newValue){
    this[name] = newValue;
    
    switch(name){
      case 'src':
        this.init();
        break;
      case 'cid':
        this.init();
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

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
