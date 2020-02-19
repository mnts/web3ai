import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';
//import { LitElement, html } from '@polymer/lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

//import './shrine-list.js';
//import './shrine-detail.js';

import {scroll} from '@polymer/app-layout/helpers/helpers.js';



class apps extends HTMLElement{
  static get template(){
    return html`
      <style>
        main{
          display: flex;
        }
      </style>


      <main id='list'>
        <slot></slot>
      </main>
    `;
  }

  open(app){
    if()
    this.$.list.appendChild(app);
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.createElement('slot')


  }

  static get properties(){
    return{

      sections: {
        type: Array,
        value: function() {
          return [
            'feature',
            'latest'
          ];
        }
      },

      nav_on: {
        type: Boolean,
        observer: '_observe_nav'
      },

      nav: {
        type: Boolean,
        notify: true,
        value: false
      },

      items: {type: Array},

      featuredItems: {type: Array},

      route: Object,
      subRoute: Object,
      sectionData: Object,
      idData: Object,
      onDetailPage: Boolean,
    }
  }

  toggleDrawer() {
    this.$.drawer.toggle();
  }


  static get observers(){
    return [];
  }
};


window.customElements.define('pineal-apps', apps);
