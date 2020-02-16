import {DB_promise} from '../../src/services/db.js';
import {upload} from '../../src/services/upload.js';
import account from '../../src/account.js';

console.log(upload);

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

      <link rel="stylesheet" href="//${Cfg.server}/design/components/fractal-gallery.css">

      <style>
        :host([view='fill']) #list, :host([view='carousel']) #list{
          display: flex;
          white-space: nowrap;
          overflow: auto;
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
    `;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = element.template;

	this.includeAdd();

    var list = this.select('#list');
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
		
		this.upload(files, before);

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
  	if(this.link) return;

	this.link = Link(src);
	
	if(this.link)this.link.children(links => {
		this.placeLinks(links);

		this.link.checkOwner(own => {
			if(!own) return;

			this.includeAdd();
		});
	});
  }


  static get observedAttributes(){
    return ['src', 'view'];
  }

  attributeChangedCallback(name, oldValue, value){
    switch(name){
      case 'src':
      	if(oldValue == 'toCreate' && value){
			this.link = Link(value);
      		this.saveOrder();
      	} 
		else this.load(value);
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

  upload(files, before, cb){
	upload(files).then(link => {
		this.append(link, before);
		this.saveOrder();

		if(cb) cb(link);
	});
  }

  save2IDB(data){
  	DB_promise.then(db => {
		console.log(db);
		var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
	});
  }

  append(link, before){
  	console.log(link, before);
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

        ok();
      });
    });
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
