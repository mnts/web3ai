

export default class Neuron_polymer/* extends PolymerElement*/{
  constructor(item){
    console.log('Neuron: ', item);
  }

  open(link){
    console.log(this.constructor.name);
  }
}
