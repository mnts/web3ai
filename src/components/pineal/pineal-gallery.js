import {DB_promise} from '/src/services/db.js';
import {upload} from '/src/services/upload.js';
import account from '/src/account.js';
import Link from '../../data/Link.js';

const url = new URL(import.meta.url);


class element extends HTMLElement{
  static get is(){
    return 'pineal-gallery';
  }

  static get template(){
    return`
      <style>
        main{
          display: block;
        }

        :host{
          display: block;
        }


        @media screen and (max-width: 1400px){
          pineal-item {
            awidth: calc(50% - 20px);
          }
        }
      </style>

      <link rel="stylesheet" href="//${url.host}/design/components/fractal-gallery.css">

      <style>
        :host([view='fill']) #list, :host([view='carousel']) #list{
          display: block;
          white-space: nowrap;
          overflow: auto;
          overflow-y: hidden;
        }

        
        :host([view='fill']) ::slotted(*), :host([view='carousel']) ::slotted(*){
          margin-bottom: 1px;
          height: calc(100% - 3px);
          width: unset;
        }


        :host([view='fill']) ::slotted(*){
        	width: 100%;
        }
      </style>

      <div id='list'>
      </div>

      <div id='extra'></div>
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;

    var list = this.select('#list');
    list.component = this;
    list.addEventListener('drop', ev => {
        var before;
        for(var i=0; i<ev.composedPath().length; i++){
          let node = ev.composedPath()[i];
          if(node === list) break;
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
  }

  connectedCallback(){
	const src = this.getAttribute('src');
	if(src)	this.load(src);
  }

  load(src){
  	if(src == 'toCreate') return;
	this.link = Link(src);
	
	if(this.link)this.link.children(links => {
		this.placeLinks(links);

		this.link.checkOwnership(own => {
			if(!own) return;

			this.includeAdd();
		});
	});
  }


  static get observedAttributes(){
    return ['src', 'view', 'style_src'];
  }

  attributeChangedCallback(name, oldValue, value){
    switch(name){
      case 'src':
      	//if(value == 'toCreate') this.includeAdd();
      	
      	if(oldValue == 'toCreate' && value){
			this.link = Link(value);
      		this.saveOrder();
      	}

      	this.load(value);
        break;


      case 'style_src':
      	let node = document.createElement("link");
      	node.rel = "stylesheet";
      	node.href= value;

      	this.select('#extra').appendChild(node);
		break;

      case 'view':
        this.changeView();
        break;
    }
  }

  changeView(){
  	var fill = (this.getAttribute('view') == 'fill');
	this.selectAll('.item').map(el => {
		el.classList[fill?'add':'remove']('fill');
	});
  }

  drop_url(url, before){
  	var item = {
		src: url,
		id: Math.random().toString(30).substring(8)
  	};

  	var link = Link(`mongo://${Cfg.server}/files#${item.id}`);
  	link.save(item).then(item => {
		this.append(link, before).then(() => {
			this.saveOrder();	
		});
  	});
  }
	
  upload(files, before, cb){
	upload(files).then(link => {
		setTimeout(t => {
			this.append(link, before).then(() => {
				this.dispatchEvent(new CustomEvent("upload", {
				  detail: {link},
				  bubbles: true,
				  cancelable: false,
				  composed: true
				}));

				this.saveOrder();

				if(cb) cb(link);
			});
		}, 1600);
	});
  }

  save2IDB(data){
  	DB_promise.then(db => {
		console.log(db);
		var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
	});
  }

  append(link, before){
    let div = document.createElement('div');
    
    var list = this.select('#list');

    var upl = this.select('#upload');

    var fill = (this.getAttribute('view') == 'fill');

    
    if(before === true) list.insertBefore(div, list.firstChild);
    else if(before instanceof HTMLElement) list.insertBefore(div, before);
    else upl?list.insertBefore(div, upl):list.appendChild(div);
    
    return new Promise((ok, no) => {
      link.load(item => {
        if(!item) return div.remove();
        let $item = $('<fractal-media>', {
          src: link.url
        });
		
		if(fill) $item[0].classList.add('fill');
		
		$item[0].classList.add('item');
        
        $(div).replaceWith($item);

        ok($item[0]);
      });
    });
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
  
  saveOrder(){
  	if(!this.link) return;

    var links = [];

    var list = this.select('#list');
    
    for(let i = 0; i<list.children.length; i++){
        let node = list.children[i];
        
        links.push(node.link);
    }

    this.link.order(links);
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
  	if(this.classList.contains('no_add')) return;

  	if(this.select('#upload')) return false;
  	
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

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  selectAll(qs){
  	return Array.prototype.slice.call(
		this.shadowRoot.querySelectorAll(qs)
	);
  }
};


window.customElements.define(element.is, element);
