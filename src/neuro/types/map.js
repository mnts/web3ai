import Neuron from '../Neuron.js';

window.readyMap = new Promise((ok, no) => {
  window.initMap = map => {
    ok();
  };
});


export default class map extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);

    this.icon = 'map';
    //this.color = 'orange';
  }

  static get item(){
    return {
      title: 'Map',
      type: 'map',
    }
  }

  append(where){
    if(!where) this.where = document.querySelector('.apps');

    this.where.append(this.container);
  }

  select(){
    $(this.container).addClass('selected').siblings('.app').removeClass('selected');
  }

  open(){
    if(!this.container) this.initApp();

    this.select();
  }

  initApp(){
    var app = this.container = document.createElement('div');
    app.id = 'app_'+md5(this.link.url);
    app.classList.add("app");
    _.extend(this.container.style, {
      padding: 0,
      //height:  'calc(100% - 50px)'
    });

    this.append();

    this.initGMap();
  }

  initScripts(cb){
    if(!$('script[src*="maps.googleapis.com/maps/api/js"]').length){
      let tag = document.createElement('script');
      tag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDE7m50ILI18LCswZZ93W5KyFgtnASmkhg&libraries=places&callback=initMap';
      document.body.appendChild(tag);
      tag.onload = cb();
    }
    else cb();
  }

  initGMap(cb){
    var gmap_div = document.createElement('div');
    gmap_div.style.height = '100%';

    this.container.appendChild(gmap_div);

    this.initScripts(() => {
      readyMap.then(map => {
        this.gmap = new google.maps.Map(gmap_div, {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });

        if(cb) cb();
      });
    });
  }
}
