//import {styleSheets} from '../styling.js';
import {fix4name} from '../../utilities/item.js';
import servers from '../../data/servers.js';
var url = new URL(import.meta.url);

import Link from '/src/data/Link.js';

class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-footer';
  }

  static get template(){
    return`
	<style>
		footer{display: none;}

		#head-socMedia{
			/* width: 90px; */
			display: inline-block;
			vertical-align: middle;
			margin-left: 18px;
		}


		#head-socMedia > a{
			width: 32px;
			height: 32px;
			font-size: 32px;
			margin: 4px 6px;
			color: white;
			cursor: pointer;
			display: inline-block;
			transition: color .5s;
		}

		#auth-facebook:hover{
			color: #3b5999;
		}

		#auth-instagram:hover{
			color: #e4405f;
		}

		#auth-twitter:hover{
			color: #55acee;
		}

		a#startTour{
			font-size: 14px;
			text-decoration: none;
			color: #b9b9b9;
		}

    </style>

	<link rel="stylesheet" href="/style/stylesheet.css">
   	<link href='//${url.host}/design/tree.css' rel="stylesheet"/>
	<link rel="stylesheet" href="/style/footer.css">

	<link rel="stylesheet" href="https://${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

	<footer>
		<div id="footer-main">
		</div>
		<div class="footer-bottom">
			<div class="left">
				<span id='footer-intro'></span>
				<div id="head-socMedia">
				  <a id="auth-facebook" href='https://www.facebook.com/ilunafriq' target='_blank'>
					  <i class="fab fa-facebook"></i>
				  </a>

				  <a id="auth-instagram" href='https://www.instagram.com/ilunafriq/' target='_blank'>
					  <i class="fab fa-instagram"></i>
				  </a>

				  <a id="auth-twitter" href='https://twitter.com/ilunafriq' target='_blank'>
					  <i class="fab fa-twitter"></i>
				  </a>
				</div>
			</div>

			<div class="right" id='footer-right'></div>
		</div>		
	</footer>
    `;
  }

  construct(url){
  	let lnk = Link(url);
  	
  	lnk.load(item => {
  		if(!item) return false;
		this.select('#footer-intro').innerText = item.description;
  	});

  	lnk.children(links => links.forEach(link => {
		link.load(item => {
			if(!item) return false;
			
			if(item.name == 'foots'){
				this.select('#footer-right').innerHTML = `
					<pineal-tree src='${link.url}'></pineal-tree>
				`;
			}
			else
			if(item.name == 'blocks') link.children(links => {
				let main = this.select('#footer-main');
				main.innerHTML = '';
				links.forEach(link => link.load(item => {
					if(!item) return false;
					
					let block = document.createElement('div');
					block.classList.add('col');
					main.appendChild(block);

					let h = document.createElement('h1');
					h.innerText = item.title || item.name || '#'+item.id;
					block.appendChild(h);

					let container = document.createElement('div');
					container.classList.add('container');
					block.appendChild(container);
					console.log(block, container);

					if(item.type == 'source' || item.type == 'text')
						link.download(cont => {
							container.innerHTML = new TextDecoder("utf-8").decode(cont);
						});
					else
					if(item.type == 'folder')
						container.innerHTML = `<pineal-tree 
							src='${link.url}'
						></pineal-tree>`;
				}));
			});
		});
	}));
  }

  checkUrl(){
  	  var p = location.pathname.split('/');
  	  if(!p[1]) return;

      var a = this.select(`li[name='${p[1]}'] a`);
      if(a) a.click();
  }


  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
    //this.construct();
  }

  init(){
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;
    
    this.select('footer').addEventListener('click_node', ev => {
    	const node = ev.detail.node;
    	console.log(node);
        history.replaceState({item: node.item}, node.item.title, "/"+node.item.name)
		document.getElementById('head').open(node);
	});

	this.select('footer').addEventListener('children_loaded', ev => {
        this.checkUrl();
	});

    this.server = Cfg.server;

    this.main_body = document.body;

   	this.domain_link = Link('mongo://');
  }

  static get observedAttributes(){
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.construct(newValue);
        break;
    }
  }


  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);