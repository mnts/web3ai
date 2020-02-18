//import {styleSheets} from '../styling.js';
import account from '../../account.js';
import servers from '../../data/servers.js';
var url = new URL(import.meta.url);


class Component extends HTMLElement{
  static get is(){
    return 'fractal-select';
  }

  static get template(){
    return`
      <style>
        :host{
          max-width: var(--nav-width, 200px);
          height: auto;
          display: inline-block
        }
      </style>
            
      <main>
        <slot></slot>
      </main>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  
    this.init();
  }


  init(){
    this.shadowRoot.innerHTML = Component.template;
    
    this.main = this.select('main');

    this.assign(this.getAttribute('selected_src'));

    tippy(this.main, {
      content: '..',
      arrow: true,
      interactive: true,
      placement: 'top',
      trigger: 'click',
      onShow: instance => {
        instance.that = this;
        let link = Link(this.getAttribute('list_src'));
        this.constructor.init_options(instance, link);
      },
      onHide(){
        console.log("about to close");
      }
    });
  }

  assign(src){
    var link = Link(src);
    if(link) link.load(item => {
      let ttl = item.title || item.name;
      if(ttl) this.main.innerText = ttl;
    });
  }

  static init_options(instance, link){
    if(link.addMenu){
      instance.setContent(link.addMenu)
    }
    else{
      let addMenu = link.addMenu = document.createElement('div');
      addMenu.style.width = '180px';
      let onceLoaded = ev => {
        addMenu.removeEventListener('children_loaded', onceLoaded, false);

        if(ev.detail.node.link.url == link.url)
          instance.setContent(addMenu);

        addMenu.addEventListener('click_node', ev => {
          let node = ev.detail.node;

          instance.that.assign(node.link.url);
          
          instance.that.dispatchEvent(new CustomEvent('selected', {
            detail: {
              node: this,
              link: node.link
            },
            bubbles: false
          }));

          tippy.hideAll();
        }, false);
      };

      addMenu.addEventListener('children_loaded', onceLoaded);
      addMenu.innerHTML = "<pineal-tree nomenu src='"+link.url+"'></pineal-tree>";
    }
  }

  loadMyRate(){
    if(!this.link) return;
    if(!account.user) return;

     servers.connect(Cfg.api).then(ws => {
      var q = {
        cmd: 'get',
        collection: this.collection,
        filter: {
          owner: account.user.email,
          src: this.link.url
        }
      };
      ws.send(q, r => {
        let item = r.item;

        if(item){
          this.myReview = item;
          this.rate(item.num); 
        }
      });
    });

    var link = Link('mongo://'+this.link.domain+'/reviews');
  }

  saveRate(num){
    if(!account.user) return;

    servers.connect(Cfg.api).then(ws => {
        var item = {
          num,
          owner: account.user.email,
          src: this.getAttribute('src')
        };

        var q = {
          cmd: 'save',
          collection: this.collection,
          item
        };

        ws.send(q, r => {
          if(r.item){
              this.myReview = r.item;
              this.num = num;
              let review = r.item;
              this.link.load(item => {
                 this.link.set('num_reviews', (item.num_reviews || 0) + 1);
              }); 
          }
        });
    });
  }

  unrate(){
    return new Promise( (ok, no) => {
      if(!account.user || !this.myReview) return ok();

      this.selectAll('.star').forEach(element => {
        element.classList.remove('on');
      });

      servers.connect(Cfg.api).then(ws => {
        var q = {
          cmd: 'remove',
          id: this.myReview.id,
          collection: this.collection
        };

        delete this.myReview;
        delete this.num;
        ws.send(q);

        ok();
      });
    });
  }

  rate(num){
    this.num = num;
      for(let i=1; i < 6; i++){
        let star = this.shadowRoot.querySelector(`#star_${i}`);
        star.classList[i<=num?'add':'remove']('on');
      }
  }

  static get observedAttributes(){
    return ['src'];
  }

  get ext(){
    return {
      video: ['mp4', 'avi', 'mpeg', 'webm']
    };
  }
  
  
  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  selectAll(qs){
      return Array.prototype.slice.call(
          this.shadowRoot.querySelectorAll(qs)
      );
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'list_src':
        this.list_link = Link(newValue);

        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }
};


window.customElements.define(Component.is, Component);