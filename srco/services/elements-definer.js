const container = document.getElementById('menu-container');
const placeholder = container.querySelector('.menu-placeholder');
// Fetch all the children of menu that are not yet defined.
const undefinedElements = container.querySelectorAll(':not(:defined)');

const promises = [...undefinedElements].map(
  button => customElements.whenDefined(button.localName)
);

// Wait for all the children to be upgraded, 
// then remove the placeholder.
await Promise.all(promises);
container.removeChild(placeholder);

var names2links = {

};

Link('fs://self/src/components').children(links => {
	links.map(link => {
		if(link.name.indexOf('.js')+1)
			names2links[link.name.substr(0, link.name.indexOf('.js'))] = link;
	});

	check2define();
});

export function check2define(){
	var undefinedElements = document.querySelectorAll(':not(:defined)');
	const promises = [...undefinedElements].map(element => {
		let name = element.localName;
		if(name.indexOf('-') < 0) return;

		var link = paths[name];
		if(link)
			Link(paths[name]).import();

		let promise = customElements.whenDefined(name);
		return promise;
	});

	conole.log(promises);

	await Promise.all(promises);

	console.log('All preloaded', undefinedElements);
}