const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);

var selector = '.side.opened.fixed, .mobile .side.opened';
var opened = selectAll(selector);

// create an observer instance
var observer = new MutationObserver(muts => {
	let cl = document.body.classList;
	setTimeout(() => {
		muts.forEach(mut => {
			if(
				mut.type == 'attributes' &&
				mut.attributeName == 'class'
			){
				cl.remove('scroll_top');
				cl.remove('scroll_bottom');
				cl.remove('scroll_up');
				cl.remove('scroll_down');
				opened = selectAll(selector)
			}
		});
	}, 80);
});

// pass in the target node, as well as the observer options
selectAll('.side').map(side => {
	observer.observe(side, {
		attributes: true
	});
});

window.addEventListener('DOMContentLoaded', function(){
	document.body.addEventListener('click', ev => {
		let sideFound;

		if(!opened.length) return;

		var path = ev.composedPath();

		for(let i = 0; i<path.length; ++i){
			let el = path[i];
			if(
				el && (el.id =='hidden-file' || (
					el.classList &&
					el.classList.contains('side')
				))
			){
				sideFound = el;
				break;
			}
		}

		if(opened.length && !sideFound)
		  opened.map(side => {
			if(!side.classList.contains('locked'))
				side.classList.remove('opened');
		  });
	}, false);
});