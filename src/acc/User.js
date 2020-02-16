import servers from '../data/servers.js';
import account from '/src/account.js';
import Axon from '../neuro/Axon.js';

var users = {};

var domain = Cfg.api.split(':')[0];

class User_main{
	constructor(path){
		this.path = path;
		this.load();
	}

	load(cb){
		var itm = this.item;
		if(itm){
		  if(itm instanceof Promise)
			return itm.then(item => cb(item));
		  return cb(itm);
		}

    	this.item = new Promise((k, n) => {
			servers.connect(Cfg.api).then(ws => {
				let q = {
					cmd: 'loadProfile'
				};

				q[(this.path.indexOf('@')+1)?'email':'name'] = this.path;
				
				ws.send(q, r => {
					if(!r.user) return;
					$.extend(this, r.user);
					this.url = 'mongo://'+document.location.host+'/users?owner='+r.user.email;
					this.axon = new Axon(this.url);

					this.axon.link.load(item => {
						this.item = item;
						
						if(item){
							$.extend(this, item);
						}

						if(typeof cb =='function') cb(item);
						k(item);
					});
				});
			});
    	});
	}

	get href(){
		return location.origin+'/~/'+this.name;
	}
};

var User = function(u){
	if(typeof u =='string' && users[u]) return users[u];

	var user = users[u] = new User_main(u);

	return user;
}

export default User;