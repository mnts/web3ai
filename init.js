import W from '/src/data/W.js';
const select = q => document.querySelector(q);

if('serviceWorker' in navigator){
	console.log('Install sw.js');
		
  navigator.serviceWorker.register('/sw.js')
    .then((worker) => {
    	window.worker = worker;
    })
    .catch((err) => {
      console.log('-> Failed to register:', err)
    });

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
	  e.preventDefault();
	  deferredPrompt = e;

	  deferredPrompt.prompt();
	  // Wait for the user to respond to the prompt
	  deferredPrompt.userChoice.then((choiceResult) => {
		if (choiceResult.outcome === 'accepted') {
		  console.log('User accepted the install prompt');
		} else {
		  console.log('User dismissed the install prompt');
		}
	  })
	});
}

function jsUcfirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.addEventListener('DOMContentLoaded', function(){
	$('#domain').bindEnter(ev => {
        select('#launch').click();
	});

	select('#home').setAttribute('contenteditable', true);
	
	select('#launch').addEventListener('click', (ev) => {
        if(!account.user)
            return $('#account-icon').click();
        
		const input = select('#domain');
		let domain = input.value;
		if(!domain) 
		    return $(domain).blink('red');
		
		const item = {
			domain,
			name: domain.split('.')[0],
			title: jsUcfirst(domain.split('.')[0])
		};
        
        W({
        	cmd: 'save',
        	item,
        	collection: 'sites'
        }).then(r => {
        	if(r.error) return alert(r.error);
        	if(
        	    r.item && 
        	    confirm('Continue to '+r.item.domain)
        	) location.href = 'http://'+r.item.domain;   
        });
	});
});