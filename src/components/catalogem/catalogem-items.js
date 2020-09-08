//import {styleSheets} from '../styling.js';
import account from '../../account.js';
import servers from '../../data/servers.js';
//import Filter from '../filter.js';
const select = q => document.querySelector(q);
import router, {initial} from '../../services/router.js';
import {find2define, define} from '../../services/components.js';
import Link from '../../data/Link.js';
var url = new URL(import.meta.url);


class element extends HTMLElement{
  static get is(){
    return 'catalogem-items';
  }

  static get template(){
    return`
      <style>
        :host{
          position: relative;
        }

        #list{
          display: grid;
          padding: 4px;
          grid-template-columns: repeat(auto-fill, minmax(var(--item-width, 260px), 1fr));
	       grid-gap: 1rem;
        }

        :host(.activated-within) #list{
          padding: 0;
        }

        #plus[hidden]{
          display: none;
        }
      </style>

      <link rel="stylesheet" href="//${url.host}/design/components/catalogem-items.css">

      <main>
        <div id='list'>
          <slot></slot>
        </div>

        <button id='plus' title='Create new item'>+</button>
        <div id='loading'></div>
      </main>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item_template = {};

    this.default = {
      dom: 'fractal-item'
    };

    if(Cfg.components){
      let comp = Cfg.components[this.constructor.is];
      if(comp){
        if(comp.default)
          Object.assign(this.default, comp.default);
      }
    }

    this.filter = {
      server: location.host,
      protocol: 'mongo',
      collection: 'stories',
      query: {}
    };

    this.limit = 12;
    
    this.init();
  }
  
  init(){
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = this.constructor.template;

    this.$('#plus').addEventListener('click', ev => {
      this.create();
    }, false);
    
    account.authenticated.then(() => {
      let user = account.user;

      $.extend(this.item_template, {owner: user.email});

      /*
      this.$('#plus').hidden = (Cfg.publisher_check)?
        (!(user.super || user.type == 'publisher')):
        false;
      */

      //this.load();
    });

    let cl_name = 'activated-within';
    this.addEventListener('activate', ev => {
      //this.classList.add(cl_name);
      //select('#body').scroll(0, 0);
    });

    this.addEventListener('deactivate', ev => {
      this.classList.remove(cl_name);
    });


    this.addEventListener('publish', ev => {
      var item = ev.detail.item,
          element = ev.composedPath()[0];
  

      this.publish(item).then(link => {
        element.classList.remove('toCreate');
        element.setAttribute('src', link.url);

        let user = account.user;
        if(Cfg.story.pub_tid){
            Ws.send({
                cmd: 'email',
                name: user.name || user.item.title,
                tid: Cfg.story.pub_tid,
                to: user.email || user.owner,
                subject: 'Your Story is Live - '+ link.item.title,
                text: 'Heyy, this stuff should work!!',
                context: {
                  item: link.item,
                  user: user.item
                }
            }, console.log)
        }
      });

    }, true);


    this.dispatchEvent(new CustomEvent("defined"));

  }


  connectedCallback(){
    //let src = this.getAttribute('src');
    //if(src) this.setSrc();
    //super.firstUpdated();
    customElements.whenDefined('fractal-body').then(ev => {
      this.listen_scroll();
    });
  }

  publish(item){    
    return new Promise((ok, no) => {
      servers.connect(Cfg.api).then(ws => {
        
        var q = this.filter.query;
        var keys = Object.keys(q);
        keys.forEach((a, b) => {
            let type = typeof q[a];
            if((type == 'string' || type == 'number') && !item[a])
                item[a] = q[a];
        });

        if(this.link){
          item.parent = this.link.url;
        }
          
        ws.send({
          collection: this.filter.collection,
          cmd: 'save',
          item
        }, r => {
          if(!r.item) return no();
           
          var url = 'mongo://'+this.filter.server+'/'+this.filter.collection+'#'+r.item.id,
              link = Link(url);
              link.item = r.item;

          ok(link);

          var event = new CustomEvent("published", {
            bubbles: true,
            detail: {
              item: r.item, url
            }
          });

          this.dispatchEvent(event);
        });
      });
    });

    return link;
  }

  static get observedAttributes(){
    return ['src', 'owner', 'collection'];
  }

  setSrc(url){
      this.link = Link(url);
      this.load();
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.setSrc(newValue);
        break;
        
      case 'collection':
        this.filter.collection = newValue;
        break;

      case 'owner':
        this.filter.query.owner = newValue;
        this.filtrate();
        break;

      case 'item_template_src':
        this.link = Link(newValue);
        this.link.load(item => {
          $.extend(this.item_template, item);
        });
        
        break;
    }
  }

  load(){
    account.ready.then(() => {
      this.link.load(item => {
        console.log('catalogem-items.load', item);

        /*
        if(this.link.checkOwnership)
          this.link.checkOwnership(own => {
            this.select('#plus').hidden = !own;
          });
          */

        var src = this.getAttribute('src');

        if(typeof item.filter == 'object' && !item.filter.length){
          this.filtrate(item.filter);
        }
        else
        if(src){
          var fltr = {
            query: {
              parent: src
            }
          }
          this.filtrate(fltr);
        }
        else
          this.link.children(links => {
            var list = this.$('#list');

            while(this.firstChild){
              this.removeChild(this.firstChild);
            };

            links.forEach(link => this.append(link));
          });
      });
    });
  }

  filtrate(filter, cf = {}){
    this.filter = _.extend({}, this.filter, filter);
    var sort = this.filter.sort || {time: -1};

    var query = Object.assign({}, this.filter.query);

    var q = {
      collection: this.filter.collection,
      cmd: 'load',
      sort,
      filter: query,
      limit: 48
    };

    if(cf.skip) q.skip = cf.skip;

    return new Promise((ok, no) => {
      servers.connect(Cfg.api).then(ws => {
        ws.send(q, r => {
          if(!r.items) return no();
          
          let links = [];
          r.items.map(item => {
            let domain = query.domain || this.filter.server;
            var url = 'mongo://'+domain+'/'+this.filter.collection+'#'+item.id,
                link = Link(url);

            link.item = item;

            links.push(link);
          });
          
          var list = this.$('#list');

          if(!cf.skip) while(this.firstChild){
            this.removeChild(this.firstChild);
          };

          links.forEach(link => this.append(link));

          ok(links);
        });
      });
    });
  }

  load_more(){
    if(this.classList.contains('loading_more')) return;
    this.classList.add('loading_more');

    const count = this.selectAll('.item').length

    this.filtrate({}, {skip: count}).then(links => {
      this.classList.remove('loading_more');
      if(!links.length) this.classList.add('loaded_all');
    });
  }

  listen_scroll(){
    /*
    var parents = Array.prototype.slice.call($(this).parents());

    parents.unshift(this);

    var scrollable;
    for (let i = 0; i < parents.length; i++){
      let parent = parents[i];

      let style = getComputedStyle(parent);

      console.dir(style, style.overflowY);
    }*/
    
    var container;
    if(this.classList.contains('app'))
      container = this;
    else
    if(this.parentElement.select)
      container = this.parentElement.select('#list');


    
    if(!container) container = document.querySelector('#body').select('main');

    if(container) container.addEventListener('scroll', ev => {
      var cont = ev.path[0];

      if(cont.scrollHeight - cont.scrollTop - cont.clientHeight < 1)
        this.load_more();
    });
  }

  append(link){
    let div = document.createElement('div');

    var list = this.$('#list');
    this.appendChild(div);
    
    var dom_tag = this.getAttribute('dom') || this.default.dom || 'fractal-item';
    define(dom_tag);
    
    link.load(item => {
      if(!item) return div.remove();
      let $item = $('<'+dom_tag+'>', {
        src: link.url
      });

      $item[0].addEventListener('ready', ev => {
        if(
          this.filter && router.p[0] == this.filter.collection &&
          router.p[1] == item.name
        ) $item[0].activate();
      });
      
      $item[0].classList.add('item');

      $(div).replaceWith($item);
    });
  }


  create(){
    if(account.gate()) return;
    
    if(
      Cfg.acc.publisher_check && account.user && 
      !(account.user.super || account.user.type == 'publisher')
    )
      return alert('Only for publishers');
    
    var dom_tag = this.getAttribute('dom') || 'fractal-item';
    define(dom_tag);
    
    let element = document.createElement(dom_tag);
    element.classList.add('toCreate');
    element.classList.add('item');
    //element.fill(this.item_template);
    this.prepend(element);
    select('#body').scroll(0, 0);
  }

  selectAll(selector){
   return Array.prototype.slice.call(
        document.querySelectorAll(selector)
    );
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(element.is, element);
