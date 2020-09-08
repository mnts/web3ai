//import {styleSheets} from '../styling.js';

var url = new URL(import.meta.url);

class Component extends HTMLElement{
  static get is(){
    return 'fractal-slide';
  }

  static get template(){
    return`
      <style>
        main{
            display: block;
            width: 100%;
        }

        :host, main{
            white-space: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            scroll-snap-type: x mandatory;
        }

        :host{
          position: relative;
          display: block;
        }

        ::slotted(*), main > *{
          scroll-snap-align: start;
        }


        main::-webkit-scrollbar {
            height: 8px;
            background-color: transparent;
        }

        main::-webkit-scrollbar-thumb {
          background-color: #f3f3f344;
          border-radius: 4px;
          transition: background-color .5s;
        }

        main::-webkit-scrollbar-thumb:hover {
          background-color: #eee3;
          border-radius: 4px;
        }

        main::-webkit-scrollbar-track {
            border-radius: 6px;
        }

        main::-webkit-scrollbar-thumb {
            border-radius: 6px;
        }

        #prev,#next{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          text-align: center;
          transition: opacity 0.4s, background-color 0.4s;
          font-size: 24px;
          background-color: #EEEE;
          color: #3339;
          border-radius: 50%;
          outline: none;
          border: 0;
          z-index: 10;
          opacity: 0.7;
          cursor: pointer;
        }
        
        #prev:hover, #next:hover{
          opacity: 1;  
          background-color: #CCC8;
        }

        #prev{
          left: 6px;
        }

        #next{
          right: 6px;
        }

        *[hidden]{
          display: none !important;
        }
      </style>
      
      
      <button id='prev'>&#x276E;</button>
      <main>
        <slot></slot>
      </main>
      <button id='next'>&#x276F;</button>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.shadowRoot.innerHTML = Component.template;

    this.list = this.select('main');
    this.prev = this.select('#prev');
    this.next = this.select('#next');

    this.prev.addEventListener('click', ev => {
      this.clicked = true;
      this.slideLeft();
    });

    this.next.addEventListener('click', ev => {
      this.clicked = true;
      this.slideRight();
    });

    this.list.addEventListener("scroll", ev => {
      this.check();
    });

    window.addEventListener("resize", ev => {
      this.check();
    });

    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList){
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
                this.check();
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(this.list, {childList: true});

    setTimeout(() => {
      this.check()
      new ResizeObserver(ev => {
        this.check()
      }).observe(this.select('main'));
    }, 300);

    this.interval = setInterval(ev => {
      if(this.clicked) return;

      if(this.backwards)
        this.slideLeft();
      else
        this.slideRight();
    }, 4000);
  }

  slideLeft(){
    this.list.scrollBy(-this.children[0].offsetWidth, 0);
  }

  slideRight(){
    this.list.scrollBy(this.children[0].offsetWidth, 0);
  }

  connectedCallback(){
    this.check();
  }

  check(){
    this.prev.hidden = (!this.list.scrollLeft) || 
      !this.list.children.length || 
      ("ontouchstart" in document.documentElement);

    const end = ((this.list.scrollLeft + this.list.clientWidth) == this.list.scrollWidth);
    this.next.hidden =  end || 
      !this.list.children.length || ("ontouchstart" in document.documentElement);

    
    if(!this.list.scrollLeft)
      this.backwards = false;

    if(end)
      this.backwards = true;
  }

  select(qs){
    return this.shadowRoot.querySelector(qs);
  }
};


window.customElements.define(Component.is, Component);