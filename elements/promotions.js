class Promotions{
  constructor(){

  }

  build(a){
    var $el = $('<div>', {class: 'tree_item'});
  }

  generate(){
    randomString(6);

  }

  load(){
    Tree.load().then(items => {
      items.map(item => {
        
      });
    });
  }

  init(){
    var block = html`
      <div class='block'>
      </div>
    `;

    this.list = document.createElement('ul');

    var btn = this.generateButton = document.createElement('button');
    btn.innerText = 'generate';
    btn.onclick = ev => {
      randomString(4);
    };
    btn.appendChild(button);
  }
}
