window.Properties = {
	mapOptions: {
		//center: { lat: position.coords.latitude, lng: position.coords.longitude},
		center: { lat: 54.69, lng: 25.28},
		zoom: 12
	},

	collections: {
		catalog: {
			fields: ['images', 'price']
		},

		tree: {
			fields: ['icon', 'description']
		},

		rooms: {
			fields: ['house', 'location', 'price', 'images']
		}
	},

	initMap: function(cb){
		if(!Properties.map){
			var opt = Properties.mapOptions;

			Properties.map = new google.maps.Map(document.getElementById('properties-map'), opt);

			Properties.map.myLatLng = new google.maps.LatLng(opt.center.lat, opt.center.lng),
			Properties.map.myMarker = new google.maps.Marker({
				    position: Properties.map.myLatLng,
				    map: Properties.map,
				    draggable: true,
				    title: "Change position"
				});

			if(Properties.latlng)
				Properties.setPosition(Properties.latlng);

			google.maps.event.addListener(Properties.map.myMarker, 'dragend', function(event){
				var lat = event.latLng.lat(),
					lng =  event.latLng.lng();
				console.log(lat+'x'+lng);
			});

			google.maps.event.addListenerOnce(Map.g, 'tilesloaded', function(){
				if(cb) cb(Properties.map);
			});
		}
		else if(Properties.latlng)
			Properties.setPosition(Properties.latlng);
	},


	setPosition: function(lat, lng){
		var latlng = lng?new google.maps.LatLng(lat, lng):lat;

		if(!Properties.map)
			Properties.latlng = latlng;
		else{
			Properties.map.setCenter(latlng);
			Properties.map.myMarker.setPosition(latlng);
		}
	},

	get: function(id, collection){
		var by = {id: id};

		if(!collection)
			collection = 'tree';
		Properties.collection = collection;

		ws.send({
			cmd: 'get',
			collection: collection,
			filter: by
		}, function(r){
			if(!r.item) return;

			Properties.load(r.item);
		});
	},

	onLoad: [
		// main
		function(item){
			Properties.form.type.value = item.type || '';
			Properties.form.name.value = item.name || '';
			Properties.form.title.value = item.title || '';
			Properties.form.url.value = item.url || '';
			Properties.form.start.value = item.start?(new Date(item.start||'')).toISOString().substr(0, 16):'';
			Properties.form.end.value = item.end?(new Date(item.end||'')).toISOString().substr(0, 16):'';
			$('#properties-input-hidden').classIf('v', item.hide);
		},

		// description
		function(item){
			Properties.form.description.value = item.description || '';
		},

		function(item){
			if(typeof item.geo == 'object' && item.geo.length >= 2){
				Properties.latlng = new google.maps.LatLng(item.geo[0], item.geo[1]);
			}
		},

		// icon
		function(item){
			if(item.icon){
				var icon = new Image;
				icon.onload = function(){
					icon.height = $('#properties-icon').height()*0.8;
				}
				icon.src = Cfg.files+item.icon;
				$('#properties-icon > p').hide();
				$('#properties-icon').append(icon);
			}
		},

		item => {
			$('#properties-image > img').remove();

			if(!item.image) return;

			var img = new Image;
			img.onload = () => $('#properties-image').append(img);
			img.src = Cfg.files + item.image;
		},

		/*
		// images
		function(item){
			if(typeof item.images == 'object' && item.images.length)
				item.images.forEach(function(id){
					Properties.carousel.push(id);
				});
		},
		*/
	],

	load: function(item){
		Properties.clear();


		$('#submitItem').hide();
		$('#updateItem').show().data('id', item.id);

		if(!acc.user){
			$('#edit-auth').show();
		}

		Properties.item = item;
		var collection = Properties.collections[Properties.collection];
		$('#properties-fields > .option').each(function(){
			var $field = $(this),
				name = $field.attr('name');


			//console.log(collection.fields.indexOf(name));
			if(collection && collection.fields && collection.fields.indexOf(name)+1)
				$field.addClass('on');

			var field = Properties.fields[name];

			if(field)
				field.show();
		});

		/*
		Properties.initMap(function(map){
			if(typeof item.geo == 'object' && item.geo.length >= 2){
				Properties.setPosition(item.geo[0], item.geo[1]);
			}
		});
		*/

		Properties.onLoad.forEach(function(f){
			f(item);
		});

		Properties.checkSite(item);

		ui.side('#properties');
	},

	checkSite: function(item){
		if(item.type != 'site'){
			$('#properties-site').hide();
			return;
		}

		var load = function(){
			$('#properties-site').show();

			console.log(Properties.form.domain);
			console.log(item);

			Properties.form.domain.value = item.domain || '';
		};

		if($('#properties-site').length)
			load();
		else
			$.get('/parts/properties-site.htm', function(data){
				$('#properties-infoMain').after(data);
				load();
			});
	},

	onClear: [],
	clear: function(){
		$('#submitItem').show();
		$('#updateItem').hide();

		if(!acc.user){
			$('#edit-auth').show();
		}

		for(var key in Properties.fields){
			Properties.fields[key].hide();
		}

		$('#properties-icon > img').remove();
		$('#properties-icon > p').show();

		//Properties.carousel.$t.children('span').remove();

		Properties.form.reset();
		$('#properties .check').removeClass('v');
		$('#properties-fields > .option.on').removeClass('on');

		Properties.onClear.forEach(function(f){
			f();
		});
	},

	new: function(collection, tid){
		if(tid) Properties.tid = tid;
		else delete Properties.tid;

		console.log(tid);

		Properties.collection = collection;
		Properties.clear();
		UI.side('#properties');
	},

	showField: function(name){
		$("#properties-fields > .option[name="+name+"]").addClass('on');
		Properties.fields[name].show();
	},

	fields: {},

	onCollect: [
		function(item){
			if(Properties.fields.description.is(':hidden')) return;
			item.description = Properties.form.description.value;

			var hide = $('#properties-input-hidden').hasClass('v');
			if(Properties.item && typeof Properties.item.hide == "boolean" || hide)
				item.hide = hide;
		},

		function(item){
			if(!Properties.form.domain) return;
			item.domain = Properties.form.domain.value;
		},

		function(item){
			if(Properties.fields.icon.hasClass('changed'))
				item.icon = Properties.fields.icon.data('id');
		},

		function(item){
			if(Properties.fields.images.is(':hidden')) return;
			item.images = [];
			Properties.fields.images.children('span').each(function(){
				var im = $(this).data();
				item.images.push(im.file);
			});
		},

		// map
		function(item){
			if(
				Properties.fields.location.is(':hidden') ||
				!Properties.map ||
				!Properties.map.myMarker
			) return;

			var pos = Properties.map.myMarker.getPosition();
			item.geo = [pos.lat(), pos.lng()];
		}
	],
	collect: function(){
		//var pos = Properties.map.myMarker.getPosition();

		var d = {
			type: Properties.form.type.value,
			name: Properties.form.name.value,
			title: Properties.form.title.value,
			start: (new Date(Properties.form.start.value)).getTime(),
			end: (new Date(Properties.form.end.value)).getTime()
		};


		Properties.onCollect.forEach(function(f){
			f(d);
		});



		return d;
	},

	validate: function(d){
		//if(!d.price) $(Properties.form.price).blink('red');
		//if(d.title.length < 5) $(Properties.form.title).blink('red');
	},

	save: function(){
		var d = Properties.collect();

		Properties.validate(d);
		if($(Properties.form).find('.red').length) return false;


		Properties.update(d);
	},

	update: function(item){
		if(!Properties.collection) return console.error('No collection');
		ws.send({
			cmd: 'update',
			collection: Properties.collection,
			set: item,
			id: $('#updateItem').data('id')
		}, function(r){
			if(r.item){
				if($('#catalog').is(':visible'))
					Catalog.search();

				var $prp = $('#tree .prp');

				var graphApp = Site.apps.graph;
				if($('#graph').is(':visible') && graphApp && graphApp.graph){
					graphApp.reload();
				}

				if(!$prp.length) return;

				var newItem = $prp.data();

				$.extend(newItem, item);

				var $new = Tree.build(newItem);

				if($prp.length)
					$prp.replaceWith($new);
				else
				if(window.Item)
					window.Item.preview(r.item.id, Properties.collection);
				//$('#catalog-list').prepend(List.build(r.item));
				UI.closeSides();
			}
		});
	},

	create: function(){
		var d = Properties.collect();

		Properties.validate(d);
		if($(Properties.form).find('.red').length) return false;

		Properties.submit(d);
	},

	submit: function(item){
		if(Properties.tid) item.tid = Properties.tid;
		ws.send({
			cmd: 'save',
			collection: Properties.collection,
			item: item
		}, function(r){
			if(r.item){
				if($('#catalog').is(':visible'))
					Catalog.search();
				Item.preview(r.item.id, Properties.collection);
				//$('#catalog-list').prepend(List.build(r.item));
				UI.closeSides();
			}
		});
	},

	//geocoder: new google.maps.Geocoder(),
	locate: function(address){
		Properties.form.address.value = address;

		Properties.geocoder.geocode({'address': address}, function(results, status){
			console.log(results);
			if(status == google.maps.GeocoderStatus.OK){
				var geo = results[0].geometry;
				var latitude = geo.location.lat(),
					longitude = geo.location.lng();

				Properties.map.setCenter(geo.location);
				Properties.map.myMarker.setPosition(geo.location);
			}
		});
	}
};

