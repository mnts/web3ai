import LinkMain from './LinkMain.js';
export default class Link_localStorage extends LinkMain{
  constructor(url){
    super(url);

    this.url = this.link = url;
    this.own = true;

    if(url.indexOf('://')){
      var [protocol, way] = url.split('://');
      this.protocol = protocol;
      this.way = '/'+way;
    }
  }

  add(item){
    var doSet = {};
    var path = this.way;
    if(path[path.lenth-1] != '/') path += '/';
    path += item.name;
    return new Promise((ok, no) => {
      console.log('object$'+path);
      localStorage.setItem('object$'+path, JSON.stringify(item));

      let url = this.protocol+'://'+path.substr(1);
      let link = Link(url);
      link.item = item;

      this.load(itm => {
        let children = itm.children || [];
        children.push(item.name);

        this.set({children});

        ok(link);
      });
    });
  }

  upload(data){
    return new Promise((ok, no) => {
      var cont = localStorage.setItem('content$'+this.way, data);
      ok(cont);
    });
  }

  download(cb){
    var cont = localStorage.getItem('content$'+this.way);

    cb(cont);
  }

  remove(cb){
    localStorage.removeItem('object$'+this.way);
  }

  set(set){
    this.load(item => {
      _.extend(item, set);
      var path = 'object$'+this.way;
      console.log(path, item);
      localStorage.setItem(path, JSON.stringify(item));
    });
  }

  load(cb){
    var cont = localStorage.getItem('object$'+this.way);
    if(cont){
      if(cont[0] && cont[cont.length-1]){
        var item = JSON.parse(cont);
        cb(item);
      }
    }
    else{
      this.tryDefault(cb);
    }
  }
}
