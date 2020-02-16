const select = q => document.querySelector(q);
const extend = NPM.extend;


window.addEventListener('DOMContentLoaded', function(){
	var input = document.getElementById('search'),
		head = document.getElementById('head'),
		catalogem = select('.mainList');
	
	if(input) input.addEventListener('change', ev => {
		head.goHome();
		let list = document.querySelector('.mainList');
		list.scrollIntoView()
		
		let str = ev.target.value;

		var filter = list.filter;
		if(!filter.query) filter.query = {};

		if(str)
			extend(filter.query, {$text: { $search: str}});
		else{
			delete filter.query.$text;
		}
		
		list.load();
	});
});