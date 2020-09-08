import servers from './data/servers.js';
import Account from './acc/Account.js';
const select = q => document.querySelector(q);

var account = document.createElement('fractal-account');
account.id = 'account';

var authenticated = new Promise((ok, no) => {
	document.body.addEventListener('authenticated', function(ev){
		var user = ev.detail.user;
		if(account.user) ok(account);
		else account.auth(user.email).then(r => {
			ok(account);
		});

		var user_el = document.createElement('pineal-user');
		
		(new MutationObserver(m => m.forEach(mut => {
		  if(mut.attributeName == 'title'){
			let title = mut.target.attributes.title.value;
			select('#account-title').innerText = title || '';
		  }
		}))).observe(user_el, {
			attributes: true
		});
		
		let acc_icon = select('#account-icon');
		if(acc_icon){
			acc_icon.innerHTML = '';
			user_el.setAttribute('path', user.email);
			acc_icon.append(user_el);
		}

		this.classList.add('authenticated');
		tippy.hideAll();
	}, false);
});


var on_ready = new Promise((ok, no) => {
	document.body.addEventListener('ready', function(ev){
		ok();
	});
});

account.ready = on_ready;
account.authenticated = authenticated;

document.body.addEventListener('logout', function(ev){
	document.querySelectorAll('.acc').forEach(uel => {
		uel.remove();
	});
	
	select('#account-icon').innerHTML = '';
	this.classList.remove('authenticated');
	tippy.hideAll();
}, false);

document.addEventListener('DOMContentLoaded', ev => {
	var box = select('#account-side');
	if(!box) return;
	
	box.prepend(account);

	
	const side = select('#account-side'),
		  icon = select('#account-icon');

	let auth_box;

	let toggleIcon = () => {
		var isOpened = side.classList.contains('opened');
		icon.classList[isOpened?'add':'remove']('close');
        
		if(!auth_box && !account.user){
			auth_box = document.createElement('pineal-auth');
			box.prepend(auth_box);
		}
	}

	(new MutationObserver(muts => muts.forEach(mut => {
			if(mut.attributeName == 'class')
				toggleIcon();
	}))).observe(side, {
		attributes: true
	});

	if(icon) icon.addEventListener('click', ev => {
		if(!side.classList.contains('opened'))
			side.classList.add('opened');

		toggleIcon();
	});

	servers.connect(Cfg.api).then(ws => {
		window.Ws = ws;
		var ev_ready = new CustomEvent('ready', {
		});

		var user = ws.session.user;
		account.ws = ws;

		if(user){
			account.auth(user.email).then(user => {
				var ev = new CustomEvent('authenticated', {
				  detail: { user , account}
				});
				
				
				document.body.dispatchEvent(ev_ready);
				document.body.dispatchEvent(ev);
			});
		}
		else{
			document.body.dispatchEvent(ev_ready);
		}
	});
});

export default account;
