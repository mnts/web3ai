import account from '/src/account.js';

const select = q => document.querySelector(q);
const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);


document.body.addEventListener('ready', function(){
	var p = document.location.pathname.replace(/^\/|\/$/g, '').split('/');


	var name = p[1];//location.hash.substr(1) || location.host.split('.')[0];
	
	var user_el = document.createElement('pineal-user'),
	    rate_el = document.createElement('fractal-rate'),
	   title_el = document.createElement('h1'),
	   subscribe_el = document.createElement('fractal-subscribe'),
	   seeds_el = document.createElement('div');
	   seeds_el.id = 'owner_seeds';

	

	rate_el.slot='left';
	rate_el.style = '--icon-size: 32px';

	title_el.id = 'owner-title';
	
	user_el.addEventListener('loaded', async ev => {
		let user = ev.detail.user;

		var cover = select('#cover');

		var title = user.item?(user.item.title):(user.name || ('#'+user.id));
		title_el.textContent = title;

		user.axon.link.children(links => {
			links.map(link => {
				link.load(item => {
					if(item.name == 'cover_images')
						cover.setAttribute('src', link.url);
				});
			});
		});
		
		rate_el.setAttribute('src', user.axon.link.url);

		select('#profile-article').setAttribute('src', user.axon.link.url);
		
		subscribe_el.setAttribute('path', user.email);

		var stories = document.querySelector('#catalogem-stories');
		stories.setAttribute('owner', user.email);
		
        user_el.link.checkOwnership(async own => {
        	if(!own) return seeds_el.remove();
        	
			seeds_el.innerText = await user.getValue();

			seeds_el.addEventListener('click', async ev => {
				if(!account.user || !account.user.super) return;
				var num = parseInt(prompt(`Number of seeds ${user.email} has?`, user.value));
				if(!num && num !== 0) return;

				var acc_link = Link(`mongo://${Cfg.server}/acc?email=`+user.email);
				acc_link.set('value', num).then(r => {
				});

				user.value = num;
				delete user.value_promise;
				seeds_el.innerText = await user.getValue();
			});
        });

		const home = select('#home');

		// create an observer instance
		var observer = new MutationObserver(muts => {
			console.log(muts);
			let cl = document.body.classList;
			
			muts.forEach(mut => {
				if(
					mut.type == 'attributes' &&
					mut.attributeName == 'class'
				){
					document.body.classList[
						home.classList.contains('selected')?
						'add':
						'remove'
					]('home');
				}
			});
		});
		
		observer.observe(home, {
			attributes: true
		});
	
		account.authenticated.then(account => {
			if(account.user.email == user.email)
				customElements.whenDefined(cover.localName).then(() => {
					cover.includeAdd();
				});
			
			cover.addEventListener('upload', ev => {
				let link = ev.detail.link;

				if(!ev.target.link){
					var newItem = {
						type: 'gallery',
						name: 'cover_images',
						title: 'Cover images',
						owner: user.email
					};

					let collection = 'tree';
					user_el.W({
						cmd: 'save', 
						item: newItem,
						collection
					}).then(r => {
						if(!r || !r.item) return console.error(`
							unable to init_profile_photos
						`);

						let link = Link(`mongo://${location.host}/${collection}#${r.item.id}`);
						link.item = r.item;
						account.axon.link.add(link).then(link => {
							ev.target.setAttribute('src', link.url);
						});
					});
				}
			});
		});
	});
	user_el.setAttribute('path', name);



	let append = el => document.querySelector('#owner').appendChild(el);
	append(user_el);
	append(title_el);
	append(rate_el);
	append(subscribe_el);
	append(seeds_el);

	let click = ev => {
		select('#head').goHome();
	};
	user_el.addEventListener('click', click);
	title_el.addEventListener('click', click);

	//Lib.item.children.push('mongo://'+document.location.host+'/tree'+'?domain='+domain);
});