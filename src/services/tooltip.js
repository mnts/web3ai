const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);

window.addEventListener('DOMContentLoaded', function(){
	document.body.addEventListener('click', ev => {
		let found;

		const opened = selectAll('.tip[data-show]');
		if(!opened.length) return;

		var path = ev.composedPath();

		for(let i = 0; i<path.length; ++i){
			let el = path[i];
			if(el.classList && el.classList.contains('tip')){
				found = el;
				break;
			}
		}

		if(!found)
		  opened.map(box => {
		  	    if(!box.dataset['stay'])
				    box.removeAttribute('data-show');
		  });
	}, false);
});