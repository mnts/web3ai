import account from '../account.js';
import User from '../acc/User.js';
import servers from '../data/servers.js';

var ready = new Promise((ok, no) => {
  window.initMap = map => {
  	console.log('jaa');
    ok();
  };
});

var gmap;

function initScripts(cb){
	if(!$('script[src*="maps.googleapis.com/maps/api/js"]').length){
		var tag = document.createElement('script');
		tag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDE7m50ILI18LCswZZ93W5KyFgtnASmkhg&libraries=places&callback=initMap';
		document.body.append(tag);
	}
}


function CustomMarker(latlng, map, path) {
    this.latlng_ = latlng;
    this.path = path;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
}



window.addEventListener('DOMContentLoaded', function(){
	if(!Cfg.map || !Cfg.map.on) return;

	initScripts();

	var div = document.getElementById('map');
	
	ready.then(map => {
		console.log(map);
		gmap = new google.maps.Map(div, {
			center: {lat: 37.781555, lng: -122.393990},
			zoom: 8,
    		mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		console.log(gmap);

		CustomMarker.prototype = new google.maps.OverlayView();

		CustomMarker.prototype.draw = function(){
			var div = this.div_;
			if (!div) {
				div = this.div_ = document.createElement('div');
				div.className = "customMarker"

				var user = document.createElement('pineal-user');
				user.setAttribute('path', this.path);
				div.appendChild(user);


				var me = this;
				google.maps.event.addDomListener(div, "click", function (event) {
					google.maps.event.trigger(me, "click");
				});

				var panes = this.getPanes();
				panes.overlayImage.appendChild(div);
			}
			
			this.setPosition();
		};

		CustomMarker.prototype.remove = function () {
			// Check if the overlay was on the map and needs to be removed.
			if (this.div_) {
				this.div_.parentNode.removeChild(this.div_);
				this.div_ = null;
			}
		};

		CustomMarker.prototype.getPosition = function () {
			return this.latlng_;
		};


		CustomMarker.prototype.setPosition = function (pos) {
			if(pos) this.latlng_ = pos;
			var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
			var div = this.div_;
			if (point && point.x && point.y){
				div.style.left = point.x + 'px';
				div.style.top = point.y + 'px';
			}
		};

		var users = gmap.fractal_users = {};

		account.authenticated.then(acc => {
			servers.connect(Cfg.api).then(ws => {
				let locate = m => {
					if(!m.user_email || !m.latitude || !m.longitude) return;
					
					let user = users[m.user_email];
					if(!user) user = users[m.user_email] = new User(m.user_email);

					var position = new google.maps.LatLng(m.latitude, m.longitude);

					if(!user.marker){
						user.load(user_item => {
							user.marker = new CustomMarker(position, gmap, m.user_email);
						});
					}
					else
						user.marker.setPosition(position);
				};

				ws.send({
					cmd: 'listLocations',
				}, r => {
					(r.locations || []).forEach(loc => {
						locate(loc);
					});
				});

				ws.on.located = m => {
					locate(m);
				}


				var marker;
				navigator.geolocation.watchPosition(t => {
					var position = new google.maps.LatLng(t.coords.latitude, t.coords.longitude);
					console.log(position);

					if(!marker){
						marker = new CustomMarker(position, gmap, acc.user.email);
						console.log(marker)
						
						gmap.setZoom(17);
						gmap.panTo(position);
					}
					else{
						marker.setPosition(position)
					}

					ws.send({
						cmd: 'updateLocation',
						latitude: t.coords.latitude, 
						longitude: t.coords.longitude
					});

					console.log(marker, position);
				});
			});
		});
	});

});

export {gmap};