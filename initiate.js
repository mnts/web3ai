window.Pineal = {};

import './config.js';

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
  	console.log('Page loaded sw');
    navigator.serviceWorker.register('//'+Cfg.server+'/service-worker.js')
    	.then((reg) => console.log('Service worker registered.', reg));
  });
}

window.addEventListener('beforeinstallprompt', evt => {
	// CODELAB: Add code to save event & show the install button.
	let deferredInstallPrompt = evt;

	console.log('Can be installed', evt);

	let installButton = document.getElementById('install');
	if(installButton) installButton.addEventListener("click", evt => {
		// CODELAB: Add code show install prompt & hide the install button.
		deferredInstallPrompt.prompt();
		// Hide the install button, it can't be called twice.
		evt.srcElement.setAttribute('hidden', true);
	});

	installButton.removeAttribute('hidden');

	deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt', choice);
      } else {
        console.log('User dismissed the A2HS prompt', choice);
      }
      deferredInstallPrompt = null;
    });
});

window.addEventListener('appinstalled', evt => {
	console.log('App installed');
});


NodeList.prototype.forEach = Array.prototype.forEach

Pineal.Lib = window.Lib = {};

window.html = function(cont){
  var parser = new DOMParser();
  
  return parser.parseFromString(cont, "text/html");
}

Pineal.init = async function(){
	var initiator = document.querySelector('script[src*="initiate.js"]');

	var prev = initiator,
		promises = [];

	var jp = (...args) => {
	  return args.map((part, i) => {
	    return (i === 0)?
	    	part.trim().replace(/[\/]*$/g, ''):
	    	part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
	  }).filter(x=>x.length).join('/');
	};

	var loadScript = (src, cf = {async:true, append: true}) => {
		let promise = new Promise((ok, no) => {
			let tag = document.createElement('script');
			tag.async = cf.async;
	    	tag.src = '//'+jp(Cfg.server, src);
	    	if(cf.module) tag.setAttribute('type', 'module');
	    	
	    	if(cf.append) (cf.append === true?document.head:cf.append).appendChild(tag);
	    	else document.head.insertBefore(tag, prev.nextSibling);
	    	
	    	prev = tag;
	    	tag.onload = ev => {
	    		if(cf.cb) cf.cb(tag);
	    		ok(tag);
	    	};
	    	tag.onerror = ok;
		});

		if(!cf.alone) promises.push(promise);

		return promise;
	};

	var qs = q => document.querySelector(q);

	if(!qs('script[src*="jquery"]'))
		await loadScript('/libs/jquery.js');


	if(!qs('script[src*="interactjs"]'))
		await loadScript('/node_modules/interactjs/dist/interact.min.js');

	/*
	if(!qs('script[src*="sugar"]')){
		await loadScript('/libs/sugar.js', {alone: true});
		Sugar.extend();
	}

	if(!qs('script[src*="web-animations"]'))
		loadScript('/lib/web-animations-next-lite.min.js');

	*/

	if(!qs('script[src*="md5.js"]'))
		loadScript('/lib/md5.js');


	if(!qs('script[src*="ws.js"]'))
		loadScript('/libs/ws.js');


	if(!qs('script[src*="js.cookie"]'))
		loadScript('/libs/js.cookie.js');

	if(!qs('script[src*="diacritics"]'))
		loadScript('/libs/diacritics.js');

	/*

	if(!qs('script[src*="js-yaml.min.js"]'))
		loadScript('/lib/js-yaml.min.js');

	*/
	loadScript('/modules/functions.js');

	loadScript('/npm_bundle.js', {async: false});

	/*
	await loadScript('/node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js', {async: false});
	
	await loadScript('/polymer-extra.js', {async: false}).then(tag => {

	});
	*/

	let promise = new Promise((ok, no) => {
		Lib.polymerLoaded = async lbs => {
			console.log('Lib.polymerLoaded');
			window.PolymerElement = Lib.PolymerElement;
			window.html = Lib.html;

			//window.Popper = Lib.popper;
			//window.Tooltip = Lib.tooltip;
			//window.tippy = Lib.tippy;

			ok();


		};
	});
	promises.push(promise);

	
			await loadScript('/src/chrome.js', {async: false});
			loadScript('/src/index_tab.js', {async: false, module: true, append: document.body, cb: tag => {
				let event = new CustomEvent('pineal_ready', { detail: window.Pineal});

				document.dispatchEvent(event);
			}});

	
	/*
	let tag4polymer = document.createElement('script');
	//tag4polymer.async = true;
	tag4polymer.src = '//'+jp(Cfg.server, '/build/pnl/polymer_includes.js');
	document.head.insertBefore(tag4polymer, tag4polymer.nextSibling);
	prev = tag4polymer;



	if(!qs('script[src*="maps.googleapis.com/maps/api/js"]'))
		loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDE7m50ILI18LCswZZ93W5KyFgtnASmkhg&libraries=places');
	


	if(!qs('script[src*="npm_bundle"]'))
		loadScript('/npm_bundle.js');

	*/




	let tag = document.createElement('link');
	tag.setAttribute('rel', 'stylesheet');
	tag.href = '//'+jp(Cfg.server, '/design/chrome.css');
	document.head.appendChild(tag);


	await Promise.all(promises);
	console.log('loaded promised');
};


document.addEventListener('pineal_ready', ev => {
	$('#loading').hide();
});


document.addEventListener("DOMContentLoaded", function(){
	Pineal.init();
});