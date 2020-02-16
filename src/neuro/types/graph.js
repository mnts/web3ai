import Neuron from '../Neuron.js';
export default class graph extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

    this.icon = 'editor:bubble-chart';
    this.color = '#4488CC';
  }

  open(link){
    if(!this.app_div) this.initApp();

    $('.app').hide();
    $(this.app_div).show();
  }

  initApp(){
    var app = this.app_div = document.createElement('div');
    app.id = 'app_'+md5(this.link.url);
    this.app_div.classList.add("app");
    _.extend(this.app_div.style, {
      padding: 0,
      height: '100%'
    });


    var apps = document.querySelector('pineal-apps');
    apps.open(this.app_div);

    this.initSvg();
  }
    //Melissa Byron

  initSvg(){
    var svg_div = document.createElement('div');
    svg_div.style.height = '100%';

    this.app_div.appendChild(svg_div);

    var svg = new SVG(svg_div).size("100%", '100%');
    var links = svg.group();
    var markers = svg.group();
    var nodes = svg.group();

    var g1 = nodes.group().translate(300, 100).draggy();
    g1.circle(80).fill("#C2185B");

    var g2 = nodes.group().translate(100, 100).draggy();
    g2.circle(50).fill("#E91E63");

    var g3 = nodes.group().translate(200, 300).draggy();
    g3.circle(100).fill("#FF5252");

    g1.connectable({
      container: links,
      markers: markers
    }, g2).setLineColor("#5D4037");

    g2.connectable({
      container: links,
      markers: markers
    }, g1).setLineColor("#5D4037");


    g2.connectable({
      padEllipse: true
    }, g3).setLineColor("#5D4037")

    g3.connectable({
      padEllipse: true
    }, g2).setLineColor("#5D4037")

  }
}
