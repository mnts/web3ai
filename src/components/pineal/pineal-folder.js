class element extends HTMLElement{
  static get is(){
    return 'pineal-folder';
  }

  static get template(){
    return`
      <style>
        main{
          display: block;
        }

        :host{
          display: block;
          padding: 10px 20px;
          background-color: #efefefeb;
          box-shadow: inset 0 4px 12px #d2d2d2;
          margin: 32px 0;
          overflow-x: auto;
          border-top: 2px dotted var(--color);
        }

        h3{
          margin: 16px 0 4px 14px;
          font-size: 18px;
          font-family: comfortaa;
          text-shadow: 2px 2px 6px #dedede;
        }

        #list{
          display: flex;
          flex-wrap: wrap;
        }

        pineal-item {
          height: 80px;
          width: calc(20% - 20px);
          width: 370px;
          white-space: normal;
          box-sizing: border-box;
          box-shadow: 2px 2px 6px #c5c5c5;
          flex-grow: 1;
          tansition: opacity .3s;
        }

        pineal-item:hover{
          opacity: 0.9;
        }

        @media screen and (max-width: 1400px) {
          pineal-item {
            awidth: calc(50% - 20px);
          }
        }
      </style>

      <h3 id='title'></h3>

      <div id='list'>
        <slot></slot>
      </div>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;
  }

  connectedCallback(){
    this.link = Link(this.attributes.src.value);

    this.link.load(item => {
      this.item = item;

      this.shadowRoot.querySelector('#title').innerText = item.title || item.name;

      this.link.children(links => {
        this.placeLinks(links);
      });
    });
  }

  placeLinks(links){
    var list = this.shadowRoot.querySelector('#list');
    while(list.firstChild){
      list.removeChild(list.firstChild);
    };

    links.forEach(link => {
      let div = document.createElement('div');
      this.appendChild(div);

      link.load(item => {
        if(!item) return div.remove();
        let $item = $('<pineal-item>', {
          item: JSON.stringify(item)
        });
        $(div).replaceWith($item);
      });
    });
  }
};


window.customElements.define(element.is, element);
