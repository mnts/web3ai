import servers from './servers.js';

const W = m => {
	return new Promise((ok, no) => {
	   servers.connect(Cfg.api).then(ws => {
			ws.send(m, r => {
			  r?ok(r):no();
			});
	   });
	});
}

export default W;