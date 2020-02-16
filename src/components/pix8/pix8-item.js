//import {styleSheets} from '../styling.js';
import account from '../../src/account.js';
import {fix4name} from '../../src/utilities/item.js';
import servers from '../../src/data/servers.js';
import {find2define} from '../../src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";

import fractal_item from '../fractal-item/component.js';

import '/node_modules/interactjs/dist/interact.min.js';


const url = new URL(import.meta.url);

export default class Component extends LitElement{
  static get properties(){return {
    src: {
      type: String,
      observe: true
    },

    name: {
      type: String,
      observe: true
    },

    item: {
      type: Object
    },

    own: {
      type: Boolean
    },

    datetime: {
      type: String
    },

    activated: {
      type: Boolean,
      reflect: true
    },

    been_activated: {
      type: Boolean
    }
  }}

  static get is(){
    return 'pix8-item';
  }

  static get styles(){
    return [css`
        :host{
          border: 0;
          box-shadow: none;
          flex: none;
        }

        #lst{
          opacity: 0;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background-color: #2228;
          backdrop-filter:  blur(5px);
          transition: opacity .4s;
          color: white;
          padding: 2px 4px;
        }

        main:hover #lst, main:focus-within #lst{
          opacity: 1;
        }

        #media{
          height: 100%;
          display: inline-block;
        }
    `];
  }

 render(){
    return html`
      <link rel="stylesheet" href="//${url.host}/components/fractal-item/style.css">

      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <main>
        <fractal-media id='media' @click='${this.activate}' src=${this.src} view='${this.activated?'carousel':'fill'}'></fractal-media>

        ${this.item.type == 'list'?html`
          <div id='lst' contentEditable></div>
        `:''}
        <slot></slot>
      </main>
    `;
  }


  constructor() {
    super(); // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    this.item = {};
    this.src = '';
    this.user_item = {};
    
    //setPassiveTouchGestures(true);
  }

  connectedCallback(){
    super.connectedCallback();
  }


	firstUpdated(){
      this.init();
    }

