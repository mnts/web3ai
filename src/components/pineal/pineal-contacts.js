import servers from '../../data/servers.js';
const url = new URL(import.meta.url);
import account from '../../account.js';

import {define} from '/src/services/components.js';

import Link from '/src/data/Link.js';

import User from '../../acc/User.js';

class element extends HTMLElement{
  static get is(){
    return 'pineal-contacts';
  }


  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          --icon-size: calc(var(--header-height) - 16px);
          display: inline-block;
          height: 100%;
          width: 240px;
        }


        :host(:not([state=expanded])){
          width: calc(var(--icon-size) + 12px);
        }

        *{
          box-sizing: border-box;
        }

        #search{
          position: absolute;
          bottom: 0;
          width: 100%;
          background-color: #22222233;
          background-image: url(/design/search.png);
          background-repeat: no-repeat;
          background-position: 4px center;
          transition: background-color .6s;
          background-size: 22px;
          padding-left: 32px;
          border: 0;
          width: 100%;
          height: var(--footer-height, 28px);
          margin: 0;
          outline: none;
        }

        :host(:not([state=expanded])) #search{
          background-position: center;
          padding-left: 100%;
        }

        #search:hover{
          background-color: #EEEA;
        }

        #search:focus{
          background-color: #CCC9;
        }

        :host([state=expanded]) main{
        }

        main{
          height: 100%;
          overflow: auto;
        }
      </style>

      <main>
        
      </main>

      <input id='search' autocomplete="off"/>
    `;
  }

  build(item){
    var el = document.createElement('section');

    var users = [...item.users];
    if(account.user){
      var i = users.indexOf(account.user.item.owner);
      if(i !== -1) users.splice(i, 1);
    }

    var path = users[0];

    var user = new User(path);

    el.innerHTML = `
      <pineal-user path='${path}'></pineal-user>
      <aside>
        <h2></h2>
        <h3></h3>
      </aside>
    `;

    /*
    el.addEventListener('click', ev => {
      var event = new CustomEvent("selected", {
        detail: {item}
      });
      
      this.dispatchEvent(event);
    });
    */

    (new MutationObserver(m => m.forEach(mut => {
      if(mut.attributeName == 'title'){
        let title = mut.target.attributes.title.value;
        el.querySelector('h2').innerText = title || user.email || path;
      }
      else
      if(mut.attributeName == 'status'){
        
      }
    }))).observe(el.querySelector('pineal-user'), {
		attributes: true
	});

    return el;
  }
  
  prepend_item(item){
    const contact = this.select('#contact_'+item.id);
    if(contact){
      contact.parentNode.prepend(contact);
      return contact;
    }

   // if(!item.last) return;

    const domain = location.host;
    var url = 'mongo://'+domain+'/'+this.collection_name+'#'+item.id,
        link = Link(url);
    
    link.item = item;
    
    var el = document.createElement('pineal-contact');
    el.setAttribute('src', url);
    el.setAttribute('id', 'contact_'+item.id);
    
    el.addEventListener('click', ev => {
      /*
      var event = new CustomEvent("selected", {
        detail: {item}
      });
      this.dispatchEvent(event);
      $(el).addClass('selected').siblings().removeClass('selected');
      */
    });
   
    this.select('main').prepend(el);

    return el;
  }
  
  constructor(){
    super();
    this.attachShadow({ mode: 'open' });
    this.collection_name = 'chats';

    this.init();
  }

  init(){
    this.shadowRoot.innerHTML = this.constructor.template;

    this.select('#search').addEventListener('focus', ev => {
      this.setAttribute('state', 'expanded');
    });

    this.select('#search').addEventListener('blur', ev => {
      
    });
  
    account.authenticated.then(r => {
        define('pineal-contact');
        this.list();
    });

    document.addEventListener('ws.cmd.change', ev => {
        const d = ev.detail.m;
        
        if(!d.fields.time) return;
        this.prepend_item({id: d.id});
    });
  }

  list(){
      if(!account.user || !account.user.item || !account.user.item.owner) return;
      
      this.W({
        cmd: 'load',
        filter: {
          users: account.user.item.owner
        },
        sort: {time: -1},
        collection: this.collection_name
      }).then(r => {
        this.select('main').innerHTML = '';
        
        (r.items || []).reverse().map(item => {
          this.prepend_item(item);
        });
      });
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
