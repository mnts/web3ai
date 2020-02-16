window.Layout = {
	showNav: w => {
		if(!w) w = Layout.w;
		Layout.$nav.css('left', 0);
		Layout.$nav.width(w);
		$('#styleApps').html(Layout.sized(w));
	},

	sized: w => {
		w = Layout.getW(w);
		return `
			main{margin-left: ${w}px;}
			.app > .full{width: calc(100% - ${w}px) !important;}
		`;
	},

	getW: w => Math.min(Math.max(w, 400), 1200)
};


$(function(){
	$('#name').click(function(){
		$('#tree .av').removeClass('av');
		site.openApp('home');
	});

	
	$('<div>', {id: 'brand-resize'}).click(ev => {

	}).appendTo('#brand');


	$('#head-top').click(function(){
		$('body,.CodeMirror-scroll').animate({scrollTop: 0});
	});


	var $resize = $('<div>', {id: 'nav-resize', draggable: true}).appendTo('#nav');

	$resize.mousedown(function(ev){

	});

	var $nav = Layout.$nav = $('#nav');

	$resize[0].addEventListener('dragstart ', function(ev){
		console.log(ev);
		return false;
	}, false);

	$resize[0].addEventListener('drag', function(ev){
		var x = Layout.getW(ev.pageX);
		$nav.css('width', x);
	}, false);

	var w = Layout.w = Layout.getW(Cookies.get('wNav') || 0);
	$resize[0].addEventListener('dragend', function(ev){
		w = Layout.getW($nav.width());
		Cookies.set('wNav', w);
		$('#styleApps').html(Layout.sized(w));
	}, false);

	var $nav = $('#nav');
	/*
	$(document.getElementsByTagName('pineal-body')[0].shadowRoot.getElementById("logo")).click(ev => {
		if(!$nav.offset().left){
			$('#styleApps').html('.app{margin-left: 0;}');
			$nav.css({left: -$nav.width()});
			console.log($nav.css('left'));
			Cookies.set('showNav', null);
		}
		else{
			$nav.css({left: 0});
			//setTimeout(function(){
				$('#styleApps').html(Layout.sized($nav.width()));
				Cookies.set('showNav', 'yes');
			//}, 00);
		}
	});
	*/

	$('#title').click(ev => {
		Site.openApp('home');
	});

	$('#nav-apps > a').click(function(){
		Site.openApp(this.name);
	});
});

$(document).on('authenticated', (ev, user) => {
	console.log(user);
});


Acc.on.push(user => {
	if(Cookies.get('showNav') == 'yes'){
		Layout.showNav();
	}
});

$(function(ev){
});

Acc.on.push(function(){
	console.log('auth');
	Site.openApp('home');
});

Acc.off.push(function(){
	//$('#nav').hide();
	//$('#styleApps').html('.app{margin-left: 0;}');
});
