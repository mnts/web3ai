import Axon from '../neuro/Axon.js';
import User from '../../src/acc/User.js';
import Link from '../data/Link.js';

import {U} from '/src/acc/users.js';


import {upload} from '/src/services/upload.js';

import {find2define} from '/src/services/components.js';

var url = new URL(import.meta.url);

const J = NPM.urljoin;

export default class Account extends HTMLElement{
  static get is(){
    return 'fractal-account';
  }

  static get template(){
    return `
    <style>
      #title{
        flex-grow: 1;
        font-size: 24px;
        margin: auto;
      } 

      [hidden]{
      	isplay: none;
      }

    </style>

    <link rel="stylesheet" href="//${url.host}/design/interface.css" rel="preload" as="style">
    <link rel="stylesheet" href="//${url.host}/design/tree.css" rel="preload" as="style">
    <link rel="stylesheet" href="//${url.host}/design/socAuth.css">
    <link rel="stylesheet" href="//${url.host}/design/components/fractal-account.css" rel="preload" as="style">    
    <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    <link rel="stylesheet" href="//${url.host}/design/components/fractal-gallery.css" rel="preload" as="style">    

    <link id='style_src' rel="stylesheet">
	
    <style>
		.tree menu{
			display: none;
		}
    </style>

	<button id='logout' title='Log out from your account'>
		<i class="fas fa-sign-out-alt"></i>
	</button>

    <main>
    	<div id='avatar'>
    		<pineal-gallery id='avatar-images' view='fill' style_src="//${url.host}/design/components/avatarImages.css">
    		</pineal-gallery>
			
			<button id='avatar-upload' title='Upload photo'>
				<i class="fas fa-upload"></i>
			</button>
    	</div>
    	
		<input id='account-title' placeholder='${Lang.acc.title}'></input>
		<div contenteditable id='account-description' placeholder='About me'></div>

		<h3 id='account-email'></h3>

        ${Cfg.acc.email_confirm?`
		    <div id='account-email-confirm' hidden>${Lang.acc.confirm_email}</div>
		`:''}

		<a id='resetPassword'>Reset your password</a>
           
        ${Cfg.acc.profile_page?`
			<div id='account-domain'>
				<a id='account-url' target='_blank'></a>
			</div>
			<div id='setname'>
				<input name='accountname' placeholder='username' size='12' title='Setup your username'>
				<button id='setname-save'>&#x2714;</button>
			</div>`:''
        }
        
        ${(Cfg.acc.intro_video)?`
            <fractal-media id='intro_video' class='fill'></fractal-media>
			<button id='intro_video-remove'>
				<i class='fa fa-trash'></i>
			 </button>
			<button id='intro_video-upload' class='only_publisher'>
				<i class='fa fa-upload'></i>
				${Lang.acc.become_publisher}
			 </button>
			`:
            ''
        }
        
        <p>
        	Registred 
        	<relative-time id='info-when'></relative-time>
		</p>

        ${Cfg.acc.currency?`
		    <h3 id='value' title='${Cfg.acc.currency.title}'>0</h3>
        `:''}

		<div id='extra'></div>
		
		<h4>${Lang.acc.add_social}</h4>
          <pineal-networks></pineal-networks>
		<slot></slot>
    </main>
    `;
   }

    auth(email){
		return new Promise((ok, no) => {
			if(this.user) return ok(this.user);
			
			var user = this.user = U(email);
			user.load(() => {
				this.axon = this.user.axon;

				this.axon.link.load(item => {
					if(!item) return this.createNode(item => {
						ok(this.user);
					});
					ok(this.user);
					
					this.fill();
				});
			});
		});
	}
	

	createNode(cb){
		this.axon.link.save({
			owner: this.user.email,
			title: this.user.title
		}).then(item => {
			this.user.item = item;
			/*
			this.ws.send({
				cmd: 'updateProfile',
				set: {
					src: this.axon.link.url
				}
			}, user => {
				this.fill(item);
			});
			*/
            cb(item);
			this.fill();
		});
	}

