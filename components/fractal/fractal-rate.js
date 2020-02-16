//import {styleSheets} from '../styling.js';
import account from '../../src/account.js';
import servers from '../../src/data/servers.js';

var myReviews = {};

document.body.addEventListener('authenticated', function(ev){
    servers.connect(Cfg.api).then(ws => {
      let q = {
        cmd: 'load',
        filter: {
          owner: account.user.email
        }
      };
      ws.send()
    });
});


class Component extends HTMLElement{
  static get is(){
    return 'fractal-rate';
  }

  static get template(){
    return`
      <style>
        :host{
          width: auto;
          height: auto;
          --icon-size: 18px;
          display: inline-block
        }

        main{
          display: flex;
          line-height: var(--icon-size);

	       font-weight: normal;
        }

        .star{
          color: #BBB;
          transition: color .3s, transform .3s;
          opacity: 1;
          font-size: var(--icon-size, 16px)
        }
        
        .star:before{
          content: '★';
        }


        span.star.on{
          color: var(--color, #EEE);
        }
        
        .star:hover{
          transform: rotate(12deg);
        }

        .star:hover ~ .star{
          opacity: 0.5;
        }
      </style>
            
      <main>
        <span class='star' id='star_1'></span>
        <span class='star' id='star_2'></span>
        <span class='star' id='star_3'></span>
        <span class='star' id='star_4'></span>
        <span class='star' id='star_5'></span>
      </main>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.collection = 'reviews';

    this.item = {};

    this.init();
  }


  init(){
    this.shadowRoot.innerHTML = Component.template;
    
    this.main = this.select('main');

    this.main.addEventListener('click', ev => {
      let star = ev.composedPath()[0];
      if(star.classList.contains('star')){
        var num = star.id.split('_')[1];
        this.rate(num);

        this.saveRate(num);

		this.dispatchEvent(new CustomEvent("rate", {
		  detail: {num}
		}));
      }
    }, false);
  }

  loadMyRate(){
    if(!this.link) return;

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
    if(!account.user || this.myReview) return;

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
            let review = r.item;
            this.link.load(item => {
               this.link.set('num_reviews', (item.num_reviews || 0) + 1);
            }); 
        }
      });
    });
  }

  rate(num){
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

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.loadMyRate();
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }
};


window.customElements.define(Component.is, Component);