import types from './types.js';

export default class Axon{
	constructor(l){
		this.link = Link(l);
	}

	static link(l){
		this.link = Link(l);
		if(link.axon) link.axon = new Axon();
		link.axon.link = this.link;
	}

	get_neuron(){
		return new Promise((ok, no) => {
			if(this.neuron) return ok(this.neuron);
			
			this.link.load(item => {
				this.item = item;

				var Neuron;

				if(item.type && item.type != 'file')
				  Neuron = types[item.type];
				else if(this.link){
				  var ext = this.link.ext;
				  if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext) + 1) Neuron = types['image'];
				  else if(['js', 'json', 'yaml', 'html', 'css'].indexOf(ext) + 1) Neuron = types['source'];
				  else if(['txt', 'htm'].indexOf(ext) + 1) Neuron = types['text'];
				  else Neuron = types['file'];
				}

				if(!Neuron)
				  Neuron = types['story'];

				this.Neuron = Neuron;
				this.neuron = new Neuron(item);
				this.neuron.link = this.link;

				ok(this.neuron);
				//this.neuron.node = this;
				//this.neuron.tree = this.tree;
			});
		});
	}

	get neuro(){
		return (async () => {
            return await this.get_neuron();
        })();
	}
}