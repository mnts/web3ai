function CustomMarker(latlng, map, path) {
    this.latlng = latlng;
    this.path = path;
    
	this.div = document.createElement('div');
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.init = function(){
  var container=this.div,
	  that=this;

  container.style.position='absolute';
  container.draggable=true;
  google.maps.event.addDomListener(
	  this.get('map').getDiv(),
	  'mouseleave',
	  () => google.maps.event.trigger(container,'mouseup')
  );


  if(this.draggable) google.maps.event.addDomListener(container, 'mousedown', function(e){
  	this.style.cursor='move';
  	that.map.set('draggable',false);
  	that.set('origin',e);

  	let drag;
  
  	that.moveHandler = google.maps.event.addDomListener(
  		that.get('map').getDiv(),
  		'mousemove',
  		e => {
  			if(!drag){
                container.classList.add('dragging');
                drag = true;
  			}

  			var origin = that.get('origin'),
  				left = origin.clientX-e.clientX,
  				top = origin.clientY-e.clientY,
  				pos = that.getProjection().fromLatLngToDivPixel(that.latlng),
  				latLng = that.getProjection().fromDivPixelToLatLng(
  					new google.maps.Point(pos.x-left, pos.y-top)
  				);
  
  			that.set('origin',e);
  			that.set('latlng', latLng);
  			that.draw();
  		}
  	);
  });
  
  google.maps.event.addDomListener(container, 'mouseup', function(){
  	if(!that.moveHandler) return;
  	google.maps.event.removeListener(that.moveHandler);
  	delete that.moveHandler;

  	setTimeout(ev => {
        container.classList.remove('dragging');
  	}, 600);
  	
  	that.map.set('draggable', true);
  	this.style.cursor='default';
  	
  	if(that.dragEnd) that.dragEnd();
  });


  this.set('container', container)
  this.getPanes().floatPane.appendChild(container);
};

CustomMarker.prototype.draw = function(){
	if(!this.div.classList.contains('customMarker')){
		this.div.classList.add("customMarker");

		var userEl = document.createElement('pineal-user');
		userEl.setAttribute('path', this.path);
		this.div.appendChild(userEl);

		userEl.addEventListener('click', ev => {
			//document.querySelector('#chats').selectChat(userEl.user.item);
		});

		var me = this;
		google.maps.event.addDomListener(this.div, "click", function (event) {
			google.maps.event.trigger(me, "click");
		});

		var panes = this.getPanes();
		panes.overlayImage.appendChild(this.div);

		this.init();
	}

	this.setPosition();
};

CustomMarker.prototype.remove = function () {
	// Check if the overlay was on the map and needs to be removed.
	if(this.div){
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}
};

CustomMarker.prototype.getPosition = function () {
	return this.latlng;
};


CustomMarker.prototype.setPosition = function (pos) {
	if(pos) this.latlng = pos;

	const projection = this.getProjection();
	if(!projection) return;

	const point = projection.fromLatLngToDivPixel(this.latlng);
    if(!this.div) console.log(this);
	if (point && point.x && point.y){
		this.div.style.left = point.x + 'px';
		this.div.style.top = point.y + 'px';
	}
};

export default CustomMarker;