import servers from '../data/servers.js';
import account from '/src/account.js';
import Axon from '../neuro/Axon.js';

var users = {};

var domain = Cfg.api.split(':')[0];

class User_main{
	constructor(path){
		this.path = path;
		this.connected = null;
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

                if(this.path[0] == '~')
	                q.id = this.path.substr(1);
	            else
    				q[(this.path.indexOf('@')+1)?'email':'name'] = this.path;

				ws.send(q, r => {
					if(!r.user) return;
					
					$.extend(this, r.user);
                    
					this.url = 'mongo://'+document.location.host+'/users?owner='+r.user.email;
					this.axon = new Axon(this.url);

					this.axon.link.load(item => {
						this.item = item;
						
					    if(item)
					        this.title = item.title || item.name || item.owner || ('#'+r.user.id);
						
						if(item){
							//$.extend(this, item);
						}
                        
                        const ok = () => {
							if(typeof cb =='function') cb(item);
							k(item);
                        };
                        
                    
                        if(Cfg.acc.online_check)
							ws.send({cmd: 'online', id: this.id}, r => {
								this.connected = r.connected;
								ok();
							});
						else ok();
					});

					document.addEventListener('ws.cmd.connected', ev => {
						if(ev.detail.m.id == this.id)
							this.connected = true;
					});

					document.addEventListener('ws.cmd.disconnected', ev => {
						if(ev.detail.m.id == this.id)
							this.connected = false;
					});
				});
			});
    	});
	}

	getValue(){
    	if(this.value_promise) return this.value_promise;

    	return this.value_promise = new Promise((k, n) => {
    		this.load(async item => {
				var ws = await servers.connect(Cfg.api);
				ws.send({
					cmd: 'load', 
					collection: 'stories', 
					filter: {
						owner: this.email, 
						value: {$exists: true}}
				}, r => {
					let value = 0;
					(r.items || []).forEach(item => {
						value += parseInt(item.value) || 0;
					});

					k((this.value || 0) + value);
				});
    		});
    	});
	}

	get href(){
		var name = this.name || ('~'+this.id);
		return location.origin+'/profile/'+name;
	}
};

var User = function(u){
	if(typeof u =='string' && users[u]) return users[u];

	var user = users[u] = new User_main(u);

	return user;
}


export default User;