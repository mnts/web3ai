import Link from './Link.js';

export default class LinkMain{
  constructor(url){
    this.children_key = 'children';
  }

  order(links){
    var children = [];
    links.forEach(link => {
      if(link) children.push(link.url);
    });

    var set = {};
    set[this.children_key] = children;
    this.set(set);
  }

  children(cb){
    this.load(item => {
      var links = [];
      (item[this.children_key] || []).forEach(url => {
        if(url.indexOf('://')<0)
          url = this.url.replace(/\/$/, "") + '/' + url;
        
        var link = new Link(url);
        links.push(link);
      });
      cb(links);
    });
  }

  inject(where){
    this.load(item => {
      this.download(content => {
        if(item.name.indexOf('.js')){

        }
      });
    });
  }

  import(cb){
    import(this.http).then(module => {
      if(typeof cb == 'function')
        cb(module);
    });
  }

  

  checkOwnership(cb){
    this.load(item => {
      let check = (account) => {
        if(account.user)
           account.user.load(user => {
             if(item.owner){
               if(typeof item.owner == 'string')
                 this.own = !!(item.owner == user.owner);
               else
               if(Array.isArray(item.owner))
                 this.own = !!(item.owner.indexOf(user.owner) + 1);
               else
               if(account.is_admin)
                 this.own = true;
               else
                 this.own = false; 
             }
             else
               this.own = false;
             cb(this.own);
           });
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

  tryDefault(cb){
    var def = Lib.defaults[this.url];
    if(def){
      this.default = def;
      if(typeof def == 'string')
        Link(def).load(item => {
          cb(this.item = item);
        });
      else
      if(typeof def == 'object')
        cb(this.item = def);
    }
  }
}