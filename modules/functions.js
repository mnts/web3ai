function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


function loadScript(src){
 return new Promise(function(resolve, reject) {
   const script = document.createElement('script');
   script.async = true;
   script.src = src;
   script.onload = resolve;
   script.onerror = reject;
   document.head.appendChild(script);
 });
};

Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};

var randomLine = function(l, c){
	var s = '';
	l = l || 24; // you are not going to make a 0 length random number, so no need to check type
	c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
	return s;
}


	var drg_item = 0;

	var drg = {
		enter: function(e){

		},

		isBad: function(){
			return !(drg.$ && (drg.type == 'cat' || drg.type == 'img'));
		}
	}

	//get exact path of real image.
	var url_info = function(url){
		var qs = parseQS(decodeURIComponent(url));
		if(qs && qs.imgurl)
			return {
				url: qs.imgurl,
				type: 'image',
				name: randomString(5)+'.jpg'
			};

		if(url.indexOf('imgur.com')+1){
			var parts = url.replace(/^(https?|ftp):\/\//, '').split('/'),
				ext = ''+url.split('.').pop();


			if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext)+1)
				return {
					type: 'image',
					url, ext,
					name: url.split('/').pop()
				};

			return {
				url: 'http://i.imgur.com/'+parts[2]+'.jpg',
				type: 'image',
				name: parts[2]+'.jpg'
			};
		}
		else
		if(url.indexOf('upload.wikimedia.org')+1 && url.indexOf('/thumb/')+1){
			var urlA = url.split('/');
			urlA.pop();
			urlA.splice(urlA.indexOf('thumb'), 1);
			url = urlA.join('/');

			return {
				url,
				type: 'image',
				ext: 'jpg',
				name: randomString(5)+'.jpg'
			};
		}
		else {
			var p = url.split('/'),
					name = p.pop(),
					ext = name.split('.').pop();

			if(name.length > 20)
				name = randomString(5);

			return {
				name,
				url
			};
		};
	};

	$.fn.drg = function(cf){
		var cfg = $.extend({

		}, cf);

		this.each(function(){
			$(this).attr('draggable', true);

			this.addEventListener('dragstart', function(e){
				//if(!acc || drg.$.parent().parent().parent().data('owner') != acc._id) return false;
				(drg.$ = $(this).addClass('drag')).nextAll('ul').hide();
				e.dataTransfer.setData('fp', true);
				e.dataTransfer.setData("text/html", "<div class='whatever'>jajfdsdfjjjjaaaaa</div>");
				drg.first_index = drg.$.parent().index();

				var parent_data = drg.$.parent().parent().prevAll('.node').data();
				drg.parent_node = parent_data['node'];

				return false;
			}, false);

			this.addEventListener('dragenter', function(ev){
				$(cfg.tree_root).find('ul').removeClass('mark');
				if(drg.$){
					var $el = $(this).parent();

					/*
					var owner = $el.parent().parent().data('owner');
					if(!Acc.user || (owner != acc.user.id && !Acc.user.super))
						return false;
					*/

					var $li = drg.$.parent();

					if(drg.$.parent()[0] != $el[0])
						if(drg.$[0].offsetTop < $el[0].offsetTop)
							if($(this).hasClass('opened')){
								//if(!Acc.user || $el.data('owner') != Acc.user.id  || !Acc.user.super) return false;
								$(this).nextAll('ul').prepend($li);
							}
							else
								$li.insertAfter($el);
						else
							$li.insertBefore($el);

					$li.parent().addClass('mark');
				}

				drg.enter(ev);
			}, false);

			this.addEventListener('dragleave', function(){
				$(this).removeClass('drop');
			}, false);

			this.addEventListener('drop', function(ev){
				var txt = ev.dataTransfer.getData('URL') || ev.dataTransfer.getData('Text');
				if(!txt) return;

				var info = url_info(txt);


				var node = $(this).data('node');
				if(node.item.type != 'directory' && node.item.type != 'folder' && node.item.type != 'fldr'){
					var node = $(this).parent().parent().prevAll('.node').data('node');
				}

				console.log(node);
				if(node.link.protocol == 'fs'){
					var link_file = new Link(node.link.url + '/' + info.name);
					link_file.upload_url(info.url).then(r => {
						console.log(r);
						//parent_node.saveOrder();
					});
				}

				$(this).removeClass('drop');
			}, false);

			this.addEventListener('dragend', function(){
				if(drg.$){
					var node = drg.$.data('node');
					var $item = drg.$.parent();
					if(drg.$.parent().hasClass('opened'))
						drg.$.nextAll('ul').show();

					drg.$.removeClass('drag');

					var tid = $(cfg.tree_root).find('.mark').parent().data('id');
					$(cfg.tree_root).find('.mark').removeClass('mark');

					var new_node = drg.$.parent().parent().prevAll('.node').data('node');

					console.log(drg.$, drg.$.parent().parent(), new_node, drg.parent_node, node);

					// if all in same parent node

					if(
						drg.parent_node.link.protocol == new_node.link.protocol && 
						new_node.own && node.own && node.link.move
					){
						node.link.move(node.$element.index(), new_node.item.id);
					}
					else
					if(drg.parent_node.link.url == new_node.link.url)
						new_node.saveOrder();
					else{
						// or it was moved to different node

						if(
							drg.parent_node.link.protocol == 'mongo' &&
							new_node.link.protocol == 'fs'
						){
							//var item = drg.parent_node.item;
							//var node = new Node(item, {link: drg.parent_node.link});

							// put old one there again
							var $new = $item.clone(),
								$sub = drg.parent_node.$element.children('ul');
							if(drg.first_index == 0)
								$sub.prepend($new);
							else{
								$sub.children().eq(drg.first_index).before($new);
							}



							// then download and copy
							console.log('download', node);

							//new_node.link.path + name;
							//Link();

						}
						else{
							console.log('new_node');
							new_node.saveOrder();
							console.log('prent_node');
							drg.parent_node.saveOrder();
						}
					}

					delete drg.$;
					$(cfg.tree_root).find('ul').removeClass('mark');
				};
			}, false);
		});

		return this;
	};




