//import '/node_modules/gun/gun.min.js';
import '/node_modules/gun/lib/path.js';
import '/node_modules/gun/lib/open.js';
import '/lib/sea.min.js';

Gun.chain.load = function(cb, opt, at){
	(opt = opt || {}).off = !0;
	return this.open(cb, opt, at);
}

var peers = ['https://gunjs.herokuapp.com/gun'];
if(Cfg.gun.path.indexOf('localhost')<0) peers.push('http://localhost:8765/gun');
var gun = window.gun = Gun({peers});

export default gun;