window.acc = window.Acc = {
	user: false,
	avatar: new Image,
	onAvatar: [],
	u: {},
	uN: {},
	users: function(ids, cb){
		if(typeof ids != 'object') return false;

		var find = [],
			 fNames = [];
		ids.forEach(function(id, i){
			if(isNaN(id)){
				if(!acc.uN[id])
					fNames.push(id);
			}
			else{
				if(!acc.u[id])
					find.push(id);
			}
		});

		if(find.length || fNames.length)
			W({
				cmd: 'users',
				filter: {$or :[{id: {$in: find}}, {name: {$in: fNames}}]}
			}, function(r){
				r.users.forEach(function(u){
					acc.u[u.id] = u;
					acc.uN[u.name] = u;
				});
				cb(acc.u);
			});
		else cb(acc.u);
	},

	fullName: function(user){
		var title = user.fullName || ((user.firstName || '')+' '+(user.lastName || ''));
		if(title.length < 3) title = user.name || user.email || user.id;
		return title;
	},

	updateList: function(users){
		users.forEach(function(u){
			acc.u[u.id] = u;
			acc.uN[u.name] = u;
		});
	},

	on: [],
	ok: function(user){
		if(user) acc.user = user;

		//if(!Acc.user.super) return alert('Only for admins');

		$('#acc').show();

		var img = user.avatar || user.image;
		if(img)	$('#avatar').css('background-image', 'url('+Cfg.files+img+')');


    var title = user.title || user.fullName || (user.firstName || '')+' '+(user.lastName || '');
    if(title.length < 3) title = user.name || user.email || user.id;

		$('#fullName').text(user.fullName || acc.user.firstName || acc.user.name || acc.user.email);

		$('.a:not(header)').show();
		$('.na').hide();

		$('header.a').slideDown();
		$('header:not(.na)').slideDown();

		if(user.super)
			$('.super').show();

		acc.u[acc.user.id] = acc.user;
		acc.uN[acc.user.name] = acc.user;
		acc.on.forEach(function(f){
			f(acc.user);
		});
		$(document).trigger('authenticated', user);

		if(user.cms){
			if(user.cms.home_app){
				$('#title').off().click(ev => {
					Site.openApp(user.cms.home_app);
				}).click();
			}
		}
	},

	off: [],
	out: function(){
		$('.na').show();
		$('.a').hide();
		acc.user = false;
		Cookies.remove('sid');

		$('.super').hide();

		acc.off.forEach(function(f){
			f();
		});

		$(document).trigger('logout');
	}
}


Site.on.session = function(p){
	Cookies.set('sid', p[1], {path: '/'});
};

Site.ready.push(function(sid){
	//$('#user-auth').attr('src', Cfg.auth.avatar+'?sid='+sid);
});

$(function(){
	$('#auth-open').click(ev => {
		Site.openApp('authentication');
	});

	$('#authentication-new').click(ev => {
		Site.openApp('registration');
	});

	$('#user-login').click(function(){
		window.open(Cfg.auth.site+'#'+Site.sid, '_blank');
	});

	$('#acc-edit').click(function(ev){
		User.open(Acc.user.id);
	});


	$('#acc-changePicture').click(function(){
		$('#uplAvatar').click();
	});


	$('#fullName, #avatar').tip({
		pos: 'b',
		id: 'acc-menu',
		event: 'click',
		fix: 'c',
		ba: function($el){

		}
	});


	$('#acc-logOut').click(function(){
		Acc.out();
	});


	$('#fullName').tip({
		pos: 'b',
		id: 'acc-menu',
		event: 'click',
		fix: 'c',
		ba: function($el){

		}
	});

	//Acc.openApp('authentication');

	/*
	ws.on.acc = function(m){
		acc.ok(m.user);
		//tip.hide();
	}

	ws.on.updateProfile = function(m){
		if(m.profile && Acc.user)
			Acc.user = m.profile;
	}
	*/
});


Acc.off.push(ev => {
});
