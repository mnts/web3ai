import Map_type from '../types/map.js';

var Near = {};

document.addEventListener('DOMContentLoaded', ev => {
	Near.app = document.querySelector('#near-app');
});

Map_type.contructor.initScripts(() => {
  readyMap.then(map => {
	Near.gmap = new google.maps.Map(gmap_div, {
	  center: {lat: -34.397, lng: 150.644},
	  zoom: 8
	});
  });
});