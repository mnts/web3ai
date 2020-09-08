import {DB_promise} from '../../src/services/db.js';
import {upload} from '../../src/services/upload.js';
import account from '../../src/account.js';
import servers from '../../src/data/servers.js';
import gun from '../../src/data/gun.js';
import pix8_item from './pix8-item.js';

import { LitElement, html, css } from "../../node_mod/lit-element/lit-element.js";
const extend = NPM.extend;

const url = new URL(import.meta.url);


class element extends LitElement{
  static get is(){
    return 'pix8-carousel';
  }

  static get styles(){
    return [css`
        main{
          display: block;
        }

        :host{
          display: block;
          width: 100vw;
          height: 128px;
          position: relative;
          overflow: hidden;
        }

        #list{
			display: flex;
			flex-wrap: nowrap;
			height: 100%;
			width: 100%;
			overflow: auto;
			grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
			xscroll-snap-type: x mandatory;
			overflow: auto;
		}

		#list > .item{
			margin: 0;
			padding: 0;
			border: 0;
			box-shadow: none;
		}

		::slotted(*){
			scroll-snap-align: start;
			vertical-align: middle;
		}

		::slotted(button:hover){
			opacity: 1;
		}

		::-webkit-scrollbar {
			height: 2px;
			background-color: transparent;
		}

		::-webkit-scrollbar-thumb {
			background-color: #9f9f9f80;
			border-radius: 5px;
		}
     `]
  }

	render(){
		console.log('render', this.view);
		return html`
		  <link rel="stylesheet" href="//${url.host}/design/components/pix8-carousel.css">

		  <div contentEditable id='name' @change='${this.changeName}'>${this.name}</div>
		  <div id='list'>
		  	<slot></slot>
		  </div>
		`;
	}

	constructor(){
		super();

		this.api = 'io.cx';
		this.view = {};
		this.links = {};
		this.list = [];
	}

	connectedCallback(){
		super.connectedCallback();
		console.log(this.name);
		//this.findView(this.name);


		if(!this.initiated)
			this.init();
	}

	init(){
		this.addEventListener('drop', ev => {
			console.log(ev)
			var before;
			for(var i=0; i<ev.composedPath().length; i++){
			  let node = ev.composedPath()[i];
			  if(node === this) break;
			  else if(
				node.classList && 
				node.classList.contains('item')
			  )
				before = node;
			};

			var files;
			if(ev.type == 'drop')
				files = ev.dataTransfer.files;
			

			if(files.length) return this.upload(files, before);

			var txt = ev.dataTransfer.getData('URL') || ev.dataTransfer.getData('Text');
			var url = this.getImgUrl(this.parseURL(txt));

			if(url) this.drop_url(url, before);

			ev.stopPropagation();
			ev.preventDefault();
			return false
		}, false);

		this.list_el = this.select('#list');

		var path = 'words/'+this.name
		this.gun = gun.path(path);
		this.gun.get('sub').map().on((d, key) => {
			console.log(d, key);
			var el = this.querySelector('pix8-item[name='+key+']');
			if(el) return;
			
			el = document.createElement('pix8-item');
			el.classList.add('item');
			if(d.src) el.setAttribute('src', d.src);
			el.setAttribute('name', key);
			this.appendChild(el);
			var prev = el.previousElementSibling;
			
			el.style.order = parseInt(prev?(prev.style.order || 0):0) + 1000;
		});

		this.gun.once(stuff => {
			if(stuff && stuff.sub) return;

			this.findView(this.name).then(view => {
				this.srcs(view).map(url => {
					let link = Link(url);
					this.get_io(link);
				});
			});
		});

		this.initiated = true;
	}

	drop_url(url, before){
		fetch(url).then(r => {
			r.arrayBuffer().then(arrBuf => {
				var buf = Buffer(arrBuf);
				
				ipfs.add(buf).then(r => {
					var stuff = {
						order: this.getOrder(before)
					};

					var item = stuff.item = {
						src: 'ipfs://'+r[0].hash,
						url
					};

					this.gun.get('sub').set(stuff);
				});
			});
		});
	}

	getOrder(before){
		var last = this.lastElementChild;
        return before?
        	(parseInt(before.style.order) - 10):
        	last?
        		(parseInt(last.style.order) + 500):
        		900;
	}


	upload(files, before, cb){
		upload(files).then(link => {
			var stuff = {
				order: this.getOrder(before)
			};
			let item = stuff.item = link.item;
			item.src = link.url;
			this.gun.get('sub').set(stuff);

			if(cb) cb(link);
		});
	}

	get_io(link){
		var num = this.num_io = (this.num_io || 0) + 1;

		console.log();
		link.load(item => {
			if(!item) return;
			var url = item.file?('https://f.io.cx/'+item.file):item.src;
			console.log(link, item);

			fetch(url).then(r => {
				r.arrayBuffer().then(arrBuf => {
					var buf = Buffer(arrBuf);

					ipfs.add(buf).then(r => {
						var stuff = {
							order: num * 1000
						};

						item.ipfs = r[0].hash;
						stuff.item = item;

						console.log(stuff);

						this.gun.get('sub').set(stuff);
					});
				});
			});
		});
	}

