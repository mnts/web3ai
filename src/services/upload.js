import {DB_promise} from './db.js';

import Link from '../data/Link.js';

const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);


if(navigator.serviceWorker){
	navigator.serviceWorker.onmessage = function(event) {
		var m = event.data;

		var progress = m.progress;
		if(!progress) return;

		console.log(m);

		if(m.cmd = 'uploadStart'){

		}

		if(m.cmd = 'uploadProgress'){

		}

		if(m.cmd = 'uploadEnd'){

		}
	};
}

function upload(files, cb){
	return new Promise((ok, no) => {
		for(var i = 0, f; f = files[i]; i++){
			var name = f.name;

			if (f.kind === 'file')
				f = f.getAsFile();

			// Only process video and image files.
			/*if(
				!f.type.match('image.*') && 
				!f.type.match('video.*')
			) continue;
			*/

			let item = {
				id: Math.random().toString(36).substr(7),
				name,
				domain: location.host,
				timeCreated: (new Date).getTime(),
				lastModified: f.lastModified,
				mime: f.type,
				size: f.size
			};

			if(account.user)
				item.owner = account.user.email;
			
			
			var reader = new FileReader();
			reader.readAsArrayBuffer(f);

			reader.onload = ev => {
				console.log(ev);
				if(Cfg.ipfs.on && window.ipfs){
					let buf = Buffer(ev.target.result);
					ipfs.add(buf).then(r => {
						if(r[0]){
							let hash = r[0].hash;
							var link = Link(`ipfs://${hash}`);
							link.item = item;

							if(cb) cb(link);
							ok(link);
						}
					});
					return;
				}

				item.path = 'files/'+item.id;

				servers.connect(Cfg.api).then(ws => {
					ws.upload(ev.target.result, file => {
						var link = Link(`mongo://${location.host}/files#${item.id}`);
						link.item = item;

						if(cb) cb(link);
						ok(link);
					}, item);
				});

				/*
				DB_promise.then(db => {
					let trans = db.transaction('files', "readwrite");
					let store = trans.objectStore('files');

					var add = store.add(item);
					console.log(item);
					add.onsuccess = ev => {
						console.log(ev);

						var link = Link(`mongo://${location.host}/files#${item.id}`);
						link.item = item;
						
						worker.active.postMessage({
							cmd: 'checkFiles'
						});
						
						
						if(cb) cb(link);
						ok(link);
					};

					add.onerror = ev => console.log(ev);
				});
				*/
			}
		}
	});
};


document.addEventListener('DOMContentLoaded', ev => {
	var body = document.querySelector('#body');
	
	/*
	document.querySelector('#head-upload').addEventListener('click', ev => {
		fileDialog({multiple: true}).then(files => {
			body.upload(files);
		});
	});
	*/

	function cancel(e){
		if (e.preventDefault) e.preventDefault(); // required by FF + Safari
		e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
		return false; // required by IE
	}

	document.addEventListener('dragstart', (ev) => {
		ev.dataTransfer.setData('text/plain', null);
	});

	document.addEventListener('dragend', (ev) => {
	});

	document.addEventListener('dragover', cancel);
	document.addEventListener('dragenter', cancel);
	document.addEventListener('drop', ev => {
		console.log(ev);


		var files;
		if(ev.type == 'drop')
			files = ev.dataTransfer.files;
		else
		if(ev.type == 'paste')
			files = (ev.clipboardData || ev.originalEvent.clipboardData).items;
		
		body.upload(files, ev);
		
		/*
		if(ev.dataTransfer.files.length)
			return this.upload(ev, $thumb);

		var txt = ev.dataTransfer.getData('URL') || ev.dataTransfer.getData('Text');
		*/
		
		ev.preventDefault();
		return false
	}, false);
});

/*
document.addEventListener('DOMContentLoaded', ev => {
	selectAll('.add').map(button => {
		var axon = Axon({
			...button.dataset
		});
	});
});
*/

export {upload};