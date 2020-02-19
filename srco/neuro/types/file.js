import Neuron from '../Neuron.js';
export default class file extends Neuron{
//  static icon = 'icons:description'
  constructor(item){
    super(item);
  }

  open(link){
    link.load(item => {
      var ext = (/(?:\.([^.]+))?$/.exec(item.name)[1] || '').toLowerCase();
      if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext) + 1)
        this.image(link);
      else if(['htm','html','css','js','json','xml','svg','txt','log','yml','yaml'].indexOf(ext) + 1){
        this.source(link);
      }
    });
  }
}
