//  mongo://io.cx/pix8#ov2567
import account from '../account.js'

export default class Link_mongo{
  constructor(u){
    this.supports = ['mongo'];

    if(typeof u == 'string'){
      if(u.indexOf('://')){
        this.url = this.link = u;

        var [protocol, way] = u.split('://');
        this.protocol = protocol;

        var hash_index = way.indexOf('#');
        if(hash_index + 1){
          this.id = way.substr(hash_index+1);
          way = way.substr(0, hash_index);
        }

        var query_index = way.indexOf('?');
        if(query_index + 1){
          this.query_string = way.substr(query_index+1);
          way = way.substr(0, query_index);
          this.query = this.parseQuery(this.query_string);
        }

        if(way){
          var sep = way.indexOf('/');
          this.domain = this.hash = way.substr(0, sep);
          this.path = way.substr(sep+1);

          this.uri = this.path.replace(/^\/+|[^A-Za-z0-9_.:\/~ @-]|\/+$/g, '');

        	this.p = this.uri.split(/[\/]+/);

          this.ext = this.path.split('.').pop();

          this.collection = this.p[0];
        }
      }
    }
    else if(typeof u == 'object'){
      $.extend(this, u);
    }

    if(this.collection == 'files')
      this.http = '//'+this.domain+'/files/'+this.id;

    //this.http = 'http://'+Cfg.host+':'+Cfg.port+'/'+protocol+'/'+way;
    this.load_filers();
  }

  parseQuery(queryString){
      var query = {};
      var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
      for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
  }

  load_filers(){
    this.fileLinks = {
      'io.cx': 'https://f.io.cx/',
      'th.ai': 'https://f.io.cx/',
      'manager.lh': 'https://files.lh/',
      'localhost': 'https://files.lh/',
    };
  }

  update4ws(ws){
    return;
    if(!this.http && ws.files)
      this.http_files = ws.files;
    else
    if(!this.http)
      this.http_files = this.fileLinks[this.domain];
  }

  W(m){
    var api = Cfg.api;
    if(['io.cx', 'th.ai'].indexOf(this.domain) + 1)
      api = this.domain;
    
    return new Promise((ok, no) => {
      this.constructor.servers.connect(api).then(ws => {
        if(!this.ws) this.ws = ws;
        this.update4ws(ws);

        ws.send(m, r => ok(r));
      });
    });
  }

  set(set, value){
    return new Promise((ok, no) => {
      if(typeof set == 'string'){
        this.load(item => {
          _.set(item, set, value);
          var varName = set.split('.')[0];
          set = {};
          set[varName] = item[varName];

          _.extend(this.item, set);
          this.W({
            cmd: 'update',
            id: this.id,
            set,
            collection: this.collection
          }, r => {
            r.item?ok(r.item):no();
          });
        });
      }
      else{
        this.load(item => {
        _.extend(this.item, set);

        this.W({
          cmd: 'update',
          id: this.id,
          set,
          collection: this.collection
        }, r => {
          r.item?ok(r.item):no();
        });
      });
      }
    });
  }

  download(cb){
    this.load(item => {
      this.constructor.servers.connect(Cfg.api).then(ws => {
        console.dir(ws);
        ws.download('/files/'+item.id).then((data, file) => {
          cb(data, file);
        }, error => {
          cb();
        });
      });
    });
  }

  order(links){
    var children = [];

    this.load(item => {
      links.forEach(link => {
        if(link) children.push((
          this.protocol == link.protocol &&
          this.host == link.host &&
          this.collection == link.collection
        )?link.id:link.url);
      });

      if(children.length)
        this.set({children});
    });
  }

  upload(data){
    return new Promise((ok, no) => {
      this.load(item => {
        this.constructor.servers.connect(Cfg.api).then(ws => {
          ws.upload(data, file => {
            if(!item.file)
              this.set({file: file.id}).then(ok);
            else
              ok(file);
          }, {
            path: '/files/'+item.id, 
            domain: location.host
          });
        });
      });
    });
  }

