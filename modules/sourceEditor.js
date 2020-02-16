window.codeMirror = CodeMirror(document.getElementById('source'),{
	lineNumbers: true,
	lineWrapping: true,
	matchBrackets: false,
	indentWithTabs: true,
	smartIndent: false,
	tabSize: 3,
	indentUnit: 3,
	onCursorActivity: function(){
		codeMirror.setLineClass(hLine, null, null);
		//hLine = codeMirror.addLineClass(codeMirror.getCursor().line, null, "activeLine");
	}
});

window.Source = {
	defaultValue: '\n\n\n\n\n\n\n\n\n',
	ext: /(?:\.([^.]+))?$/,

	open: function(item){
		//Tree.activate(item.id);
		Site.openApp('source');
		$('title').text(item.title || item.name || ('#'+item.id));

		codeMirror.clearHistory();
		codeMirror.focus();
		codeMirror.setValue(Source.defaultValue);
		codeMirror.setValue('');

		var ext = (Source.ext.exec(item.name || '')[1] || '').toLowerCase();

		if(item.type == 'site')
			codeMirror.setOption('mode', 'htmlmixed');
		if(ext == 'js' || ext == 'json')
			codeMirror.setOption('mode', 'javascript');
		else if(['htm','html'].indexOf(ext)+1)
			codeMirror.setOption('mode', 'htmlmixed');
		else if(['xml','svg'].indexOf(ext)+1)
			codeMirror.setOption('mode', 'xml');
		else if(ext == 'css')
			codeMirror.setOption('mode', 'css');
		else if(['yml','yaml'].indexOf(ext)+1)
			codeMirror.setOption('mode', 'yaml');

		var admin = Acc.user && Acc.user == item.owner;
		codeMirror.setOption('readOnly', admin);

		$('#source-download').showIf(item.file);
		$('#source-saveObject').hide();


		var admin = Acc.user && (Acc.user.id == item.owner || Acc.user.super);
		$('#source .admin').showIf(admin);
		$('#source-download').showIf(item.file && admin);
		$('#source-openSite').showIf(item.type == 'site');

		this.item = item;

		if(item.file)
			ws.download(item.file).then(function(data, file){
				Source.data = new TextDecoder("utf-8").decode(data);

				codeMirror.setValue(Source.data || '');
				codeMirror.refresh();
			},'text');
	},

	openObject: function(item, collection){
		Site.openApp('source');

		var itemY = jsyaml.safeDump(item)

		codeMirror.clearHistory();
		codeMirror.focus();
		codeMirror.setValue(Source.defaultValue);
		codeMirror.setValue(itemY);

		codeMirror.setOption('mode', 'yaml');

		$('#source-download, #source-save, #source-openSite').hide();
		$('#source-saveObject').show();
	},

	save: function(){
		Source.put(this.item, codeMirror.getValue()).then(function(){
			$('#source-save').blink('green')
		});
	},

	put: function(item, data){
		return new Promise(function(resolve, rect){
			if(typeof item.file == 'number')
				ws.upload(data, function(r){
					resolve(r);
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
						$('#t'+item.id).data('file', file.id);

						resolve(file);
					}
					else
						reject(file);
				});
		});
	},


	saveObject: function(item){
		$('#source-download, #source-save, #source-openSite').hide();

		var item = jsyaml.safeLoad(codeMirror.getValue());
		var q = {
			cmd: 'update',
			set: item,
			collection: Source.collection4object
		};

		W(q, r => {
			$('#source-saveObject').blink((r.item)?'green':'red');

			if(!q.collection || q.collection == 'tree'){
				var $prp = $('#tree .av');
				if($prp.length){
					var $item = Tree.build(item).addClass('av');
					$prp.replaceWith($item);
				}
			}
		});
	},

	loadTheme: function(name){
		codeMirror.setOption("theme", name);
		var path = Cfg.libs+'CM_themes/'+name+'.css';
		if($('link[path="'+path+'"]').length) return;
		$('<link>', {
			type: 'text/css',
			rel: 'stylesheet',
			href: path
		}).appendTo('head');
	}
}

Site.load = function(hash){
	var id = hash;

	if(!isNaN(id))
		id = parseInt(id);

	ws.send({
		cmd: 'get',
		collection: 'tree',
		filter: {id: id}
	}, function(m){
		if(m.item){
			Source.open(m.item);
		}
	});
}


$(function(){
	var hLine;

	//hLine = codeMirror.addLineClass(0, "activeLine");;

	function saveSource(){
		Source.save();
		return false;
	};

	$('#source-theme').tip({
		id: 'source-themes',
		ba: function(){
			if($('#source-themes > div').length) return;

			ws.send({
				cmd: 'load',
				filter: {
					tid: Cfg.ids.themes
				}
			}, function(r){
				(r.items || []).forEach(function(item){
					var nameA = item.name.split('.');
					nameA.pop();
					var name =  nameA.join('.');
					$('<div>').data(item).text(name).appendTo('#source-themes');
				});

				$('#source-themes > div').click(function(){
					var name = this.textContent
					var item = $(this).data();
					Source.loadTheme(name);
					Cookies.set('theme', name);
				});
			});
		}
	});

	var theme = Cookies.get('theme');
	if(theme) Source.loadTheme(theme);

	//$(window).bind('keydown', 'Ctrl+s', saveSource);

	$('#source-save').click(saveSource);
	$('#source-saveObject').click(Source.saveObject);

	$('#source-upload').click(function(){
		$('#upl-source').click();
	});

	$('#upl-source').bind('change', function(evt){
		var reader = new FileReader();
		reader.readAsText(evt.target.files[0]);

		reader.onloadend = function(){
			codeMirror.setValue(reader.result);
		}
	});

	$('#source-download').click(function(ev){
		var item = $('#tree .av').data('file');
		document.location = '/' + item.file;
	});

	$('#switchAdm').click(function(){
		if($('#source').is(':visible') | $('.pg:not(#switchAdm)').hide())
			$('#tool').html(codeMirror.getValue()).show().find('.check').click(ev.check);
		else{
			$('#source').show();
			codeMirror.focus();
		}
	});

});

//Tree.types.source = Source.open;