  init(){
    if(this.initiated) return;


    var that = this,
        target = this.select('main');

    var init_carousel;
    var init_order;

    var carousel_list;

    var state = 'none';

    var tx = 0,
        ty = 0;

    var name = this.getAttribute('name');
    if(name){
      this.gun = gun.get(name);
      this.gun.get('order').on(r => {
        console.log(r);
        this.style.order = r;
      });
    }

    interact.dynamicDrop(true);
    var inter = interact(target)
    .on('click', function (event) {
      if(this.item && this.item.segments) return;

      event.stopImmediatePropagation();
    }, true /* useCapture */)
    .draggable({
      autoScroll: false,
      inertia: false,
      onstart(event){
        var target = event.target;

        that.style.zIndex = '888';
        
        var dragElement = target.getRootNode().host;

        init_carousel = dragElement.parentElement;
        init_order = parseInt(dragElement.style.order);
        
        carousel_list = dragElement.parentElement.select('#list');
      },

      onmove(event){
        var target = event.target;

        //document.body.append(target);
        // keep the dragged position in the data-x/data-y attributes
        var x = target.dataset.x = (parseFloat(target.dataset.x) || 0) + event.dx;
        var y = target.dataset.y = (parseFloat(target.dataset.y) || 0) + event.dy;

        tx += event.dx;
        ty += event.dy;

        var ax = Math.abs(tx),
            ay = Math.abs(ty);

        var state = target.dataset.state || 'none';

        carousel_list.stop = true;


        if(ax <= 5 && ay <= 5 && state == 'none') return;

        if(((ay < 10) || state == 'scroll') && target.style.position != 'fixed'){
          carousel_list.scrollBy(-event.dx, 0);

          if(ax > 15) target.dataset.state = 'scroll';

          return;
        }

        if(target.style.position != 'fixed'){
          target.dataset.x = -carousel_list.scrollLeft;
  
          target.style.width = that.style.width = target.clientWidth;
          target.style.height = that.style.height = target.clientHeight;
          target.style.position = 'fixed';
        }

        //console.log(tx, ty, state);

        if((ax <= 15) && state != 'drag'){
          target.style.transform = `translate(${-carousel_list.scrollLeft}px, ${y}px)`;
          //if(ay > 15) state = 'slide';
          return;
        }

        target.style.transform = `translate(${x}px, ${y}px)`;

        if(state != 'drag'){
          target.classList.add('dragging');

          target.dataset.state = 'drag';
        }
        

        // translate the element
      },

      onend(event){
        var target = event.target


        var dragElement = target.getRootNode().host;

        var carousel = dragElement.parentElement;
        var order = parseInt(dragElement.style.order);

        target.dataset.x = 0;
        target.dataset.y = 0;

        let left = -carousel.select('#list').scrollLeft;

        target.classList.remove('dragging');
	    target.style.transition = 'transform .4s';

        let ended = ev => {
          target.style.transition = 'none'
          that.style.removeProperty('width');
          that.style.removeProperty('height');
          target.style.removeProperty('width');
          target.style.removeProperty('height');
          target.style.removeProperty('position');
          that.style.removeProperty('z-index');
          target.style.transform = 'translate(0px, 0px)';
        };
        
        if(target.style.position == 'fixed'){
          target.addEventListener('transitionend', ended, {once: true});
          target.style.transform = 'translate('+left+'px, 0px)';
        }
        else
          ended();
          
        if(carousel != init_carousel){
          console.log(carousel);
        }

        if(order != init_order){
          console.log(order);

          if(carousel == init_carousel){
            console.log(that.gun.get('order'));
            that.gun.get('order').put(order);
          }

        }

        if(target.dataset.state == 'scroll'){
          carousel.motion(-event.velocity.x/20);
        }

        tx = 0;
        ty = 0;

        target.dataset.state = 'none';
        //target.style.removeProperty('transform');

        //elem.shadowRoot.append(target);
      }
    }).dropzone({
      // only accept elements matching this CSS selector
      accept: 'main',
      // Require a 75% element overlap for a drop to be possible
     // overlap: 0.75,

      // listen for drop related events:
      overlap: 0.40,
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active')
      },
      ondragenter: (event) => {
        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target;


        if(draggableElement.dataset.state != 'drag') return;
        
        var dragElement = draggableElement.getRootNode().host;
        var dropElement = dropzoneElement.getRootNode().host;

        var dragCarousel = dragElement.parentElement,
            dropCarousel = dropElement.parentElement;

        if(dragCarousel.nodeName != 'PIX8-CAROUSEL') return;
        if(dropCarousel.nodeName != 'PIX8-CAROUSEL') return;

        if(dragCarousel != dropCarousel){
          dropCarousel.appendChild(dragElement);
        }

        if(dropElement == dragElement) return console.log('on sme');
        var dragOrder = parseInt(dragElement.style.order);
        var dropOrder = parseInt(dropElement.style.order);

        var bfr = dragOrder <= dropOrder;

        console.log(this, dragOrder +'<'+ dropOrder, event, inter);


        var sub = dropElement.parentElement.children;
        var orders = [];
        var newOrder;
        var i;
        for(i in sub){
          if(!sub[i].style) continue;
          let order = parseInt(sub[i].style.order);
          orders.push(order);
        }
        orders.sort((a, b) => a-b);

        var newOrd;
        orders.map((ord, i) => {
          if(ord == dropOrder){
              var prevOrd = orders[i-1];
              var nextOrd = orders[i+1];
              if(prevOrd == dragOrder) prevOrd = orders[i-2];

              if(bfr){
                 newOrd = nextOrd?
                  ((dropOrder + nextOrd) / 2):
                  dropOrder + 500;
              }
              else {
                 newOrd = prevOrd?
                    ((dropOrder + prevOrd) / 2):
                    dropOrder / 2;
              }
            /*
            console.log(`${i+1}, 
              ord${ord}, 
              dragOrder ${dragOrder}, 
              dropOrder ${dropOrder}, 
              prevOrd ${prevOrd},
              nextOrd ${nextOrd},
              ${(dropOrder + nextOrd) / 2};
              newOrd ${newOrd}, bfr ${bfr}
            `);
            */
            return;
          }
        });

        
        if(newOrd) dragElement.style.order = parseInt(newOrd);

        dropzoneElement.classList.add('drop-target')
        draggableElement.classList.add('can-drop')
        //draggableElement.textContent = 'Dragged in'
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target')
        event.relatedTarget.classList.remove('can-drop')
        //event.relatedTarget.textContent = 'Dragged out'
      },
      ondrop: function (event) {
        //event.relatedTarget.textContent = 'Dropped'
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active')
        event.target.classList.remove('drop-target')
      }
    });



    this.initiated = true;
  }

  attributeChangedCallback(name, oldVal, newVal){
    super.attributeChangedCallback(name, oldVal, newVal);


  console.log(name, oldVal, newVal);
    if(name == 'src'){
      this.load_src();
    }
    else
    if(name == 'name'){
      this.load_gun(newVal);
    }
  }

  activate(ev){
    console.log(ev);
  }

  load_gun(id){
    if(this.gun) return;

    this.gun = gun.get(id);
    var gun_item = this.gun.get('item');
    gun_item.on(item => {
      this.item = item;

      this.src = 'gun://'+id+'.item';
    });
  }

  load_src(){
    this.link = Link(this.src);

    this.link.load(item => {
      this.link.checkOwnership(own => {
        this.own = !!own;      
        this.item = item;
        var tit = this.select('#title');
        if(tit) tit.textContent = item.title;
        if(item.time) this.datetime = (new Date(item.time)).toISOString();
      });
    });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);