	own(what){
		return new Promise((ok, no) => {
			if(what instanceof Axon){

			}
			else
			if(what instanceof Link){

			}
			else
			if(typeof what == 'object'){
				let item = what;
				if(item.owner) this.isOwner(item.owner)?ok():no();
				else no();
			}
		});
	}

	isOwner(item_owner){
		if(item_owner == this.user.email) return true;
		if(item_owner == this.user.name) return true;
		return false;
	}

	gate(){
	    if(!this.user){
	    	$('#account-icon').click();
	    	return true;
	    }
	}

	preload(){
		return new Promise((ok, no) => {
			this.axon.link.children(links => {
				var left = links.length;
				if(!left) return ok({});
				let items = {};
				links.map(link => {
					link.load(item => {
						left--;
						items[item.name] = item;
						if(item.name == 'profile_photos')
							this.turn_profile_photos(link);
						if(!left) ok(items);
					});
				});
			});
		});
	}

	turn_profile_photos(link){
		link.load(item => {
			this.links[item.name] = link;
			var images = this.select('#avatar-images');
			images.setAttribute('src', link.url);
			setTimeout(ev => {
				let list = images.select('#list');
				list.scroll(9999, 0);
			}, 900);
		});
	}
	
	init_profile_photos(){
		var newItem = {
			type: 'gallery',
			name: 'profile_photos',
			title: 'Profile photos',
			owner: this.user.email
		};

		let col = 'tree';
			this.ws.send({
				cmd: 'save', 
				item: newItem, 
				collection: col
			}, r => {
			console.log(r);
			if(!r || !r.item) return console.error(`
				unable to init_profile_photos
			`);

			let link = Link(`mongo://${location.host}/${col}#${r.item.id}`);
			
			this.axon.link.add(link).then(link => {
				this.turn_profile_photos(link);
			});			
		});
	}

	upload_intro_video(){
	}

    async fill(item){
    	if(!item) item = this.user.item;

        this.ws.send({
			cmd: 'locate' 
		});

    	this.main.hidden = false;
    	var email = item.email || this.user.email;
		
		this.preload().then(items => {
			if(!items.profile_photos)
				this.init_profile_photos();
		});

    	this.select('#account-title').value = item.title || '';
    	if(this.user.regTime){
    		let dt = (new Date(this.user.regTime)).toISOString()
    		this.select('#info-when').setAttribute('datetime', dt);
    	}

    	this.select('#account-description').textContent = item.description || '';
        
    	this.select('#account-email').innerText = email;
        
		if(Cfg.acc.email_confirm){
    	    let confirm_el = this.select('#account-email-confirm');
    	    if(confirm_el) confirm_el.hidden = this.user.email_confirmed;
		}

    	var acc_link = Link(`mongo://${Cfg.server}/acc?email=`+this.user.email);

        var extra = '';

		if(Cfg.acc.account_src)
            extra +=`
                <h4>Account properties</h4>
	    		<pineal-tree 
	    			src='${Cfg.acc.account_src}' 
	    			item_src='${acc_link.url}'
	    		></pineal-tree>
	    	`;

		 if(Cfg.acc.tree_src)
	    	extra += `
	    		<h4>Profile properties</h4>
	    		<pineal-tree 
	    			src='${Cfg.acc.tree_src}' 
	    			item_src='${this.axon.link.url}'
	    		></pineal-tree>
	    	`;

	    this.select('#extra').innerHTML = extra;

        if(item.intro_video){
    		let intr = this.select('#intro_video');
    		if(intr) intr.setAttribute('src', item.intro_video);
        }

        if(Cfg.acc.currency)
			this.user.getValue().then(value => {
				this.select('#value').innerText = value;
			});

        if(Cfg.acc.profile_page)
		    this.checkName();

		this.selectAll('.only_publisher').map(el => {
			el.hidden = this.user.type != 'publisher';
		});
    }

    checkName(){
    	var name = this.user.name;

	   	const url_el = this.select('#account-url');
	   	if(!url_el) return;

	   	url_el.href = this.user.href;
	   	this.select('#account-url').innerText = this.user.href;
	   	
	   	this.select('#setname').hidden = !!(name);
	}

    fillAvatar(item){

    }

    clean(){

    }

