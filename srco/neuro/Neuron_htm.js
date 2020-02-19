export default class Neuron{
  constructor(item){
    console.log('Neuron: ', item);
  }

  open(link){
    console.log(this.constructor.name);
  }
}
