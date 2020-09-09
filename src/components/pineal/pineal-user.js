import servers from '../../data/servers.js';
import User from '../../acc/User.js';
import account from '/src/account.js';

//import {styleSheets} from '../styling.js';

var components = [];
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
          margin: 1px;
          width: var(--icon-size, 48px);
          height: var(--icon-size, 48px);
	      vertical-align: middle;
	      position: relative;
        }

        main{
          margin-right: 8px;
          font-size: calc(var(--header-height) - 22px);
          z-index: 201;
          text-align: center;
          color: white;
          cursor: pointer;
          border-radius: 50%;
          box-sizing: border-box;
          display: inline-block;
          width: inherit;
	      height: inherit;
	      margin: 0;
	      padding: 0;
	      overflow: hidden;
          background-color: #dcdcdc4f;
          background-image: url('/design/user.png');
          background-size: 32px 32px;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        main > img, main > video, main > pineal-media{
	      margin: 0;
	      padding: 0;
	      	width: inherit;
			height: inherit;
        }

        :host(.online) main{
        	box-shadow: 0 0 4px 2px green;
        }

        :host(.blocked)::before{
			display: block;
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-image: url(/img/block.png);
			z-index: 33;
			background-size: contain;
		    background-repeat: no-repeat;
			background-position: center;
			opacity: 0.8;
		}

        :host(.blocked) > main{
		    box-shadow: 0 0 4px 3px #cc31cc;
        }
      </style>

	  <main></main>
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
    this.main = this.select('main');

    const checkOnline = (id, on) => {
        if(this.user && id == this.user.id)
			this.online(on);
    };
    
	document.addEventListener('ws.cmd.connected', ev => checkOnline(ev.detail.m.id, true));
	document.addEventListener('ws.cmd.disconnected', ev => checkOnline(ev.detail.m.id, false));

	this.addEventListener('click', ev => {
		if($(this).parents('.dragging').length) return;
		if(account.user && this.user && this.user.id != account.user.id)
    		document.querySelector('#chats').selectChat(this.user.item);
    	else
    	    $('#account-icon').click();
	});

	components.push(this);
  }

  load(path){
     this.user = User(path);

     this.user.load(item => {
     	if(!item) return;
       this.setAttribute('title', item.title || item.name);

       this.link = this.user.axon.link;

		this.dispatchEvent(new CustomEvent("loaded", {
		  detail: {item, user: this.user}
		}));
        
		if(item.image){
		   var media = document.createElement('fractal-media');
		   media.classList.add('fill');
		   media.setAttribute('src', item.image);

		   this.main.innerHTML = '';
		   this.main.append(media);
		}
        
        this.online(this.user.connected);
        this.checkBlocked();
     });
  }

  checkBlocked(){
  	  if(!account.user) return this.classList.remove('blocked');;
      var blocked = account.user.axon.link.item.blocked || [];
      this.classList[
          (blocked.indexOf(this.user.email)+1)?'add':'remove'
      ]('blocked');
  }

  online(on){
      this.classList[on?'add':'remove']('online');
  }

  static get observedAttributes(){
    return ['src', 'path', 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.load(newValue);
        break;
      case 'path':
        this.load(newValue);
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};

function checkBlocked(){
    components.forEach(comp => comp.checkBlocked());
}

document.body.addEventListener('authenticated', function(ev){
    checkBlocked();
    
    var user = ev.detail.user;
    user.axon.link.monitor(c => {
    	if(c.blocked && account.user == user)
    	    checkBlocked();
    });
});

window.customElements.define(element.is, element);