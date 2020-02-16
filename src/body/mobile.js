(function(){
	var w = parseInt($('html').css('--mobile-width')) || 700;
	var doit = name => document.body.classList[(document.body.clientWidth < w)?'add':'remove'](name);
	
	doit('closed');
	doit('mobile');

	$('html').css('--mobile-width', w+'px');

	document.querySelector('#modal').addEventListener('click', function (event) {
		doit('closed');
		event.preventDefault();
	});

	window.addEventListener('resize', event => {	
		//checkSize();
		doit('mobile');
	});
})();