$(function(){
	var properties = Properties.form = document.forms.properties;
	properties.onsubmit = function(ev){
		return false;

		var d = {
			type: 'house',
			address: {},
			info: {}
		};

		if(properties.title.value.length < 5) $(properties.title).blink('red');
			d.title = properties.title.value;

		/*
		['state', 'town', 'address'].forEach(function(name){
			if(addItem[name].value.length < 3) $(addItem[name]).blink('red');
			d.address[name] = addItem[name].value;
		});
		*/

		if(properties.price.value < 1) $(properties.price).blink('red');
			d.price = parseInt(properties.price.value);

		['numBeds', 'numBaths'].forEach(function(name){
			if(!properties[name].value.length) $(properties[name]).blink('red');
			d.info[name] = parseInt(properties[name].value);
		});

		if($(properties).children('.red').length) return false;


		$.query('/list/add', d, function(r){
			if(r.item){
				$('#list').prepend(list.build(r.item));
				site.closeModals();
			}
		});
		return false;
	};

	$(properties).submit(function(){
	  return false;
	}).on('keyup keypress', function(e) {
		var code = e.keyCode || e.which;
		if(code == 13){
			e.preventDefault();
			return false;
		}
	});


	$('#properties-icon').uploadImage({
		cb: function(file){
			if(!file) return;

			$('#properties-icon').addClass('changed').data(file);

			var icon = new Image;
			icon.onload = function(){
				icon.height = $('#properties-icon').height()*0.8;
			}
			icon.src = Cfg.files+file.id;

			$('#properties-icon > img').remove();
			$('#properties-icon > p').hide();
			$('#properties-icon').append(icon);
		}
	});

	var $image = $('<div>', {id: 'properties-image'}).insertAfter('#properties-icon');
	$('<button>', {id: 'properties-image-upl'}).text('Upload image').appendTo($image)
	.uploadImage({
		cb: function(file){
			$('#properties-image > img').remove();
			var img = new Image;
			img.onload = () => {
				$image.append(img);

				Properties.update({image: file.id});
			};
			img.src = Cfg.files + file.id;
		}
	});


	var $field = $('<div>', {id: 'properties-url'}).insertAfter($image);
	$field.append('<i class="fa fa-link"></i>');
	$('<input>', {id: 'properties-url-input', placeholder: 'URL', name: 'url'}).change(function(){
		var set = {};
		set[this.name] = this.value;
		Tree.set(Properties.item.id, set).then(item => {
			$(this).blink(item?'green':'red');
		});
	}).appendTo($field);

	var $field = $('<paper-swatch-picker>', {
		id: 'properties-color',
		columnCount: 20
	}).on('color-picker-selected', function(ev){
		Tree.set(Properties.item.id, ev.originalEvent.detail);
	}).insertAfter($field);

	Properties.onLoad.push(item => {
		$('#properties-color').attr('color', item.color || 'blue');
	});




	$('#properties-types > .option').click(function(){
		Properties.form.type.value = this.textContent;
	});

	$(Properties.form.type).tip({
		pos: 'b',
		id: 'properties-types',
		event: 'click',
		fix: 'l',
	});


	$('#edit-auth').click(function(){
		ui.modal('#authentication');
	});

	//Properties.clear();
	$(Properties.form).on('open', function(){
		//Properties.initMap();
	});


	$(Properties.form).on('close', function(){
		$('#tree .prp').removeClass('prp');
	});

	//map.searchBox = new google.maps.places.SearchBox(addItem.address);

	$('#updateItem').click(function(ev){
		Properties.save();
	});

	$('#submitItem').click(function(ev){
		Properties.create();
	});

	$('#submitItem, #updateItem').click(function(ev){
		if(this.id == 'submitItem'){

		}
		else
		if(this.id == 'updateItem'){

		}
	});


	$('#properties-selectFields').tip({
		pos: 'b',
		id: 'properties-fields',
		event: 'click'
	});


	$.extend(Properties.fields, {
		description: $('#properties-infoDescription'),
		location: $('#properties-infoLocation'),
		price: $('#properties-infoPrice'),
		icon: $('#properties-icon'),
		house: $('#properties-infoHouse')
	});

	$('#properties > .field').each(function(){
		var name = $(this).data('name');
		Properties.fields[name] = $(this);
	});


	$('#properties-fields > .option').click(function(){
		var $field = $(this);
		$field.toggleClass('on');
		var name = $field.attr('name');
		Properties.fields[name].showIf($field.hasClass('on'));

		if(name == 'location')
			Properties.initMap();
	});

	$(properties.address).inputAddress({
		locate: Properties.locate
	});

	$('#properties').on('open', function(){
		if($('#properties-fieldMap').hasClass('on'))
			Properties.initMap();
	});


	/*
	var carousel = Properties.carousel = new Carousel({});
	carousel.$t[0].id = 'properties-addImages';
	carousel.$t.insertAfter('#properties-infoDescription');
	Properties.fields.images = carousel.$t;
	*/

	//	slider
	var $slider = $('#properties-infoWidth > .sl');

	Properties.onClear.push(function(){
		$slider.text('');
	});

	Properties.onLoad.push(function(item){
		if(item.width){
			Properties.showField('width');
			$slider.trigger('updateValue', item.width || 0);
		}
	});

	Properties.onCollect.push(function(item){
		if($('#properties-infoWidth').is(':visible'))
			item.width = parseInt($slider.position().left);
	});

	$slider.on('updateValue', function(){
		$slider.text(parseInt($slider.position().left));
	});


	$('#plus').click(function(){
		$('#submitItem').show();
		$('#updateItem').hide();

		ui.side('#newItem');
	});

	$('#item-upload').click(function(){
		$('#upl-img').click();
	});

	$('#filter-days').tip({
		pos: 'b',
		id: 'tip-filter-days',
		event: 'click',
		fix: 'c',
	});


	ui.closeSides();

	$('#states > .option').click(function(){
		properties.state.value = this.textContent;
	});

	$('#edit-auth').showIf(!acc.user);
	acc.on.push(function(){

	});
});
