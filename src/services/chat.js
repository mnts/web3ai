import servers from '../data/servers.js';

const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);

let chats;

var mutate = () => {
	if(!chats) return;
	let isMob = document.body.classList.contains('mobile');
	if(isMob == chats.classList.contains('mobile')) return;
	chats.classList[isMob?'add':'remove']('mobile');
	chats.classList[isMob?'add':'remove']('app');

	if(isMob) document.querySelector('#body').appendChild(chats);
	else document.querySelector('#layout').appendChild(chats);
};

// create an observer instance
var observer = new MutationObserver(muts => {
    muts.forEach(mut => {
        if(
            mut.type == 'attributes' &&
            mut.attributeName == 'class'
        ) mutate();
    });
});

window.addEventListener('DOMContentLoaded', function(){
    chats = document.querySelector('#chats');
    if(chats) observer.observe(document.body, {
		attributes: true
	});

	mutate();
});