		// builds required element for carousel
	build(d){
		if(typeof d == 'string')
			d = {src: d};

		if(d.file && !d.src)
			d.src = Cfg.files+d.file

		var file = d.file;
		if(!file && d.src){
			if(d.src.indexOf(Cfg.files) === 0)
				file = d.src.substr(Cfg.files.length);
		}

		var url = d.src;
		var t = this,
			$thumb = $(document.createElement('span'));

		$thumb.data(d);
		console.log(d);
		$thumb.attr('title', d.id);

		if(d.src){
			var video = pix.parseVideoURL(d.src),
				vid = video.provider;
		}

		if(video && video.provider == 'youtube'){
			var thumb = 'http://img.youtube.com/vi/'+video.id+'/sddefault.jpg';

			var frame = document.createElement("iframe");
				frame.src = 'http://www.youtube.com/embed/'+video.id;
			$thumb.addClass('youtube').append(frame);
			$thumb.append("<div class='iframe-cover'></div>");
		}
		else
		// iframe from ggif website
		if(url && url.indexOf('ggif.co')+1){
			var p = url.replace('http://', '').split(/[\/]+/);
			//var thumb = 'http://'+p[0]+'/'+p[1]+'/'+p[1]+'.gif';

			var frame = document.createElement("iframe");
			frame.onload = function(){
				var $carousel = $thumb.parent();
				if($carousel.length){
					var carousel = $carousel[0].carousel;
					carousel.resize($thumb);
				}
			}
			frame.onerror = function(){
				$thumb.parent().children('span[href="'+url+'"]').remove();
				var $carousel = $thumb.parent();
				if($carousel.length)
					$carousel[0].expand();

				pix.cleanTargets();
			}
				//frame.width = h;
				//frame.height = h;
				frame.src = url.replace('http://', 'https://');
			$thumb.addClass('ggif').append(frame);
			$thumb.append("<div class='iframe-cover'></div>");
		}
		else
		if(file){
			$thumb.addClass('file');
			carousel.resize($thumb);
			$thumb.css({'background-image': "url("+Cfg.thumber+url.replace('://', '/')+")"});
			Pix.loadFile(file, $thumb);
		}
		else{
			var image = new Image;
			image.onload = function(){
				console.log(image.src);
				var $thumbs = $thumb.parent().children('span[href="'+url+'"]');
				$thumbs.css('background-image', '');

				var $carousel = $thumb.parent();
				if($carousel.length){
					var carousel = $carousel[0].carousel;
					carousel.resize($thumb);
				}
			}
			image.onerror = function(){
				var $thumbs = $thumb.parent().children('span[href="'+url+'"]');

				/*
				if(image.src.indexOf(Local.api)+1)
					return $thumbs.children('img').attr('src', thumb || url);
				*/

				$thumbs.remove();

				var $carousel = $thumb.parent();

				pix.cleanTargets();
			}

			var name = url.split(/(\\|\/)/g).pop();
			image.src = carousel.formatUrl(url);

			image.alt = thumb || url;

			$thumb.append(image);
		}

		$thumb.attr({
			href: d.href || url,
			name: 'item'+d.id
		});

		$thumb.addClass('thumb');

		if(d.text)
			pix.appendText(d.text, $thumb);

		$("<div class='n'></div>").appendTo($thumb).hide();

		pix.$items[d.id] = $thumb;

		return $thumb;
	}


	append(link, before){
		console.log(link, before);
		let div = document.createElement('div');

		var list = this;

		var upl = this.select('#upload');


		if(before === true) list.insertBefore(div, list.firstChild);
		else if(before instanceof HTMLElement) list.insertBefore(div, before);
		else upl?list.insertBefore(div, upl):list.appendChild(div);

		return new Promise((ok, no) => {
		  link.load(item => {
			if(!item) return div.remove();
			let $item = $('<pix8-item>', {
			  src: link.url
			});

			item.src = link.url;
			this.gun.get('sub').set(item);

			$item[0].classList.add('item');

			$(div).replaceWith($item);

			ok();
		  });
		});
	}

	saveOrder(){
		if(!this.link) return;

		var links = [];

		var list = this;

		for(let i = 0; i<list.children.length; i++){
			let node = list.children[i];

			links.push(node.link);
		}

		//this.link.order(links);
	}

	 static get properties() {
		return {
		  name: {
			type: String
		  }
		}
	  }



	// when slide its should have some momentum
	motion(amplitude){
		var carousel = this,
			list = this.select('#list');

		carousel.stop = 0;

		var timeConstant = 325,
			timestamp = Date.now();

		console.log(amplitude);

		var m = 0;
		function step(stamp){
			if(carousel.stop) return;// carousel.updateView();

			var elapsed = timestamp - Date.now();
			var delta = amplitude * Math.exp(elapsed / timeConstant);;
			list.scrollBy(delta, 0);
			m += delta;

			if(delta>0.7 || delta<-0.7)
				window.requestAnimationFrame(step);
			else{
				//carousel.updateView();
			}
		}

		window.requestAnimationFrame(step);
	}

