import Node from '../../tree/Node.js';

const url = new URL(import.meta.url);

export default class Tree extends HTMLElement{
	static get is(){
    return 'pineal-tree';
  	}

	static get template(){
   	return`
   		
		<style>
			.tree {
				position: relative;
				width: 100%;
				transition: margin-left .4s;
				display: inline-block;
				vertical-align: top;
				z-index: 29;
			}
		</style>
		
		<div class='tree light loading'></div>
	`;
   }

	constructor(){
		super();
		this.tid = {
			acc: 1
		}

		this.items = {};
		this.files = {};
		
		if(this.attributes.shadow){
			this.attachShadow({ mode: 'open' });
			this.root = this.shadowRoot;
			this.root.innerHTML = Tree.template;
		}
		else{
			this.innerHTML = Tree.template;
			this.root = this;

			var src_style = '//'+url.host+'/design/tree.css';
			if(!$('link[href="'+src_style+'"]').length)
	      		$('<link>', {href: src_style, rel:"stylesheet"}).appendTo('body');
		}


		this.main = this.root.querySelector('.tree');

		/*
		this.root.querySelector('#changeColor').addEventListener('color-picker-selected', ev => {
			let color = ev.detail.color;
			chrome.storage.sync.set({color});
			Index.setColor(color);
		});
		*/
		
		this.init();

		var default_url = 'mongo://'+Cfg.api+'/tree'+
			(this.attributes.mongo_id?
				('#'+this.attributes.mongo_id.value):
				('?domain='+location.host)
			);

		var link = Link(
			this.attributes.src?
				this.attributes.src.value:
				default_url
		);

		if(this.attributes.opened){
			this.opened_ids = this.attributes.opened.value.split(/\s+/);
		}
		
		link.load(item => {
			if(item){
				let node = new Node(item, {link, tree: this});
				node.$element.attr('id', 'root');
				node.$node.addClass('hide');
				node.$list.css({paddingLeft: 0, marginLeft: 0});
				node.toggle();
				$(this.root).find('.tree').append(node.element);
			}
			else
				console.log('No tree');
			
			this.main.classList.remove('loading');
		});

        this.addEventListener('fractal_update', ev => {
			if(!this.item_link) return;

			var node = ev.target.node;
			const path = ev.detail.path.replace(/^\/|\/$/g, '').replace(/\//g, '.'),
				  value = ev.detail.value;

			if(value){
				this.item_link.set(path, value);
			}
        })
	}

	connectedCallback(){

	}
	
	static get observedAttributes(){
		return ['src', 'item_src'];
	}

	setSrc(url){
	  this.link = Link(url);
	  this.load();
	}

	attributeChangedCallback(name, oldValue, newValue){
		switch(name){
		  case 'item_src':
			this.item_link = Link(newValue);
			this.listen_children();
			break;
		}
	}

	listen_children(){
		this.item_link.load(item => {
			function set(li){
				let node = li.node;
				if(!node) return;
				let path = node.getPath().replace(/^\/|\/$/g, '').replace(/\//g, '.');
				node.value = _.get(item, path);
			}

			this.main.querySelectorAll('li:not(#root)').forEach((li, i) => {
				set(li);
			});

			this.addEventListener('children_loaded', ev => {
				ev.detail.node.$list.children().each((i, li) => {
					set(li);
				});
			});
		});
	}

	build(item, extra = {}){
		extra.tree = this;
	  let node = new Node(item, extra);

	  return $(node.element);
	}

	query(cmd, m){
		return new Promise( (ok, no) => {
			ws.send($.extend(m, {
				collection: 'tree',
				cmd
			}), ok);
		});
	}

	set(id, set){
		this.query('update', {id, set});
	}

	get(by){
		var f = {
			cmd: 'get',
			collection: 'tree'
		};

		return new Promise((ok, no) => {
			if(typeof by == 'string' || typeof by == 'number') f.id = by;
			else if(by.length) f.filter = {id: {$in: by}};
			else if(typeof by == 'object') f.filter = by;
			else return no();

			var cmd = (typeof by == 'object' && by.length)?'load':'get';

			this.query(cmd, f).then(r => {
				(r.item || r.items)?ok(r.item || r.items):no(r);
			});
		});
	}

	load(by){
		var f = {
			cmd: 'load',
			collection: 'tree'
		};


		if(typeof by == 'string') f.tid = by;
		else if(by.length) f.filter = {id: {$in: by}};
		else if(typeof by == 'object') f.filter = by;
		else return;

		return new Promise((ok, no) => {
			this.query('load', f).then( r => {
				r.items?ok(r.items):no(r);
			});
		});
	}

	set(id, set){
		var f = {
			set, id
		};

		return new Promise((ok, no) => {
			this.query('update', f).then( r => {
				var item = $.extend(r.item, set);
				$(this.root).find('.tree_item[id$="'+item.id+'"]').trigger('update', {set});

				var $item = this.build(item);
				$(this.root).find('#t'+item.id).replaceWith($item);

				ok(item);
			});
		});
	}

	children(tid, cb){
		var item = $(this.root).find('#t'+tid).data();

		if(!item.children){
			var $t = $(this.root).find('#t'+tid+' > ul');

			$t.empty().addClass('loaded');
			$t.triggerHandler('loaded');

			(cb || CB)();
			return;
		}

		var lnk = Link('mongo://'+Cfg.api+'/tree#'+tid);

		lnk.children(links => {
		  var $t = $(this.root).find('#t'+tid+' > ul');
			if(!$t.length) return;


			$t.empty().addClass('loaded');

			links.forEach(function(link){
				var $tmp = $('<li>').appendTo($t);
				link.load(item => {
					if(item.hide && (!Acc.user || Acc.user.id != item.owner)) return;

					let node = new Node(item, {link});

					$tmp.replaceWith(node.element);
				});
			});

			//Tree.preloadFiles();
			//tree.construct($ul);]

			$t.triggerHandler('loaded');

			if(cb) cb();
		});
	}

	saveOrder(tid){
		let children = [];
		$(this.root).find('.tree ul[tid='+tid+'] > li').each((i, item) => {
			children.push(item.id.substr(1));
		});

		this.set(tid, {children});
	}

	add(item){
		var f = {item};
		return new Promise((ok, no) => {
			this.query('save', f).then( r => {
				if(item.tid) $(this.root).find('.tree_item[id$="'+r.item.tid+'"]').trigger('add', {item: r.item});
				ok(r.item);
			});
		});
	}

	preload(item){
		var $t = $(this.root).find('#t'+item.tid+' > ul');

		if(!$t.length) return;

		$t.addClass('loaded');

		var $item = this.build(item);
		$t.children('#t'+item.id).remove();
		$item.prependTo($t);

		$t.triggerHandler('loaded');

		$t.slideDown(90).addClass('up');

		return $item;
	}

	preloadFiles(){
		var ids = [];
		var $files = $(this.root).find('.tree .branch-file:not(.loaded, .error)');
		$files.each(function(){
			var item = $(this).data();
			ids.push(item.file);
		});

		return new Promise((resolve, reject) => {
			if(!ids.length) return resolve();

			ws.send({
				cmd: 'load',
				filter: {
					id: {$in: ids},
				},
				collection: 'files'
			}, r => {
				(r.items || []).forEach(item => {
					this.files[item.id] = item;
				});

				$files.each(() => {
					var $file = $(this),
						file = this.files[$file.data('file')];

					if(!file) return $file.addClass('error');

					$file.data(file);

					var size = new Sugar.Number(file.size);
					$('<span>', {
						class: 'branch-fileSize',
					}).text(size.bytes()).appendTo($file);

					$file.addClass('loaded');
				});

				resolve(r.items);
			});
		});
	}

	properties($tr){
		$(this.root).find('.prp').removeClass('prp');
		var $el = $tr.addClass('prp');
		//$(this.root).find('#prp .prp').hide();

		var item = $el.data();

		Properties.collection = 'tree';
		Properties.get(item.id, 'tree');
	}

	openApp(name){
		$('.app').hide();
		return $(name).show();
	}

	activate(id){
		var $el = $(this.root).find('#t'+id);
		$(this.root).find('.tree .av').removeClass('av');
		$el.addClass('av');
		return $el;
	}

	put(item, data, cb){
		if(item.file)
			ws.upload(data, function(r){
				if(cb) cb();
			}, {id: item.file});
		else
			ws.upload(data, function(file){
				if(file){
					ws.send({
						cmd: 'update',
						collection: 'tree',
						set: {
							file: file.id
						},
						id: item.id
					});

					item.file = file.id;
					$(this.root).find('#t'+item.id).data('file', file.id);

					if(cb) cb();
				}
			});
	}

	init(){
		$(this.root).find('#opt-object').click(function(){
			var node = $(this.root).find('.tree .focus').parent().parent().data('node');

			var Neuron = Index.types.neuron;
			node.neuron = new Neuron(this.item);
			node.neuron.node = node;
			node.neuron.link = node.link;
			node.neuron.open();
		});


		//this.root.addEventListener('dragover', q.p, false);
	}

	update(id){
		var $el = $(this.root).find('#t'+id),
			$a = $el.children('.node').children('a');

		var visible = $el.children('ul').is(':visible');
		$a.parent()[q.ar(visible)]('opened');

		$(this.root).find('.tree, .tree .up').removeClass('up');
		$el.children('ul')[q.ar(visible)]('up');
		$el.children('.btns')[q.sh(visible)]();

		tree.update_opened();
		tree.check();
	}
};

window.customElements.define(Tree.is, Tree);