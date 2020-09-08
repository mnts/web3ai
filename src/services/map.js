import account from '../account.js';
import {U} from '../acc/users.js';
import servers from '../data/servers.js';
var CustomMarker;

const select = q => document.querySelector(q);

const W = m => {
	return new Promise((ok, no) => {
	   servers.connect(Cfg.api).then(ws => {
			ws.send(m, r => {
			  r?ok(r):no();
			});
	   });
	});
}

var ready = new Promise((ok, no) => {
  window.initMap = map => {
    ok();
  };
});

var gmap;

var myMarker,
    myCoord;

function initScripts(cb){
	if(!$('script[src*="maps.googleapis.com/maps/api/js"]').length){
		var tag = document.createElement('script');
		tag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDE7m50ILI18LCswZZ93W5KyFgtnASmkhg&libraries=places&callback=initMap';
		document.body.append(tag);
	}
}

function setPosition(marker, coord){
	var position = new google.maps.LatLng(coord[0], coord[1]);
	marker.setPosition(position);

    var dist_area = select('#distance-area');
    if(dist_area){
		var dist = distance(coord[0], coord[1], myCoord[0], myCoord[1], 'K'),
			max = parseInt(dist_area.innerText);
        
        if(max)
		    marker.div.style.display = dist<max?'block':'none'
    }
}

const locate = m => {
	if(!m.owner || typeof m.location != 'object') return;
	let coord = m.location.coordinates;

	let user = U(m.owner);
    
	var position = new google.maps.LatLng(coord[0], coord[1]);

	if(user.marker)
		setPosition(user.marker, coord);
	else{
		user.load(user_item => {
			user.marker = new CustomMarker(position, gmap, m.owner);		
    		user.marker.div.classList.add('user');
			user.marker.dragEnd = () => {
				let coordinates = [
					user.marker.latlng.lat(), 
					user.marker.latlng.lng()
				];
                
				user.axon.link.set('location', {
					type: "Point",
					coordinates
				});
			};
			setPosition(user.marker, coord);
			user.axon.link.monitor(c => {
				if(!c.location) return;
				setPosition(user.marker, c.location.coordinates);
			});
		});
	}
};

const day = 1000 * 60 * 60 * 24;

function filter($box){
	if(!myCoord) return;

	let filter = {
		location: {
			$geoWithin: {$box}
		},

        updated: {
        	$gt: ((new Date()).getTime() - day)
        }
	};

	if(account.user)
	    filter.owner = {
	    	$ne: account.user.email
	    };

	var q = {
	  collection: 'users',
	  cmd: 'load',
	  mod: {
		owner: 1,
		location: 1
	  },
	  filter,
	  limit: 100
	};

	W(q).then(r => {
		(r.items || []).map(item => {
			locate(item);
		});
	});
}

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2))
		return 0;
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1)
			dist = 1;
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
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

    // load maps api only when we actually need it
	var observer = new MutationObserver(muts => {
		muts.forEach(mut => {
			if(
				mut.type == 'attributes' &&
				mut.attributeName == 'class'
			){
				if(!gmap && div.classList.contains('selected'))
				    initScripts();
			}
		});
	});

	if(div) observer.observe(div, {
		attributes: true
	})
	else return;
	
	ready.then(async map => {
		let mod = await import('/lib/CustomMarker.js');
		CustomMarker = mod.default;

		gmap = new google.maps.Map(div, {
			center: {lat: 37.781555, lng: -122.393990},
			zoom: 8,
    		mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: false,
            streetViewControl: false
		});
        
		var users = gmap.fractal_users = {};

		let checkBounds = () => {
			let sw = gmap.getBounds().getSouthWest(),
				ne = gmap.getBounds().getNorthEast();

			filter([
				[sw.lat(), sw.lng()],
				[ne.lat(), ne.lng()]
			]);
		}
        
        let timeout;
		google.maps.event.addListener(gmap, "bounds_changed", ev => {
			clearTimeout(timeout);
			timeout = setTimeout(() => checkBounds, 500);
		});

        
        google.maps.event.addListenerOnce(gmap, 'tilesloaded', () => {
			var padbnds = paddedBounds(gmap, 50, 70, 100, 30);
			gmap.fitBounds(padbnds);
            
		    setInterval(checkBounds, 4000);
            
			account.authenticated.then(acc => {
				servers.connect(Cfg.api).then(ws => {
					WS = ws;

					const placeMe = coords => {
						myCoord = [coords.latitude, coords.longitude];
						account.user.axon.link.set('location', {
							type: "Point",
						    coordinates: myCoord
					    });

						var position = new google.maps.LatLng(coords.latitude, coords.longitude);
                        
                        if(myMarker)
							myMarker.setPosition(position);
						else{
							myMarker = new CustomMarker(position, gmap, acc.user.email);
                            myMarker.div.classList.add('me');
							
							gmap.setZoom(17);
							gmap.panTo(position);
						};
					};
                    
					navigator.geolocation.getCurrentPosition(t => placeMe(t.coords));
					navigator.geolocation.watchPosition(t => placeMe(t.coords));
				});
			});
        });
	});

});

export {gmap};

