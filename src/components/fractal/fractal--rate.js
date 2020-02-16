//import {styleSheets} from '../styling.js';


class Component extends HTMLElement{
  static get is(){
    return 'fractal-rate';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
          vertical-align: top;
        }

        .star:before{
          content: '\02605';
        }
      </style>
      
      <link rel="stylesheet" href="//${url.host}/design/components/fractal-photo.css">
      
      <main>
        <span class='star' id='star_1'></div>
        <span class='star' id='star_2'></div>
        <span class='star' id='star_3'></div>
        <span class='star' id='star_4'></div>
        <span class='star' id='star_5'></div>
      </main>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
  }

  init(){
    this.shadowRoot.innerHTML = Component.template;
    
    this.main = this.select('main');

    this.main.addEventListener('click', ev => {
      if(ev.target.classList.contains('star'));
        this.rate(ev.target.index + 1);
    }, false);
  }

  rate(num){
      var star = ev.target;

      for(let i=0; i < 5; ++i){
        let star = this.shadowRoot.querySelector(`#star_${i}`);
        star.classList[i<num?'add':'remove']('on');
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
  


  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.loadImg(newValue);
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }
};


window.customElements.define(Component.is, Component);