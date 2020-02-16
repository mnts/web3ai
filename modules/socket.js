
window.WebSocket = window.WebSocket || window.MozWebSocket;

window.WS = function(server, cb){
	var t = ws = this;
	this.connection = new WebSocket('ws://'+server);
	this.connection.binaryType = "arraybuffer";

	this.on = {
		alert: function(msg){
			alert(msg.text);
		},

		progress: function(msg){
			var stream = ws.stream;
			if(msg.b){
				if(stream.buffer.byteLength > msg.b){
					stream.pumped = msg.b;
					t.pump();
				}
				else{

					var d = {
						cmd: 'saveStream',
						id: ws.stream.id,
						name: ws.stream.name,
						mime: ws.stream.mime,
					};

					t.send(d, function(r){
						if(r.name){
							if(typeof stream.callback == 'function')
								stream.callback(r.file);
						}
						//delete ws.stream;

						var task = t.tasks.shift();
						if(typeof task == 'function')
							task();

					});
				}
			}
		}
	};

	if(cb) this.connection.onopen = cb

	this.connection.onmessage = function(msg){
		t.message(msg);
	};
	this.connection.onclose = function(){};

	this.connection.onerror = function(error){
		console.log(error);
	};
};


WS.prototype = {
	online: {},
	cbs: {},

	send: function(msg, cb){
		if(!msg) return;

		if(cb){
			if(!msg.cb) msg.cb = randomString(15);
			this.cbs[msg.cb] = cb;
		}
		this.connection.send(JSON.stringify(msg));

		return msg.cb;
	},

	move: function(x,y){
		var buf = new ArrayBuffer(5),
			arr = new Uint8Array(buf);

		arr[0] = ws.id;
		arr[1] = ((x & 0xff00) >> 8);
		arr[2] = (x & 0x00ff);
		arr[3] = ((y & 0xff00) >> 8);
		arr[4] = (y & 0x00ff);

		this.connection.send(buf);
	},

	tasks: [],
	buffers: [],
	bufLength: 5000,

	upload: function(buffer, cb, info){
		var ws = this;
		this.tasks.push(function(){
			ws.send({
				cmd: 'createStream'
			}, function(r){
				if(r.name){
					var stream = ws.stream = $.extend({
						pumped: 0
					}, info);

					if(typeof cb == 'function')
						stream.callback = cb;

					if(typeof buffer == 'string')
						buffer = new Blob([buffer], { type: "text/plain" });

					if(buffer instanceof Blob){
          				var fileReader = new FileReader();
         				fileReader.onload = function(){
							stream.buffer = this.result;
							ws.pump();
         				}
         				fileReader.readAsArrayBuffer(buffer);
					}
					else{
						stream.buffer = buffer;
						ws.pump();
					}
				}
			});
		});

		if(!ws.buffer && ws.tasks.length == 1)
			ws.tasks.shift()();
	},

	pump: function(){
		var ws = this;

		var buf = ws.stream.buffer.slice(ws.stream.pumped, ws.stream.pumped + ws.bufLength);
		ws.connection.send(buf);
	},

	str2ab: function(str) {
		var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i=0, strLen=str.length; i<strLen; i++){
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	},

	message: function(msg){
		if(msg.data instanceof ArrayBuffer){
			var arr = new Uint8Array(msg.data);
			this.draw(arr[0], (arr[1] << 8) + arr[2], (arr[3] << 8) + arr[4]);
			return;
		};

		msg = JSON.parse(msg.data);

		var cb;
		if(msg.cb && (cb = this.cbs[msg.cb])) cb(msg);

		if(this.on[msg.cmd])
			this.on[msg.cmd](msg);
	}
};
