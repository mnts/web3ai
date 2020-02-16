$(function(){
	S.error.auth = function(m){

	}

	$('#authentication-username, #authentication-password').bindEnter(function(){
			$('#authentication-join').click();
	});

	$('#resetPassword-join').click(function(){
		var $email = $('#resetPassword-email');

		ws.send({
			cmd: 'sendSession',
			email: $email.val(),
		}, function(r){
			if(r.error) $email.blink();
			if(r.user) UI.modal('#resetPassword-sent');
		});

		ev.preventDefault();
		return false;
	});

	var auth = document.forms.auth;
	auth.onsubmit = function(ev){
		var q = {
			cmd: 'auth',
			password: $('#authentication-password').val()
		};

		var a = $('#authentication-a').val();
		if(a.indexOf('@') + 1) q.email = a;
		else q.name = a;

		W(q, r => {
			if(r.user){
				Acc.ok(r.user);
				return;
			}

			if(r.error == 'not found') $('#authentication-a').blink('red');
			else if(r.error == 'wrong password' || r.error == 'no password') $('#authentication-password').blink('red');
			else $('#authentication-join').blink('red');
		});

		return false;
	};

	$(auth.password).add(auth.username).bindEnter(auth.onsubmit);

	$('#nav > * > .ev').hide();


	$('#acc-logOut').click(function(){
		acc.out();
	});


	$('#acc-edit, #fullName').click(function(){
		Site.openApp('editProfile');
	});

	$('#acc-password').click(function(){
		UI.modal('#changePassword');
	});

	$('#changePassword-submit').click(function(){
		var $password = $('#changePassword-password');

		$('#changePassword .err').removeClass('err');

		if($password.val() < 4) $password.err('Too short');
		if($password.val() != $('#changePassword-password_re').val()) $('#changePassword-password_re').err('Both should match');

		if(!$('#changePassword .err').length){
			ws.send({cmd: 'changePassword', password: $password.val()});
			UI.modal('#changePassword-done');
		}
	});
});

Acc.on.push(function(){
	if($('#authentication').is(':visible'))
		$('#title').click();
});

window.addEventListener('login', function(ev, d){
	console.log(ev);
	console.log(d);
}, false);


Acc.on.push(function(user){
	var sid = location.hash.replace('#', '');
	if(!sid) return;

	ws.send({
		cmd: 'grant',
		sid: sid
	}, function(r){
		//if(r.ok) window.close();
		if(r.error) console.error(error);
	});
});


//social networks
$(function(){
	var $cont = $("#authentication");
	var $toggle = $('#user-byEmail').click(function(){
		$cont.slideDown('fast');
	});

	/*
	$(document).mouseup(function(e){
		if($toggle.is(e.target)) return $cont.slideUp('fast', function(){
			$cont.clearQueue()
		});

		if(!$cont.is(e.target) && $cont.has(e.target).length === 0)
			$cont.hide();
	});
	*/


	var cb = randomString(9);
	$('#auth-social > .i-reddit').attr('href', 'http://pix8.0a.lt:81/auth/reddit?cb='+cb).click(function(){
		ws.send({
			cb: cb
		}, function(r){
			if(r.user){
				$.cookie('sid', r.sid, {path: '/'});
				ws.send({cmd: 'setSession', sid: r.sid});
				acc.ok(r.user);
			}
		});
	});

	$('#auth-social > a').click(function(){
		var service = $(this).data('service');

		if(service)
			window.open('http://'+domain+'/auth/'+service, '_blank', {
				height: 200,
				width: 300,
				status: false
			});
	});
});
