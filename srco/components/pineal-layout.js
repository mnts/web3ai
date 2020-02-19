class Component extends HTMLElement{
  static get template(){
    return`
        <slot></slot>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = Component.template;
  }

  toggleDrawer() {
    this.$.drawer.toggle();
  }


  static get observers(){
    return [];
  }
};


window.customElements.define('pineal-layout', Component);
