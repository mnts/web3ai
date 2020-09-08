import servers from '../../data/servers.js';

const url = new URL(import.meta.url);
import account from '../../account.js';

import './pineal-contacts.js';
import './pineal-chat.js';

class element extends HTMLElement{
  static get is(){
    return 'pineal-chats';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          height: 100%;
          display: flex;
        }

        main{
          display: inline-block;
          vertical-align: top;
          box-shadow: 0 0 6px #737373 inset;
        }

        [hidden]{
           display: none !important;
        }

        pineal-contacts{
          background: #a7a7a766;
          backdrop-filter: blur(3px);
          float: right;
          /*box-shadow: 0 0 6px #737373 inset;*/
        }
        
        pineal-chat{
          background: #dadada7a;
          backdrop-filter: blur(5px);
        }

        :host(.mobile) pineal-contacts{
          width: 100vw;
        }

        :host(.mobile.selected_contact) pineal-contacts{
          display: none;
        }

        :host(.mobile) main{
          width: 100vw;
        }

        :host(.mobile) pineal-chat{
          width: 100%;
        }
      </style>

      <style>
          .tree menu{
              display: none;
          }
      </style>

      <main>
        
      </main>
      <pineal-contacts>
      </pineal-contacts>
    `;
  }

  constructor(){
    super();
    this.attachShadow({ mode: 'open' });
    this.collection_name = 'chats';
    this.init();
  }

  init(){
    this.shadowRoot.innerHTML = this.constructor.template;
  	
    this.contacts = this.select('pineal-contacts');

    /*
    contacts.addEventListener('selected', ev => {
        var item = ev.detail.item;
        console.log(item);
        this.openChat(item);
    });
    */

    const checkMob = () => {
      let isMob = this.classList.contains('mobile');
      if(!isMob || this.contacts.getAttribute('state') == 'expanded') return;

      this.contacts.setAttribute('state', 'expanded')
    }

    checkMob();

        // create an observer instance
    var observer = new MutationObserver(muts => {
        muts.forEach(mut => {
            if(mut.attributeName == 'class')
                checkMob();
        });
    });

    observer.observe(this, {
        attributes: true
    });

    
    const body = document.querySelector('#body');
    if(body) body.addEventListener("click", (evt) => {
      let target = evt.target;

      do {
          if(target == this) return;
          target = target.parentNode;
      } while(target);
      
      this.contacts.setAttribute('state', 'shrinked');
    });
  }
  
  selectChat(user){
    this.findChat(user).then(item => {
      this.openChat(item);
    }, () => {
      this.createChat(user).then(item => {
        this.contacts.prepend_item(item);
        
        this.openChat(item);
      });
    });
    
    if(this.classList.contains('mobile'))
      document.querySelector('#body').open('#chats');
  }

  openChat(item){
    var chats = Array.from(this.select('main').children);
    chats.map(chat => {
      chat.hidden = true;
    });

    this.unselect();

    var chat = this.select('#chat_'+item.id);
    if(!chat){
      var chat = document.createElement('pineal-chat');
      chat.id = 'chat_'+item.id;
      chat.setAttribute('cid', item.id);
      this.select('main').append(chat);
      
      chat.addEventListener('close', ev => {
        this.classList.remove('selected_contact');
        this.unselect();
      })
    }
    else
      chat.hidden = false;

    setTimeout(() => chat.see(), 300);

    const contact = this.contacts.select('#contact_'+item.id);
    if(contact) contact.classList.add('selected');

    this.classList.add('selected_contact');
  }

  unselect(){
      const selected = this.contacts.select('.selected');
      if(selected) selected.classList.remove('selected');
  }

  createChat(user){
    return new Promise((ok, no) => {
      var item = {
        users: [
          account.user.item.owner,
          user.owner
        ]
      };

      this.W({
        cmd: 'save',
        item,
        collection: this.collection_name
      }).then(r => {
        (r.item)?
          ok(r.item):
          no();
      });
    });
  }

  findChat(user){
    return new Promise((ok, no) => {
      this.W({
        cmd: 'get',
        filter: {
          users: {
            $all: [
              account.user.item.owner,
              user.owner
            ],
            $size: 2
          }
        },

        collection: this.collection_name
      }).then(r => {
        (r.item)?
          ok(r.item):
          no();
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