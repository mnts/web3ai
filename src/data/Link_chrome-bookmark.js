import Link from './Link.js';

export default class Link_chrome_b{
  constructor(url){
    this.url = this.link = url;

    this.noUpload = true;
    this.noTemplates = true;

    this.own = true;

    if(url.indexOf('://')){
      var [protocol, id] = url.split('://');
      this.protocol = protocol;
      this.id = id;
    }
  }

  set(set){
    return new Promise((ok, no) => {
      chrome.bookmarks.update(this.id, set, ok);
    });
  }

  remove(set){
    return new Promise((ok, no) => {
      chrome.bookmarks.remove(this.id, ok);
      this.item = false;
    });
  }

  add(item){
    item = _.pick(item, 'title');
    item.url = prompt('Enter URL (folder if empty)');
    if(!item.url) delete item.url;

    item.parentId = this.id;

    return new Promise((ok, no) => {
      chrome.bookmarks.create(item, bmark => {
        let link = Link(this.protocol+'://'+bmark.id);
        link.item = this.format(bmark);

        ok(link);
      });
    });
  }

  
  checkOwnership(cb){
    cb(true);
  }


  move(index, parentId){
    return new Promise((ok, no) => {
      chrome.bookmarks.move(this.id, {index, parentId}, res => {
        console.log(res);
        ok(res);
      });
    });
  }

  order(links){
    var children = [];
    links.forEach(link => {
      var p = link.url.split('/');
      p.pop();
      var folder = p.join('/').replace(/^\/|\/$/g, '');

      var isParent = (this.url.replace(/^\/|\/$/g, '') == folder);

      children.push(isParent?link.name:link.url);
    });

    var set = {};
    set[this.children_key] = children;
    this.set(set);
  }

  format(info){
    var item = {
      pid: info.parentId,
      time: info.dateAdded,
      position: info.index
    };

    _.extend(item, _.pick(info, 'title', 'url', 'id'));

    if(!item.title && item.id === '0')
      item.title = 'chrome Bookmarks';

    if(item.url)
      item.icon = 'chrome://favicon/'+item.url;
    else
      item.type = 'folder';

    return item;
  }

  children(cb){
    chrome.bookmarks.getChildren(this.id, list => {
      let links = [];
      list.forEach(bmark => {
        let link = Link('chrome-bookmark://'+bmark.id);
        link.item = this.format(bmark);

        links.push(link);
      });

      cb(links);
    });
  }

  load(cb){
    var itm = this.item;
    if(itm){
      if(itm instanceof Promise)
        return itm.then(item => cb(item)).catch(err => {
          n(err);
        });
      return cb(itm);
    }

    this.item = new Promise((k, n) => {
      chrome.bookmarks.get(this.id, r => {
        var item = this.format(r[0]);
        cb(item);
        k(item);
      })
    });
  }
}
