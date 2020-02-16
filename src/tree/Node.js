import types from '../neuro/types.js';
import Axon from '../neuro/Axon.js';
import diacritics from '../utilities/diacritics.js';

import account from '../account.js';

const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host, main {

    }

    :host {
      height: 100%;
    }

    main{
    }

    main > .app{
      display: none;
      width: 100%;
      height: 100%;
    }

    main > .app.selected{
      display: block;
    }
  </style>

  <main>
    <slot></slot>
  </main>
`;


export default class Node/* extends HTMLElement*/{
  constructor(item, extra){
    //super();
    if(!item) return;

    this.item = item;
    this.extra = extra;

    $.extend(this, extra);

    if(item.template){
      if(typeof item.template == 'string')
        Link(item.template).load(item => {
          delete item.id, item.name;
          this.template = item;
        });
      else
      if(item.template.length){
        // if array for later..
      }
      else
        this.template = item.template;
    }

    this.$element = $("<li></li>");

    var ini = this.ini = {
    //  type: 'neuron'
    };
    if(typeof item.extend == 'string'){
      this.extends = Link(item.extend);
      this.extends.load(item_ex => {
        $.extend(ini, item_ex, item);
        this.build();
      });
    }
    else{
      $.extend(ini, item);
      this.build();
    }
  }

  build(){
    //var id = 'node_'+md5(this.link.url);
    var $el = $("<li name='"+this.ini.name+"'></li>");
    this.$element.replaceWith($el);
    this.$element = $el;
    this.element = $el[0];

    $el.data(this.item);
    
    if(this.item.class)
      this.element.classList.add(this.item.class);

    $el.click(ev => {
      if(!ev.ctrlKey && this.tree)
        $(this.tree.shadowRoot).find('.tree .selected').not($el).removeClass('selected');

      //$el.toggleClass('selected');

      ev.stopPropagation();
    });


    this.determineType();

    $el[0].node = this;

    var $node = this.$node = $('<div>', {class: 'node'});
    $node.data(this.extra);
    $node.data('node', this);
    $node.css(this.item.style || {});

    this.initTr();

    var $a = this.$a;

    $el.prepend($node);

    var $ul = this.$list = $("<ul></ul>").attr('tid', this.item.id);
    $el.append($ul);

    //if(acc.user.super || (acc.user && $el.data('owner') == acc.user.id && $('#t'+item.tid).data('type') != 'fold' && !ini.noDrg))
    $node.drg({tree_root: this.tree.shadowRoot});
    this.link.checkOwnership(own => {
      $node.attr('draggable', own)  
    });

    if(!this.tree.attributes.nomenu)
      this.initMenu();

    if(this.ini.hide)
      $a.css('opacity', 0.5);

    var area;
    var tip_yaml = tippy(this.$node[0], {
      content: '..',
      arrow: true,
      interactive: true,
      trigger: 'manual',
      maxWidth: 600,
      placement: 'right',
      boundary: 'window',
      onTrigger: (instance, ev) => {
      },
      onShow: instance => {
        if(!account.user || !account.user.super)
           return false;

        if(area)
          return instance.setContent(area);
        
        area = document.createElement('textarea');
        area.value = jsyaml.dump(this.item);
        area.spellcheck = false;
        instance.setContent(area);
        _.extend(area.style, {
          width: '300px',
          height: '120px'
        });
        area.focus();

        area.onkeyup = ev => {
          if((ev.ctrlKey || ev.metaKey) && (ev.keyCode == 13 || ev.keyCode == 10)){
            let item = jsyaml.load(area.value);
            console.log(item);
            tippy.hideAll();
            this.link.set(item);
          }
        };
      }
    });

    $a.click(ev => {
      console.log(ev);
      if(ev.ctrlKey){
        tip_yaml.show();
      }
      else {
        if(ev.target.tagName != 'A') return;

        var event = new CustomEvent('click_node', {
          detail: {
            node: this
          },
          bubbles: true
        });
        this.element.dispatchEvent(event);

        if(this.item.type == 'folder') this.toggle();
      }
    });
    


    if(this.item.opened)
      this.toggle();
    else
    if(this.tree && this.tree.opened_ids && this.tree.opened_ids.indexOf(this.item.id) + 1)
      this.toggle();
  }

  isFolder(){
    return (this.ini.type == 'folder' || this.ini.type == 'fldr' || this.ini.type == 'directory');
  }

  remove(){
    $(this.$element).remove();
    if(this.link) this.link.remove();
  }

  rename(){
    this.$a.attr('contenteditable', false).blur();

    this.item.title = this.$a.text();

    if(!this.item.title){
      return this.remove();
    }

    this.$a.text(this.item.title);

    if(this.create){
      this.item.name = this.fix4name(this.item.title);
      this.item.parent = this.parent.link.url;
      //if(this.parent.item.template) $.extend(this.item, this.parent.item.template);
      
      var f = {
        item: this.item,
      };

      this.parent.link.add(this.item).then(link => {
        this.link = link;
        this.item = this.ini = link.item;
        this.$node.data({link});

        this.determineType();
        
        this.setup();

        this.initMenu();
        this.initContextmenu();

        this.$element.data(link.item);

        delete this.create;
      });

      //var [parent_url, parent_id] = this.item.parent.split('#');
      //this.link = Link(parent_url+'#'+randomString(8));
    }
    else
      this.link.set({title: this.item.title});
  }

  fix4name(url){
    var preserveNormalForm = /[,_`;\':-]+/gi
    url = url.replace(preserveNormalForm, ' ');

    for(var letter in diacritics)
      url = url.replace(diacritics[letter], letter);

    url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
    url = url.replace(/\s+/gi, '-');
    return url;
  }

  determineType(){
    var Neuron;

    if(this.ini.type && this.ini.type != 'file')
      Neuron = types[this.ini.type];
    else if(this.link){
      var ext = this.link.ext;
      if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext) + 1) Neuron = types['image'];
      else if(['js', 'json', 'yaml', 'html', 'css'].indexOf(ext) + 1) Neuron = types['source'];
      else if(['txt', 'htm'].indexOf(ext) + 1) Neuron = types['text'];
      else Neuron = types['file'];
    }

    if(!Neuron)
      Neuron = types['neuron'];
 
    this.Neuron = Neuron;


    this.neuron = new Neuron(this.item);
    this.neuron.link = this.link;
    this.neuron.node = this;
    this.neuron.tree = this.tree;
  }

  saveOrder(){
    var links = [];

    this.$list.children().each(function(){
      var $node = $(this).children('.node'),
          link = $node.data('link');

      links.push(link);
    });

    this.link.order(links);
  }

  initTr(){
    var item = this.item,
        ini = this.ini;

    var $tr = this.$tr = $("<div class='tr'></div>");

    var title = ini.title || ini.name || ini.path;

    if(item.type == 'input'){
      var $input = this.$a = $('<input>', {
        placeholder: title
      }).appendTo($tr);
    }
    else{
      var tag = 'a',
          attr = {};

      this.$a = $('<'+tag+'>', attr).blur(ev => {
        //this.rename();
      }).appendTo($tr);
      
      if(item.dom){
        let dom = item.dom;
        let tag, attr = {};
        if(typeof dom == 'string')
          tag = dom;
        else
        if(typeof dom == 'object'){
          tag = dom.name;
          if(dom.attributes)
            attr = dom.attributes; 
        } 

         this.$dom = $('<'+tag+'>', attr);
         if(item.dom.style) this.$dom.css(item.dom.style);
         this.$dom[dom.replace?'replaceWith':'appendTo']($tr);
          
         this.$dom.on('change', ev => {
            this.dispatch_update();
         });
          
         this.element.addEventListener('place', () => {
           let tree = this.getTree();
           if(tree && tree.item_link) tree.item_link.checkOwnership(own => {
             let input = this.$dom[0];
             if(input.type == 'radio'){
                if(own) this.$dom.removeAttr('disabled');
                else this.$dom.attr('disabled', true);
             }
             else{
                if(own) this.$dom.removeAttr('readonly');
                else this.$dom.attr('readonly', true);
             }
           });
         });
      }

      if(tag == 'a')
        this.$a.bind('keypress', ev => {
            if(ev.keyCode==13)
              this.rename();
            //	$(this).blur();
        }).text(title)
      else
      if(tag == 'input'){
        if(!attr.placeholder)
          this.$a[0].setAttribute('placeholder', title);
      }
    }

  	if(this.create && this.$a)
      this.$a.attr('contenteditable', true).focus();

    //$('<p>').text('Ac dsvasd ddd').appendTo($tr);

    this.$node.append($tr);

    this.setup();

    if(!this.create)
      this.initContextmenu();

    //if(item.available == 0) $a.css('color', '#AAA');
  }

  getTree(){
    var el = this.element;
    while(el.tagName != 'PINEAL-TREE'){
        el = el.parentNode;
        if(!el) return null;
    }
    return el;
  }


  dispatch_update(){
    var path = this.getPath(),
        value = this.value;
    
    if(this.$dom[0].type == 'radio'){
      path = this.parent.getPath();
      value = this.item.name;
    }

    var event = new CustomEvent('fractal_update', {
      detail: {value, path, node: this},
      bubbles: true
    });

    this.element.dispatchEvent(event);
  }
  
  get parent(){
    return this.$element.parent().closest('li')[0].node;
  }

  get value(){
    if(!this.$dom) return undefined;
    return this.$dom[0].value;
  }
  
  set value(val){
    console.log(val);
    if(this.item && this.item.type == 'select'){
      this.toggle().then(() => {
        var li = this.$list.children(`li[name='${val}']`)[0];

        if(li && li.node && li.node.$dom && li.node.$dom[0].type == 'radio')
          li.node.$dom[0].checked = true;
      });
      
      return;
    }

    if(!this.$dom || !val) return;
    var el = this.$dom[0];
    if(!el) return; 
    el.value = val;
  }

  initContextmenu(){
    this.link.checkOwnership(own => {
      if(!own) return;
      var $box = $('<div>', {
        class: 'contextmenu'
      });

      var tip = tippy(this.$icon[0], {
        content: $box[0],
        arrow: true,
        interactive: true,
        touchHold: true,
        maxWidth: 600,
        size: 'large',
        trigger: 'contextmenu',
        placement: 'bottom',
        animation: 'perspective',
        onShow(){
          tippy.hideAll();
        }
      });

      $('<h5>').text(this.link.url).appendTo($box);
      $('<i>', {
        title: 'Rename',
        class: 'icon fas fa-signature'
      }).click(ev => {
        var a = this.$a[0];
        if(!a) return;

        a.contentEditable = true;
        a.focus();
        tip.hide();
      }).appendTo($box);

      $('<paper-icon-button>', {
        title: 'Rename',
        icon: 'delete-forever'
      }).click(ev => {
        this.remove();
        tip.hide();
      }).appendTo($box);


      this.$a[0].addEventListener('contextmenu', ev => {
        ev.preventDefault();

        tip.show();
        return false;

        if(this.context)
          this.context.classList.remove('hide');
        else{
          this.context = document.createElement('fractal-options');
          this.context.setAttribute('src', this.link.url);
          this.$node.append(this.context);
        }

        return false;
      });
    });
  }

  setup(){
    var item = this.item,
        ini = this.ini;

    var $tr = this.$tr;


    this.icon();
    
    if(this.link)
      this.link.checkOwnership(own => {
        this.element.classList[own?'add':'remove']('own');
      });

    if(item.url) this.$a.attr({href: ini.url});
    //if(ini.url) $a.attr('href', ini.url);
    if(ini.type == 'site' && ini.domain) this.$a.attr('href', 'http://' + ini.domain);
    if(ini.url || ini.type == 'site') 
      this.$a.attr('target', (window.chrome && window.chrome.bookmarks)?'_self':'_blank');
  }

  add(item){
    let node = new Node(item, {
      create: true,
      tree: this.tree
    });

    this.$list.append(node.element);
    $(node.element).find('[contenteditable]').focus();
  }

  static init_addMenu(link, instance){
    console.log(link);
    if(link.addMenu){
      instance.setContent(link.addMenu)
    }
    else{
      let addMenu = link.addMenu = document.createElement('div');
      addMenu.style.width = '110px';
      let onceLoaded = ev => {
        console.log('loadeeeeeedgg');
        
        addMenu.removeEventListener('children_loaded', onceLoaded, false);

        if(ev.detail.node.link.url == link.url)
          instance.setContent(addMenu);

        addMenu.addEventListener('click_node', ev => {
          console.log(ev);
          let node = link.addMenu._node;
          var item = _.extend({},
            node.link.template,
            ev.detail.node.item,
            node.item.template,
            {title: '', name: ''}
          );

          if(item.children)
            delete item.children;

          console.log('addMenu.click_node',node, item);

          tippy.hideAll();
          node.add(item);
        }, false);
      };

      addMenu.addEventListener('children_loaded', onceLoaded);
      addMenu.innerHTML = "<pineal-tree nomenu src='"+link.url+"'></pineal-tree>";
    }

    link.addMenu._node = instance.reference.parentElement.parentElement.node;
  }

  initMenu(){
    this.$element.children('menu').remove();
    this.$menu = $('<menu>').insertAfter(this.$list);

    if(this.link){
      var plus = $('<button>', {
        class: 'fa fa-plus', 
        title: 'Add',
        type: 'button'
      }).appendTo(this.$menu)[0];

      if(this.link.noTemplates){
        $(plus).click(ev => {
          var item = _.extend({}, this.link.template, this.template, {title: '', name: ''});

          this.add(item);
        });
      }
      else{
        var link = Link('mem://self/Index.types.'+this.neuron.constructor.name+'.item');
        tippy(plus, {
          content: '..',
          arrow: true,
          interactive: true,
          placement: 'top',
          trigger: 'click',
          onShow: instance => {
            this.constructor.init_addMenu(link, instance);
          },
          onHide(){
            console.log("about to close");
          }
        });
      }
    }

    /*
    if(this.link && this.link.add && !this.link.noUpload)
      $('<button>', {class: 'fa fa-upload', title: 'Upload'}).click2ipfs({
        onComplete: hash => {
          let item = {
            name: hash,
            file: 'ipfs://'+hash
          };
          
          this.link.add(item).then(link => {
            let node = new Node(item, {
              tree: this.tree,
              link
            });

            this.$list.append(node.element);

            this.saveOrder();
          });
        }
      }).appendTo(this.$menu);

      /*
      .upl({uploader: f => {
        var path = (location.hostname + this.getPath()).replace(/^\/|\/$/g, '');

        var url = 'gaia://'+Index.blockstack_user.username+'@'+path+'/'+f.name;
        var link = new Link(url);

        return new Promise((ok, no) => {
          var reader = new FileReader();
          reader.onload = ev => {
            link.upload(reader.result).then(item => {
              let node = new Node(item, {
                parent: this,
                tree: this.tree,
                link
              });

              this.$list.append(node.element);
              this.saveOrder();
            });
          }

          reader.readAsArrayBuffer(f);
        });
      }}).appendTo(this.$menu);
      

    if(this.link && this.link.add && !this.link.noForeign && this.link.protocol != 'mem')
      $('<button>', {class: 'fa fa-link', title: 'Attach from url'}).upl({uploader: f => {
        
      
      }}).appendTo(this.$menu);
      */
  }

  getPath(){
    var path = '';
    var $parents = this.$node.parentsUntil('#root', 'li');
    
    $parents.each((i, li) => {
      path = (li.id !== 'root')?(li.attributes.name.value+'/'+path):'';
    });
    path = '/'+path.replace(/^\/|\/$/g, '');

    return path;
  }

  get path(){
    return this.getPath;
  }

  toggle(){
    var $ul = this.$node.nextAll('ul');

    return new Promise((ok, no) => {
      if($ul.hasClass('loaded')){
        $ul.slideToggle('fast', ev => {
          this.$node[ $ul.is(':visible')?'addClass':'removeClass']('opened');
          ok();
        });
      }
      else this.link.children(links => {
        $ul.empty();

        var left = links.length;
        links.forEach(link => {
          var $el = $('<li>').appendTo($ul);
          
          link.load(item => {
            if(!item){

              $el.remove();

              if(!--left) ok();
              return;
            }

            let node = new Node(item, {link, tree: this.tree});
            $el.replaceWith(node.element);

            if(!--left) ok();

            let event = new CustomEvent('place', {
              detail: {
                node: this
              },
              bubbles: false
            });
            node.element.dispatchEvent(event);
          });
        });

        setTimeout(ev => {
          $ul[this.$node.is(':visible')?'slideDown':'show'](ev => {
            this.$node.addClass('opened');
            var event = new CustomEvent('children_loaded', {
              detail: {
                node: this
              },
              bubbles: true
            });
            this.element.dispatchEvent(event);

          }).addClass('loaded');
        }, 80);
      });
    });
  }

  icon(icon){
    //if(this.ini.icon) this.$a.css('background-image', 'url('+Cfg.files+this.ini.icon+')');

    var icon = 'icons:check-box-outline-blank';

    if(this.ini.type == 'folder' || this.ini.type == 'fldr' || this.ini.type == 'directory')
      icon = 'square';

    if(this.ini.type == 'text' || this.ini.type == 'page')
      icon = 'file-alt';

    if(this.ini.type == 'catalog')
      icon = 'buffer';

    if(this.ini.type == 'gallery')
      icon = 'images';

    if(this.ini.type == 'item')
      icon = 'cube';

    if(this.ini.type == 'view')
      icon = 'sitemap';

    if(this.ini.type == 'image')
      icon = 'image';

    if(this.ini.type == 'file'){
      icon = 'file';

    if(['pdf'].indexOf(this.ext)+1)
      icon = 'file-pdf';

    if(['png','gif','jpg','jpeg'].indexOf(this.ext)+1)
      icon = 'file-image';

    if(['html','htm', 'xml'].indexOf(this.ext)+1)
      icon = 'file-code';
    }

    icon = this.neuron.icon || icon;

    var style = {};
    if(this.ini.color) style.color = this.ini.color;
    if(this.neuron.color) style.color = this.neuron.color;

    this.$icon = $('<i>').click(ev => {
      this.toggle();
    }).css(style);

    if(!this.$tr)
      this.$node.append(this.$icon);
    else
    if(this.$tr.prev().is('.icon'))
      this.$tr.prev().replaceWith(this.$icon);
    else
      this.$icon.insertBefore(this.$tr);

    if((''+this.item.icon).indexOf('://')+1)
      this.$icon.attr({src: this.item.icon});
    else
    if(this.item.icon)
      this.$icon.attr({class: 'icon fas '+this.item.icon});
    else
      this.$icon.attr({class: 'icon fas fa-'+icon});
  }
}


window.customElements.define('pineal-node', Node);