  save(item){
    if(!item.id) item.id = this.id;
    var item = $.extend({}, this.item, this.filter, item);
    return new Promise((ok, no) => {
      this.W({cmd: 'save', item, collection: this.collection}).then(r => {
        if(!r.item) return no();
        this.item = r.item;
        this.id = r.item.id;
        ok(r.item);
      });
    });
  }

  add(itm){
    console.trace(itm);
    return new Promise((ok, no) => {
      this.load(() => {
        if(typeof itm.children == 'function'){
          let link = itm;
          
          if(this.item.children)
            this.item.children.push(link.url);
          else
            this.item.children = [link.url];

          this.set('children', this.item.children);
          ok(itm);
        }
        else{
          var item = $.extend({}, this.filter, itm);
          this.W({cmd: 'save', item, collection: this.collection}).then(r => {
            let link = Link(this.protocol +'://'+ this.domain + '/' + this.collection + '#' + r.item.id);
            link.item = r.item;

            if(this.item.children)
              this.item.children.push(r.item.id);
            else
              this.item.children = [r.item.id];

            this.set('children', this.item.children);
            ok(link);
          });
        }
      });
    });
  }

  remove(cb){
    this.W({cmd: 'remove', id: this.id, collection: this.collection}).then(r => {
      cb(r);
    });
  }

  load(cb){
    var itm = this.item;
    if(itm){
      if(itm instanceof Promise)
        return itm.then(item => cb(item));
      return cb(itm);
    }

    var q = {
      cmd: 'get',
      collection: this.collection
    };

    if(this.id) q.filter = {id: this.id};
    else q.filter = this.query;

    this.item = new Promise((k, n) => {
      this.W(q).then(r => {
        if(!r.item) return cb() || k();

        this.item = r.item;
        //this.http = r.item.src || this.http_files + r.item.file;
        this.id = r.item.id;

        if(account.user && account.user.item)
           this.own = !!(r.item.owner == account.user.item.owner);

        cb(r.item);
        k(r.item);
      });
    });
  }

  checkOwnership(cb){
    this.load(item => {
      let check = (account) => {
        if(account.user){
           if(account.user.super){
              this.own = true;
              cb(this.own);
           }
           else
             account.user.load(user => {
               if(!user) return cb(false);
               
               if(item.owner){
                 if(typeof item.owner == 'string')
                   this.own = !!(item.owner == user.owner);
                 else
                 if(Array.isArray(item.owner))
                   this.own = !!(item.owner.indexOf(user.owner) + 1);
                 else
                   this.own = false; 
               }
               else
               if(item.email){
                  this.own = !!(item.email == user.owner);
               }
               else
                 this.own = false;
               cb(this.own);
             });
        }
        else cb(false);
      };

      if(account.user)
         check(account)
      else cb(false);

      document.body.addEventListener('authenticated', function(ev){
		var user = ev.detail.user;
		check(ev.detail.account);
      });
    });
  }

  children(cb){
    if(this.filter){
      this.W({
        cmd: 'load',
        filter: this.filter,
        sort: this.sort,
        limit: this.limit,
        collection: this.collection
      }).then(r => {
        var links = [];
        (r.items || []).forEach(item => {
          let link = Link(this.protocol +'://'+ this.domain + '/' + this.collection + '#' + item.id);
          link.item = item;

          links.push(link);
        });
        cb(links);
      });
    }
    else this.load(item => {
      /*
      if(typeof item.children == 'object' && !item.children.length){
        L(item.children).children(cb);
        return;
      }
      */

      var list = item.children || item.items || [];
      var links = [];

  	  this.W({
        cmd: 'load',
        filter: {id: {$in: list}},
        collection: this.collection
      }).then(r => {
        var items = {};

        (r.items || []).forEach((item) => {
          items[item.id] = item;
        });

        list.forEach(lnk => {
          if(!lnk) return;
          
          let link = (lnk.indexOf('://') + 1)?
            L(lnk):
            Link(this.protocol +'://'+ this.domain + '/' + this.collection + '#' + lnk);

          if(link.id && items[link.id])
            link.item = items[link.id];

          links.push(link);
        });
        cb(links);
      });
    });
  }

  load2Promise(cb){
    return new Promise((ok, no) => {
      this.load(item => {
        item?ok(item):no();
      });
    });
  }
}