	constructor() {
		super();

		this.server = Cfg.server;

		this.attachShadow({ mode: 'open' });
		// this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
		this.shadowRoot.innerHTML = this.constructor.template;

		this.links = [];

		this.init();
	}


	async init(){
		var width;
		var that = this;
	
		this.main = this.select("main");
		this.main.hidden = true;

	    this.select('#logout').addEventListener('click', ev => {
		  this.ws.send({
			cmd: 'logout'
		  });

		  document.body.dispatchEvent(new CustomEvent('logout'));	
			window.location.href = window.location.href;
		});

		if(document.location.hash.substr(1).indexOf('confirm=') === 0){
			var code = document.location.hash.split('=')[1];
			let ws = await servers.connect(Cfg.api);
			ws.send({
				cmd: 'confirmEmail',
				code
			} , r => {
				document.location.hash = '';
				if(r.done){
					this.select('#account-email-confirm').hidden = true;
					alert('Your email address was confirmed');
				}
				else alert('Wrong email confirmation key');
			});
		};

		this.select("#account-title")
    	.addEventListener("focusout", ev => {
			ev.preventDefault();
			//if(ev.keyCode === 13){
				this.axon.link.set('title', ev.target.value);
			//}
		});


		var desc = this.select("#account-description")
		desc.addEventListener("focusout", ev => {
			ev.preventDefault();
			this.axon.link.set('description', desc.textContent);
		});

		this.select('#avatar-upload').addEventListener('click', ev => {
			var images = this.select('#avatar-images');
			fileDialog().then(files => {
				let before = this.select('#avatar-images > fractal-media:first-of-type');
				this.select('#avatar-images').upload(files, before, link => {
					this.axon.link.set('image', link.url);

					setTimeout(e => {
						let list = images.select('#list');
						list.scroll(9999, 0);
					}, 600);
				});
			});
		});

        if(Cfg.acc.intro_video){
			this.select('#intro_video-upload').addEventListener('click', ev => {
				fileDialog().then(files => {
					upload(files).then(link => {
						this.axon.link.set('intro_video', link.url);
						this.select('#intro_video').setAttribute('src', link.url);
					});
				});
			});

			this.select('#intro_video-remove').addEventListener('click', ev => {
				this.axon.link.set('intro_video', false);
				this.select('#intro_video').removeAttribute('src');
			});
        }

        if(Cfg.acc.profile_page){
			this.select('#setname-save').addEventListener('click', ev => {
				let inpName = this.select('[name=accountname]');
				name = inpName.value;

				inpName.classList[(name.length < 4)?'add':'remove']('err');

				if(!inpName.classList.contains('err')){
					this.ws.send({
						cmd: 'updateProfile',
						set: {name}
					}, r => {
						if(!r.user) return;

						this.user.name = r.user.name;
						this.checkName();
						//this.fill(item);
					});
				};
			});
        }

		this.select('#resetPassword').addEventListener('click', ev => {
			let tag = 'fractal-password';
			var password_el = this.select(tag);
			if(password_el)
				password_el.hidden = !password_el.hidden;
			else{
				password_el = document.createElement(tag);
				ev.target.parentNode.insertBefore(password_el, ev.target.nextSibling);
				find2define(this.shadowRoot);
			}

			ev.preventDefault();
			return false;
		});

		this.check_style_src();
	}

	check_style_src(){
		this.style_src = this.getAttribute('style_src');
		if(this.style_src)
			this.select('#style_src').setAttribute('href', this.style_src);
	}

	static get observedAttributes(){
	    return ['style_src'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		switch(name){
		  case 'style_src':
			this.check_style_src();
		}
	}

	connectedCallback(){
	}

	select(qs){
		return this.shadowRoot.querySelector(qs);
	}

	selectAll(qs){
		return Array.prototype.slice.call(
			this.shadowRoot.querySelectorAll(qs)
		);
	}
	
	constructora(user){
		this.user = user;
		var u = document.createElement("pineal-user");
		u.setAttribute("id", "account-icon");
		u.classList.add("acc");
		document.querySelector('fractal-head').appendChild(u);
	}
}


window.customElements.define(Account.is, Account);