function getVimeoThumbnail(id, cb){
	$.ajax({
		type:'GET',
		url: 'http://vimeo.com/api/v2/video/' + id + '.json',
		jsonp: 'callback',
		dataType: 'jsonp',
		success: function(data){
			cb(data[0]);
		}
	});
}

/*
//cuz doesnt work with blockstack
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}
*/


String.prototype.url = function(){
	var url = this;
	var preserveNormalForm = /[,_`;\':-]+/gi
	url = url.replace(preserveNormalForm, ' ');

	for(var letter in diacritics)
		url = url.replace(diacritics[letter], letter);

	url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
	url = url.replace(/\s+/gi, '-');
	return url;
}


$.fn.blink = function(cls, time, cb){
	cls = cls || 'wrong';
	time = time || 1200;
	var $el = this.addClass(cls);
	setTimeout(function(){
		$el.removeClass(cls);
		if(cb)cb();
	},time);
	return this;
};


function parseQuery(querystring){
  if(!querystring) return {};
  querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
  var params = {}, pair, d = decodeURIComponent;
  // march and parse
  for (var i = querystring.length - 1; i >= 0; i--) {
    pair = querystring[i].split('=');
    params[d(pair[0])] = d(pair[1]);
  }

  return params;
};//--  fn  deparam

function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}

function convertImage(el, type){
	var binary = atob(el.toDataURL("image/"+type, 1).split(',')[1]);
	var array = [];
	for(var i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], {type: 'image/'+type});
};

function loadImg(url, cb){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			var bytes = new Uint8Array(this.response);

			var img = new Image;
			img.src = 'data:image/jpg;base64,'+encode(bytes);
			cb(img);
		}
	}
	xhr.open('GET', url);
	xhr.responseType = 'arraybuffer';
	xhr.send();
}

function randomString(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

var q = {
	txt: function(a){return a?a:''},
	sh: function(a){return a?'show':'hide'},
	ar: function(a){return a?'addClass':'removeClass'},
	sUD: function(a){return a?'slideDown':'slideUp'},
	f: function(){return false},
	p: function(e){
		e.preventDefault();
	}
}

window.CB = function(){};

String.prototype.nl2br = function(){
  return (this + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br/>' + '$2');
}

String.prototype.count=function(s1){
    return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}

function isNum(num){
	return num == parseInt(num);
}

function dec2rgb(c){
	return (((c & 0xff0000) >> 16)+','+((c & 0x00ff00) >> 8)+','+(c & 0x0000ff));
}

function rgb2dec(r,g,b){
	return (r << 16) + (g << 8) + b;;
}

function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


/*
function dec2hex(i) {
   return (i+0x10000).toString(16).substr(-4).toUpperCase();
}
*/

function dec2hex(c){
    return "#" + ((1 << 24) + (c & 0xff0000) + (c & 0x00ff00) + (c & 0x0000ff)).toString(16).slice(1);
}

function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function color(str){
	if (str.charAt(0) == '#')
		str = str.substr(1,6);

    str = str.replace(/ /g,'').toLowerCase();

	var bits;
	if(bits = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/).exec(str))
		return rgb2dec(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));

	if(bits = (/^(\w{2})(\w{2})(\w{2})$/).exec(str))
		return rgb2dec(parseInt(bits[1],16),parseInt(bits[2],16),parseInt(bits[3],16));

	if(bits = (/^(\w{1})(\w{1})(\w{1})$/).exec(str))
		return rgb2dec(parseInt(bits[1] + bits[1], 16),parseInt(bits[2] + bits[2], 16),parseInt(bits[2] + bits[2], 16));
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

window.tip = {
	active: false,
	check: function(){
		if(tip.active){
			$('.tip').hide();
			$('.fcs').removeClass('fcs');
			tip.active = false;
		}
	}
};

Image.prototype.generateThumb = function(w, h, cb){
  var image = this;
  var ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = w,
  ctx.canvas.height = h;

  /*
  ctx.fillStyle = color || "rgba(0,0,0,0.5)";
  ctx.beginPath();
  var o = wh/2;

  ctx.arc(o, o, o, 0, Math.PI*2, false);
  ctx.fill();
  ctx.clip();
  */


  var ratio = image.width/image.height;
  if(w/h > ratio)
    var height = Math.round(w/ratio),
      width = w;
  else
    var width = Math.round(h*ratio),
      height = h;

  ctx.drawImage(image, (w-width)/2, (h-height)/2, width, height);

  if(cb) ctx.canvas.toBlob(cb);
  else{
    var im = new Image;
    im.src = ctx.canvas.toDataURL("image/png");
    return image;
  }
};

$.fn.uploadImage = function(cfg){

	var ws = cfg.ws;

  var $file =  $('<input>', {type: 'file'});
  $(this).click(function(){
    $file.click();
  });


  $file.bind('change', evt => {
    evt.preventDefault();

    var f = evt.target.files[0];
    if(!f || !f.type.match('image.*')) return;

    var img = new Image;
    img.onload = () => {
      if(cfg.w || cfg.h)
        var im = img.generateThumb(cfg.w || (cfg.h*4/3), cfg.h || (cfg.w*3/4), function(data){
          ws.upload(data, function(r){
            r?cfg.cb(r):cfg.err();
          });
        });
      else
        ws.upload(f, function(r){
          r?cfg.cb(r):cfg.err();
        });
    };
    img.src = URL.createObjectURL(f);

    this.value = '';
  });

  return this;
};


$.fn.hideIf = function(so){
	return this.each(function(){
		if(so)
			$(this).hide();
	});
}


$.fn.hidea = function(ev){
  console.trace();
}

$.fn.showIf = function(so){
	return this.each(function(){
		$(this)[so?'show':'hide']();
	});
}

/*
$.fn.classIf = function(cl, so){
	return this.each(function(){
		$(this)[so?'addClass':'removeClass'](cl);
	});
}
*/

var $uploaders = $('<div>', {id: 'uploaders'});
$(ev => {
	$uploaders.appendTo(document.body);
});

$.fn.click2ipfs = function(conf){
	var cfg = {
		multi: false,
		onlyImg: false
	};

	if(typeof conf == 'function')
		cfg.onComplete = conf;
	else
 		$.extend(cfg, conf);

	var n = 0,
		 queue = [],
		 uploading = false;

	var upload = function(){
		if(uploading || !queue.length){
			if(typeof cfg.onFinish == 'function')
				cfg.onFinish(n);
			return;
		}

		var f = queue.shift();
		uploading = true;

	    //const fileStream = fileReaderPullStream(f)
		var reader = new FileReader();
		reader.onload = ev => {
		    ipfs.add(Buffer.from(ev.target.result), (err, h) => {
		    	let hash;
		    	if(typeof h == 'string') hash = h;
		    	else if(typeof h == 'object' && h.length) hash = h[0].hash;
		    	else return;

		        n++;
		        if(!err && hash){
			        if(typeof cfg.onComplete == 'function')
			          cfg.onComplete(hash);

			    };

		        uploading = false;
		        upload();
		      }, {
		        name: f.name,
		        type: f.type,
		    });
		};
		reader.readAsArrayBuffer(f);
	};

	return this.each(function(){
		interact(this).on('tap', ev => {
			fileDialog().then(files => {
				console.log(files);
				if(typeof cfg.onStart == 'function')
					cfg.onStart();

				for(var i = 0, f; f = files[i]; i++){
					if(cfg.onlyImg && !f.type.match('image.*')) continue;
					queue.push(f);
				}
				upload();
			});
		});
	});
};

$.fn.upl = function(conf){
	var cfg = {
		multi: false,
		onlyImg: false,
	};

	$.extend(cfg, conf);

	var n = 0,
		queue = [],
		uploading = false;

	var upload = function(){
		if(uploading || !queue.length){
			if(typeof cfg.onFinish == 'function')
				cfg.onFinish(n);
			return;
		}

		var f = queue.shift();
		uploading = true;

		if(cfg.uploader){
			cfg.uploader(f).then(r => {
				moveOn();
			});
		}
		else
			ws.upload(f, r => {
		      moveOn();
		    }, {
		      name: f.name,
		      type: f.type,
		    });
	};

	var moveOn = function(){
		n++;
		if(typeof cfg.onComplete == 'function')
			cfg.onComplete(r);

		uploading = false;
		upload();
	};

	return this.each(function(){
		var $upl = $("<input type='file' name='file'/>").appendTo($uploaders);
		if(cfg.multi)
			$upl.attr('multiple', true);

		$upl.bind('change', function(evt){
			evt.preventDefault();

			if(typeof cfg.onStart == 'function')
				cfg.onStart();

			var files = (evt.target.files || evt.dataTransfer.files);
			if(!files) return false;

			for (var i = 0, f; f = files[i]; i++){
				if(cfg.onlyImg && !f.type.match('image.*')) continue;
				queue.push(f);
			}
			this.value = '';
			upload();
		});

		$(this).click(ev => {
			console.log(ev);
			$upl.click();
		});
	});
};

$.fn.blink = function(cls, time, cb){
	cls = cls || 'wrong';
	time = time || 1200;
	var $el = this.addClass(cls);
	setTimeout(function(){
		$el.removeClass(cls);
		if(cb)cb();
	},time);
	return this;
};


$(document).scroll(function(){
	$('.fcs').removeClass('fcs');
	$('.tip').hide();
});

function parseQS(queryString){
	var params = {}, queries, temp, i, l;
	if(!queryString || !queryString.split('?')[1]) return {};
	queries = queryString.split('?')[1].split("&");

	for(i = 0, l = queries.length; i < l; i++){
		temp = queries[i].split('=');
		params[temp[0]] = temp[1];
	}

	return params;
};


$.fn.bindEnter = function(fn){
	var el = this;
	this.bind('keyup', function(e){
		if(e.keyCode==13){
			if(fn) fn.call(this);
			else $(this).blur();
		}
	});
	return this;
};

(function(){
	function createHandler(divisor,noun,restOfString){
		return function(diff){
			var n = Math.floor(diff/divisor);
			var pluralizedNoun = noun + ( n > 1 ? '' : '' );
			return "" + n + "" + pluralizedNoun + " " + restOfString;
		}
	}

	var formatters = [
		{ threshold: -31535999, handler: createHandler(-31536000,	"year",     "from now" ) },
		{ threshold: -2591999, 	handler: createHandler(-2592000,  	"month",    "from now" ) },
		{ threshold: -604799,  	handler: createHandler(-604800,   	"week",     "from now" ) },
		{ threshold: -172799,   handler: createHandler(-86400,    	"day",      "from now" ) },
		{ threshold: -86399,   	handler: function(){ return      	"tomorrow" } },
		{ threshold: -3599,    	handler: createHandler(-3600,     	"hour",     "from now" ) },
		{ threshold: -59,     	handler: createHandler(-60,       	"minute",   "from now" ) },
		{ threshold: -0.9999,   handler: createHandler(-1,			"second",   "from now" ) },
		{ threshold: 55,       	handler: function(){ return      	"Just now" } },
	//	{ threshold: 60,       	handler: createHandler(1,        	"s",	"ago" ) },
		{ threshold: 3600,     	handler: createHandler(60,       	"m",	"ago" ) },
		{ threshold: 86400,    	handler: createHandler(3600,     	"hr",     "ago" ) },
	//	{ threshold: 172800,   	handler: function(){ return      	"Yesterday" } },
		{ threshold: 604800,   	handler: createHandler(86400,    	"d",      "ago" ) },
		{ threshold: 2592000,  	handler: createHandler(604800,   	"wk",     "ago" ) },
		{ threshold: 31536000, 	handler: createHandler(2592000,  	"mth",    "ago" ) },
		{ threshold: Infinity, 	handler: createHandler(31536000, 	"yr",     "ago" ) }
	];

	Date.prototype.pretty = function(){
		var diff = (((new Date()).getTime() - this.getTime()) / 1000);
		for( var i=0; i<formatters.length; i++ ){
			if( diff < formatters[i].threshold ){
				return formatters[i].handler(diff);
			}
		}
		throw new Error("exhausted all formatter options, none found"); //should never be reached
	}
})();




$.fn.slider = function(conf){
	$(this).each(function(){
		var $slider = $(this),
			limit = $slider.outerWidth() - $slider.children('.sl').outerWidth() - 3;
		$slider.data('prec', ($slider.children('.sl').position().left-1) / (limit - 1))
		.children('.sl').drag("start", function(ev,dd){
			dd.limit = $(this).parent().outerWidth() - $(this).outerWidth() - 3;
			dd.fp = this.offsetLeft;
		}).drag(function(ev,dd){
			var l = Math.min(dd.limit, Math.max(1, dd.fp + dd.deltaX));
			this.style.left = l+'px';
			$(this).parent().data('prec', (l-1) / (dd.limit - 1));

			console.log(l);
		});
		console.log($slider.children('.sl').position().left);
	});
};


$.fn.cc = function(c, speed){
	if(!speed) speed = 600;
	if(c)
		this.data('_c', c).each(function(){
			var $el = $(this);
			if($(this).data('_cc')) clearInterval($(this).data('_cc'));
			$el.data('_cc',setInterval(function(){$el.toggleClass(c);},speed));
		});
	else this.each(function(){
		if($(this).data('_cc')){
			$(this).removeClass($(this).data('_c'));
			clearInterval($(this).data('_cc'));
			$(this).data({_c: null, _cc:null});
		}
	});
	return this;
};


jQuery.extend({
  query: function(path, data, callback){
		//var url = Cfg.api.replace(/^\/|\/$/g, '') + '/' + path.replace(/^\/|\/$/g, '');
    var url = path;
    console.log(url);
		return jQuery.ajax({url,
			type: "POST",
			data: JSON.stringify(data),
			success: callback,
			dataType: "json",
			contentType: "application/json",
			processData: false
		});
	},

	disableSelection: function(){
		return this.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
	},

	sort: function(comp){
		Array.prototype.sort.call(this, comp).each(function(){
			this.parentElement.appendChild(this);
		});
		return this;
	},
});

function checkEmail(email){
	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
	return emailPattern.test(email);
}

$.fn.err = function(msg){
	if(msg){
		$(this).addClass('err').one('focus', function(){
      $(this).removeClass('err').removeAttr('title');
    });

		if(typeof msg == 'string') $(this).attr('title', msg);
	}
	else if($(this).hasClass('err'))$(this).removeClass('err').removeAttr('title');
	return this;
}

$.fn.date = function(time){
	var date = new Date(time);
	var $t = this;

	var intr = $t.data('_interval');
	if(intr) clearInterval(intr)

	var upd = function(){
		$t.text(date.pretty());
	}
	$t.data('_interval', setInterval(upd, 60000));
	upd();

	return $t;
}


CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight, df) {
    var lines = text.split("\n");

    for (var i = 0; i < lines.length; i++) {

        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                if(!df) this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        if(!df) this.fillText(line, x, y);
        y += lineHeight;
    }
    return y;
}
