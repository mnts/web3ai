class element extends HTMLElement{
  static get is(){
    return 'pineal-colors';
  }

  static get template(){
    return`
      <style>
        :host{
          display: inline-block;
        }

        canvas{
          border-radius: 4px;
        }
      </style>

      <canvas></canvas>
    `;
  }

  constructor() {
    super();


    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;

    this.canvas = this.shadowRoot.querySelector('canvas');
    console.log('Pineal-colors constructed');
  
    console.log('Pineal-colors connected', this);
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.canvas.width = this.attributes.width.value;
    this.canvas.height = this.attributes.height.value;

    var ctx = this.canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(0,    "rgb(255,   0,   0)");
    gradient.addColorStop(0.15, "rgb(255,   0, 255)");
    gradient.addColorStop(0.33, "rgb(0,     0, 255)");
    gradient.addColorStop(0.49, "rgb(0,   255, 255)");
    gradient.addColorStop(0.64, "rgb(0,   255,   0)");
    gradient.addColorStop(0.76, "rgb(255, 255,   0)");
    gradient.addColorStop(0.90, "rgb(255,   0,   0)");
    gradient.addColorStop(1, "rgb(100, 100, 100)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5,  "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1,   "rgba(0, 0, 0, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var color, hold = false;
    var pick = e => {
      if(!hold) return;
      var pos = $(this).offset(),
      x = e.pageX - pos.left,
      y = e.pageY - pos.top;
      console.log(e.pageX, e.pageY, e, pos, x,' x ',y);
      if(x<1 || y<1 || x>this.clientWidth-1 || y>this.clientHeight)return;

      var pix = ctx.getImageData(x,y,1,1).data;
      var c = rgb2dec(pix[0],pix[1],pix[2]);

      color = dec2hex(c);

      var event = new CustomEvent('pick', {detail: {color}});
      this.dispatchEvent(event);
    }

    $(this.canvas).mousedown(ev => {
      hold = true;
      pick(ev);
    }).mousemove(pick).mouseup(ev => {
      pick(ev);
      var event = new CustomEvent('picked', {detail: {color}});
      this.dispatchEvent(event);
      hold = false;
    });
  }


  connectedCallback(){
    
  }
};


window.customElements.define(element.is, element);
