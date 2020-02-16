class element extends HTMLElement{
  static get is(){
    return 'pineal-gallery';
  }

  static get template(){
    return`
      <style>
        main{
          display: block;
        }

        :host{
          display: block;
        }


        @media screen and (max-width: 1400px) {
          pineal-item {
            awidth: calc(50% - 20px);
          }
        }
      </style>

      <div id='list'>
        <slot></slot>
      </div>
    `;
  }

  constructor() {
    super();

    console.log('constr', this);

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;
  }

  connectedCallback(){
    console.log('connected', this);

    if(this.attributes.src){
      this.link = Link(this.attributes.src.value);

      this.link.children(links => {
        this.placeLinks(links);
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log(name, oldValue, newValue);
    switch(name){
      case 'src':
        this.link = Link(newValue);

        this.link.children(links => {
          this.placeLinks(links);
        });
        break;
    }
  }

  append(link){
    let div = document.createElement('div');

    var list = this.shadowRoot.querySelector('#list');
    list.appendChild(div);

    link.load(item => {
      if(!item) return div.remove();
      let $item = $('<fractal-photo>', {
        src: link.url
      });
      $(div).replaceWith($item);
    });
  }

  placeLinks(links){
    var list = this.shadowRoot.querySelector('#list');
    while(list.firstChild){
      list.removeChild(list.firstChild);
    };

    links.forEach(link => this.append(link));
  }
};


window.customElements.define(element.is, element);
