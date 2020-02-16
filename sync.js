let db = new zango.Db('fractal', {
	files: ['id', 'domain', 'path', 'owner']
});

let files = db.collection('files');

files.find({sync: {$exists: false}}).toArray().then(items => {
	items.map(item => {
		var content = item.content;
		delete item.content;
		ws.upload(item, r => {

		}, item);
	});
});