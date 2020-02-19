import Axon from '../neuro/Axon.js';
import User from '../../src/acc/User.js';

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

    </style>

    <link rel="stylesheet" href="//${url.host}/design/interface.css" rel="preload" as="style">
    <link rel="stylesheet" href="//${url.host}/design/tree.css" rel="preload" as="style">
    <link rel="stylesheet" href="//${url.host}/design/components/fractal-account.css" rel="preload" as="style">    
    <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">
    <link rel="stylesheet" href="//${url.host}/design/components/fractal-gallery.css" rel="preload" as="style">    

	
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
    	
		<input id='account-title' placeholder='First and Last name'></input>
		<div contenteditable id='account-description' placeholder='About me'></div>

		<h3 id='account-email'></h3>
		<div id='account-email-confirm' hidden>You need to confirm your email</div>

		<a id='resetPassword'>Reset your password</a>

		<div id='account-domain'>
			<a id='account-url' target='_blank'></a>
		</div>
		
		<div id='setname'>
			<input name='accountname' placeholder='username' size='12' title='Setup your username'>
			<button id='setname-save'>&#x2714;</button>
		</div>
        
        <p>
        	Registered 
        	<relative-time id='info-when'></relative-time>
		</p>

		<h3 id='value' title='Seeds'>0</h3>

		<div id='extra'></div>
		
		<div id='account-networks'>
		<slot></slot>
    </main>
    `;
   }

    auth(email){
		return new Promise((ok, no) => {
			if(this.user) return ok(this.user);
			
			var user = this.user = new User(email);
			user.load(() => {
				this.axon = this.user.axon;

				this.axon.link.load(item => {
					if(!item) return this.createNode();
					this.fill();
					
					ok(this.user);
				});
			});
		});
	}
	

	createNode(){
		this.axon.link.save({
			owner: this.user.email,
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

    async fill(item){
    	if(!item) item = this.user.item;

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
    	this.select('#account-email-confirm').hidden = this.user.email_confirmed;

    	var acc_link = Link(`mongo://${Cfg.server}/acc?email=`+this.user.email);

		if(Cfg.acc && Cfg.registration.tree_src && Cfg.acc.tree_src)
	    	this.select('#extra').innerHTML = `
	    		<h4>Account properties</h4>
	    		<pineal-tree 
	    			src='${Cfg.registration.tree_src}' 
	    			item_src='${acc_link.url}'
	    		></pineal-tree>

	    		<h4>Profile properties</h4>
	    		<pineal-tree 
	    			src='${Cfg.acc.tree_src}' 
	    			item_src='${this.axon.link.url}'
	    		></pineal-tree>
	    	`;

		this.user.getValue().then(value => {
			this.select('#value').innerText = value;
		});

		if(this.user.type == 'publisher')
			this.checkName();
		else{
			(this.select('#account-domain') || {}).hidden = true;
			(this.select('#setname') || {}).hidden = true;
		}
    }

    checkName(){
    	var name = this.user.name;

	   	this.select('#account-url').href = this.user.href;
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
	}

	select(qs){
		return this.shadowRoot.querySelector(qs);
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