	checkVideo(url){
		var video = this.parseVideoURL(url);

		if(video && video.provider == 'youtube'){
			var thumb = 'http://img.youtube.com/vi/'+video.id+'/sddefault.jpg';

			var frame = document.createElement("iframe");
				frame.src = 'http://www.youtube.com/embed/'+video.id;
			$thumb.addClass('youtube').append(frame);
			//$thumb.append("<div class='iframe-cover'></div>");

			return;
		}
	}
	
	//get exact path of real image.
	getImgUrl(url){
		if(url.indexOf('imgur.com')+1){
			var parts = url.replace(/^(https?|ftp):\/\//, '').split('/'),
				ext = ''+url.split('.').pop();

			if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext)+1)
				return url;

			return 'http://i.imgur.com/'+parts[1]+'.jpg';
		}
		else
		if(url.indexOf('upload.wikimedia.org')+1 && url.indexOf('/thumb/')+1){
			var urlA = url.split('/');
			urlA.pop();
			urlA.splice(urlA.indexOf('thumb'), 1);
			url = urlA.join('/');
		}

		return url;
	}

	parseURL(url){
		var qs = this.parseQS(decodeURIComponent(url));
		if(qs && qs.imgurl)
			url = qs.imgurl;

		return url;
	}

	parseQS(queryString){
		var params = {}, queries, temp, i, l;
		if(!queryString || !queryString.split('?')[1]) return {};
		queries = queryString.split('?')[1].split("&");

		for(i = 0, l = queries.length; i < l; i++){
			temp = queries[i].split('=');
			params[temp[0]] = temp[1];
		}

		return params;
	}

	// give an URL and return direct address to that video iframe
	parseVideoURL(url){
		if(typeof url !== 'string') return;
	 	function getParm(url, base){
		      var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
		      var matches = url.match(re);
		      if (matches) {
		          return(matches[2]);
		      } else {
		          return("");
		      }
		  }

		  var retVal = {};
		  var matches;
		  var success = false;

		  if(url.match('http(s)?://(www.)?youtube|youtu\.be') ){
		    if (url.match('embed')) { retVal.id = url.split(/embed\//)[1].split('"')[0]; }
		      else { retVal.id = url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
		      retVal.provider = "youtube";
		      var videoUrl = 'https://www.youtube.com/embed/' + retVal.id + '?rel=0';
		      success = true;
		  } else if (matches = url.match(/vimeo.com\/(\d+)/)) {
		      retVal.provider = "vimeo";
		      retVal.id = matches[1];
		      var videoUrl = 'http://player.vimeo.com/video/' + retVal.id;
		      success = true;
		  }

		 return retVal;
	}

	changeName(ev){
		var tag = this.select('#name').textContent;
		this.findView(tag);
	}

	findView(path){
		var q = {
			cmd: "get",
			filter: {
				path: path,
				owner: "dukecr",
				type: "view"
			},
			collection: "pix8"
		};
		
		console.log(q);
		return new Promise( (ok, no) => {
			servers.connect(this.api).then(ws => {
				this.ws = ws;
				ws.send(q, async r => {
					if(r.item)
						ok(r.item);
					else
						no();
				});
			});
		});
	}

	laydown(){
		var frag = new DocumentFragment();
		this.srcs().map(src => {
			let el = document.createElement('pix8-item');
			el.classList.add('item');
			el.setAttribute('src', src);
			frag.appendChild(el);
		});
		return frag;
	}
	
	srcs(view){
		return (view.items || this.view.items || []).map(id => ('mongo://io.cx/pix8#'+id));
	}


	loadItems(){
		var q = {
			cmd: 'load',
			filter: {
				id: {$in: ids}
			},
			collection: 'pix8'
		};

		var srcs = this.generateLinks();


		servers.connect(this.api).then(ws => {
			ws.send(q, r => {
				(r.items || []).map(item => {
					this.links[item.id].item = item;
				});
			});
		});
	}


  scroll(by){
  	if(!by) return this.select('#list').scrollLeft;
  	this.select('#list').scrollLeft = by;
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
  
  saveOrder(){
    var links = [];

    var list = this.select('#list');
    
    for(let i = 0; i<list.children.length; i++){
        let node = list.children[i];
        
        links.push(node.link);
    }

    //this.link.order(links);
  }

  placeLinks(links){
    var list = this.select('#list');;

    while(list.firstChild){
      list.removeChild(list.firstChild);
    };

    links.forEach(link => this.append(link));
	
	//if(this.getAttribute('view') != 'fill')
  }

  includeAdd(){  		
	var upl = document.createElement('button');
	upl.id = 'upload';
	upl.textContent = '+';
	this.select('#list').appendChild(upl);

	upl.addEventListener('click', ev => {
		fileDialog().then(files => {
			console.log(files);
			this.upload(files, upl);
		});
	});
  }
};


window.customElements.define(element.is, element);
