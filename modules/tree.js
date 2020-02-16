var tree = {
	ext: /(?:\.([^.]+))?$/,
	$main: $(''),
	apps: [],
	types: [],

	index: 1,

};


///var opened = localStorage.getItem("tree_opened");

$(function(){
	tree.$ = $('#tree');



	function upload(evt){
		evt.preventDefault();

		var files = evt.target.files || evt.dataTransfer.files;
		if(!files)
			return false;

		var $fldr = $('.up');
		if(!$fldr.length)
			$fldr = $('#tree');

		var $focus = $('#tree .focus').parent().parent(),
			$ul = $focus.children('ul').eq(0);

		if(!$ul.length)
			$ul = $('#tree > li > ul');

		for (var i = 0, f; f = files[i]; i++){
			//if(f.size > j.max_size) continue;

			(function(f){
				var item = {
					type: 'file',
					name: f.fileName || f.name,
					tid: $ul.parent().data('id')
				};

				ws.upload(f, function(file){
					if(file){
						item.file = file.id;
						item.type = 'file';
						ws.send({
							cmd: 'save',
							collection: 'tree',
							item: item
						}, function(r){
							if(r.item){
								var $new = Tree.build(r.item);

								$ul.append($new);
								if(r.item.type == 'href' || r.item.type == 'file' || r.item.type == 'site')
									Tree.properties($new);
							}
						});
					}
				});
			})(f);
		}
		return false;
	}

	$('#tree')[0].addEventListener('drop', upload, false);
	$('#upl-tr').bind('change', upload);

	$('#upl-item').bind('change', function(ev){
		var $tr = $('#t' + $(this).data('tr'));
		ev.preventDefault();

		var files = ev.target.files || ev.dataTransfer.files;
		if(!files || !$tr.length) return false;

		var $fldr = $('.up');
		if(!$fldr.length)
			$fldr = $('#tree');

		var item = $tr.data();
		Tree.put(item, files[0], function(file){
			if($tr.hasClass('av'))
				$tr.children('a').click();
			$tr.removeClass('prp');
		});
	});

});
