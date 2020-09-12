window = self;

//self.importScripts('npm_bundle_sw.js');
self.importScripts('/lib/npm_bundle.js');

self.importScripts('/src/Cfg.js');
//self.importScripts('/config.js');

//self.Cfg = Cfg_site;

self.importScripts('/lib/ipfs.js');

self.importScripts('/lib/ws.js');



self.importScripts('/lib/zangodb.min.js');

var cacheName = 'fractal';

var sync = () => {

}

var cfg_ws = {
  server: Cfg.api,
  autoReconnect: true
};

let ws = self.ws = new WS(cfg_ws);

var W_con = new Promise((ok, no) => {
  self.Wcon = ok;
});

function W(q){
  return new Promise((ok, no) => {
    W_con.then(() => {
      ws.send(q, ok);
    });
  });
}



ws.on.session = m => {
  this.sid = ws.sid = m.sid;
  ws.session = m;
  Wcon();
};

ws.onUploadProgress = m => {
  self.sendAll({
    cmd: 'uploadProgress',
    progress: m
  });
};

ws.onUploadStart = m => {
  self.sendAll({
    cmd: 'uploadStart',
    progress: m
  });
};


ws.onUploadEnd = m => {
  self.sendAll({
    cmd: 'uploadEnd',
    progress: m
  });
};


self.DB = new zango.Db('fractal', {
    files: ['id', 'domain', 'path', 'owner']
});

self.DB_req = indexedDB.open("fractal", 3);
DB_req.onupgradeneeded = () => {
  let DB = DB_req.result;

  if(!DB.objectStoreNames.contains("files")){
    var files_store = DB.createObjectStore("files", { keyPath: "id" });  
    files_store.createIndex("domain", "domain", { unique: false }); 
    files_store.createIndex("path", "path", { unique: false }); 
    files_store.createIndex("id", "id", { unique: true }); 
  }
};

const staticPaths = [
  'lib', 'src', 'node_modules', 'node_mod', 
  'img', 'files', 'design', 'manifest.json',
  'init.js', 'index.js'
];


console.log('init service-worker');
Ipfs.create().then(ipfs => self.ipfs = ipfs);

self.sendAll = m => {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
        client.postMessage(m);
    })
  })
};

self.syncFiles = () => {
  console.log('syncFiles');

  let files = self.DB.collection('files');

  files.find({synced: {$exists: false}}).toArray().then(items => {
      console.log(items);

      items.map(item => {
        if(ws.items[item.id]) return;
        
        var content = item.content;
        delete item.content;

        console.log(item, content);
        ws.upload(content, file => {
          console.log(file);
          files.update({id: file.id}, {
            $set: {
              synced: (new Date).getTime()
            }
          });
        }, item);
      });
  });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  //event.waitUntil();
  
  self.items = {};

  caches.keys().then(function(names) {
      for (let name of names)
          caches.delete(name);
  });
});


self.addEventListener('activate', (event) => {
  console.log('activate step');
  
  event.waitUntil(self.clients.claim())
});

function ipfs_cat(hash){
  const headers = { status: 200, statusText: 'OK', headers: {} };
  return (async () => {
    const ca = self.ipfs.cat(hash);
    var chunks = [];
    for await(let chunk of ca){
       chunks.push(chunk);
    }
    return new Response(Buffer.concat(chunks), headers);
  })();
}


self.addEventListener('fetch', (event) => {
  //console.log(event, event.request.url);
  //console.log(self);
  var db = (self.DB_req)?self.DB_req.result:{};
  
   // Otherwise continue to the network
   let url = event.request.url;
   var u = new URL(url);



   console.log(event.request);

  if(event.request.url.startsWith(self.location.origin + '/files')){
    let store = db.transaction('files', "readwrite").objectStore('files');
    
    let id = event.request.url.split('/files/')[1];

	var g = store.get(id);

     var prom = new Promise((ok, no) => {
       g.onsuccess = ev => {
        let item = g.result;

        if(!item) return caches.open(cacheName).then((cache) => {
           return cache.match(event.request).then((matched) => {
             console.log(matched, event);
               if(matched){
                 ok(matched);
                 return matched;
               }

               let url = event.request.url;
               return fetch(url).then((response) => {
                 console.log(response);
                  ok(response);
                   cache.put(event.request, response.clone());
                   return response;
                 });
            });
         });
        
        const head = {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Disposition': `inline; filename="${item.name}"`,
            'Content-Type': item.type,
            'Content-Size': item.size,
          }
        };
        
        let re = new Response(item.content, head);
        ok(re);
       };
     });
	
	event.respondWith(prom);
  }
  else
  if(event.request.url.startsWith(self.location.origin + '/ipfs')){
    console.log(event);
    const hash = event.request.url.split('/ipfs/')[1];
    event.respondWith(ipfs_cat(hash));
    return;
  }
  else
  if(
    event.request.method === "POST" || 
    u.hostname != self.location.hostname ||
    event.request.url.startsWith(self.location.origin + '/auth')
  ){
    event.respondWith(fetch(event.request));
  }
  else
  if(
    staticPaths.every(path => u.pathname.startsWith('/'+ path))
  )
   event.respondWith(
     caches.open(cacheName).then((cache) => {
       return cache.match(event.request).then((matched) => {
         if(matched)
           return matched;
        
         return fetch(url).then((r) => {
           cache.put(event.request, r.clone());
           return r;
         });
       });
     })
  );
  else{
    event.respondWith((async () => {
      let r = await W({
        cmd: 'get',
        domain: u.host,
        collection: 'sites'
      });

      return (r.item && r.item.ipfs)?
         ipfs_cat(r.item.ipfs):
         fetch(url);
    })());
  }
});

self.addEventListener('message', function(event){
  var m = event.data;

  if(m.cmd == 'checkFiles')
    syncFiles();
});

/*
  console.log(event);

  return;
  event.respondWith(
    caches.open(cacheName).then((cache) => {
       return cache.match(event.request)
         .then((matched) => {
           return matched || fetch(event.request)
             .then((response) => {
               //console.log(response);
               cache.put(event.request, response.clone());
               return response;
             });
         });
     })
  );
});
*/
async function catAndRespond (hash) {
  console.log('respond: ', hash);
  const data = await self.ipfs.cat(hash)
  const headers = { status: 200, statusText: 'OK', headers: {} }
  return new Response(data, headers)
}