import account from '../account.js';
import User from '../acc/User.js';
import servers from '../data/servers.js';

var ready = new Promise((ok, no) => {
  window.initMap = map => {
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

function paddedBounds(map, npad, spad, epad, wpad) {
    var SW = map.getBounds().getSouthWest();
    var NE = map.getBounds().getNorthEast();
    var topRight = map.getProjection().fromLatLngToPoint(NE);
    var bottomLeft = map.getProjection().fromLatLngToPoint(SW);
    var scale = Math.pow(2, map.getZoom());

    var SWtopoint = map.getProjection().fromLatLngToPoint(SW);
    var SWpoint = new google.maps.Point(((SWtopoint.x - bottomLeft.x) * scale) + wpad, ((SWtopoint.y - topRight.y) * scale) - spad);
    var SWworld = new google.maps.Point(SWpoint.x / scale + bottomLeft.x, SWpoint.y / scale + topRight.y);
    var pt1 = map.getProjection().fromPointToLatLng(SWworld);

    var NEtopoint = map.getProjection().fromLatLngToPoint(NE);
    var NEpoint = new google.maps.Point(((NEtopoint.x - bottomLeft.x) * scale) - epad, ((NEtopoint.y - topRight.y) * scale) + npad);
    var NEworld = new google.maps.Point(NEpoint.x / scale + bottomLeft.x, NEpoint.y / scale + topRight.y);
    var pt2 = map.getProjection().fromPointToLatLng(NEworld);

    return new google.maps.LatLngBounds(pt1, pt2);
}

window.addEventListener('DOMContentLoaded', function(){
	//if(!Cfg.map || !Cfg.map.on) return;

	var div = document.getElementById('map');
	if(!div) return;
    
    if(div.classList.contains('selected'))
        initScripts();
    else (new MutationObserver(muts => muts.forEach(mut => {
		if(mut.attributeName == 'class' && div.classList.contains('selected'))
			initScripts();
	}))).observe(div, {
		attributes: true
	});
	
	ready.then(map => {
		gmap = new google.maps.Map(div, {
			center: {lat: 37.781555, lng: -122.393990},
			zoom: 8,
    		mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: false,
            streetViewControl: false
		});



		CustomMarker.prototype = new google.maps.OverlayView();

		CustomMarker.prototype.draw = () => {
			var div = this.div_;
			if (!div) {
				div = this.div_ = document.createElement('div');
				div.className = "customMarker"

				var userEl = document.createElement('pineal-user');
				userEl.setAttribute('path', this.path);
				div.appendChild(userEl);

				userEl.addEventListener('click', ev => {
					document.querySelector('#chats').selectChat(userEl.user.item);
				});
                
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
			const div = this.div_;
			if (point && point.x && point.y){
				div.style.left = point.x + 'px';
				div.style.top = point.y + 'px';
			}
		};

		var users = gmap.fractal_users = {};
        
        google.maps.event.addListenerOnce(gmap, 'tilesloaded', () => {
			var padbnds = paddedBounds(gmap, 50, 70, 100, 30);
			gmap.fitBounds(padbnds);
            
			account.authenticated.then(acc => {
				servers.connect(Cfg.api).then(ws => {
					let locate = m => {
						if(!m.user_email || !m.latitude || !m.longitude) return;

						let user = users[m.user_email];
						if(!user) user = users[m.user_email] = new User(m.user_email);

						var position = new google.maps.LatLng(m.latitude, m.longitude);

						if(user.marker)
							user.marker.setPosition(position)
						else{
							user.load(user_item => {
								user.marker = new CustomMarker(position, gmap, m.user_email);
							});
						}
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
					
					const placeMarker = coords => {
						var position = new google.maps.LatLng(coords.latitude, coords.longitude);
                        
						if(marker)
							marker.setPosition(position);
						else{
							marker = new CustomMarker(position, gmap, acc.user.email);

							gmap.setZoom(17);
							gmap.panTo(position);
						};

						ws.send({
							cmd: 'updateLocation',
							latitude: coords.latitude, 
							longitude: coords.longitude
						});
					};

					navigator.geolocation.getCurrentPosition(t => placeMarker(t.coords));
					navigator.geolocation.watchPosition(t => placeMarker(t.coords));
				});
			});
        });
	});

});

export {gmap};