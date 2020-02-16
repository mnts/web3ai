
const template = document.createElement('template');

export default class htm extends HTMLElement{
//  static icon = 'icons:description'
  constructor(item){
    super();
  }

  open(link){
    if(!this.app_div) this.initApp();

    Index.apps.element.open(this.app_div);
  }

  static get observedAttributes() {
    return ['src', 'name'];
  }

  connectedCallback(){
    this.reload();

    this.contentEditable = true;
    
    this.addEventListener('dragenter', this.handleDrag, false);
    this.addEventListener('dragover', this.handleDrag, false);
    this.addEventListener('drop', this.handleDrop, false);

    this.prevHTML = '';
    $(this).blur(ev => {
      if(this.innerHTML == this.prevHTML) return;
      this.link.upload(this.innerHTML);
      this.prevHTML = this.innerHTML;
    });
  }

  handleDrag(e){
    //kill any default behavior
    event.dataTransfer.dropEffect = 'copy';
    e.stopPropagation();
    e.preventDefault();
  }

  handleDrop(e){
    console.log(e);
    //kill any default behavior
    e.stopPropagation();
    e.preventDefault();
    //console.log(e);
    //get x and y coordinates of the dropped item
    var x = e.clientX;
    var y = e.clientY;
    
    var range;
    // Try the standards-based way first. This works in FF
    if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(x, y);
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse();
    }
    // Next, the WebKit way. This works in Chrome.
    else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
    }



    //drops are treated as multiple files. Only dealing with single files right now, so assume its the first object you're interested in
    var file = e.dataTransfer.files[0];
    //don't try to mess with non-image files
    if(file && file.type.match('image.*')){
        //then we have an image,

        //we have a file handle, need to read it with file reader!
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            //get the data uri
            var dataURI = theFile.target.result;
            //make a new image element with the dataURI as the source
            var img = document.createElement("img");
            img.src = dataURI;
            img.height = 50;


            range.insertNode(img);
        });
        //this reads in the file, and the onload event triggers, which adds the image to the div at the carat
        reader.readAsDataURL(file);
    }
    else{
      var $node = drg.$,
          $li = $node.parent(),
          node = $li[0].node;

      if(node.ini.type == 'folder'){        
        var element = document.createElement('pineal-folder');
        element.setAttribute('src', node.link.url);
        range.insertNode(element);
      }
      else{
        var element = document.createElement('pineal-item');
        element.setAttribute('item', JSON.stringify(node.item));

        /*
        if(node.link.item.url){
          var a = document.createElement('a');
          a.setAttribute('href', node.link.item.url);
          a.appendChild(element);
          range.insertNode(a);
        }
        else
        */

        range.insertNode(element);
      }
    }

    $(this).blur();
  }

  reload(){
    if(this.src) Link(this.src).load(item => {
      this.loadHTM();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.loadHTM();
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  initApp(){
    this.app_div = document.createElement('div');
    this.app_div.classList.add("app");
    this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }

  loadHTM(){
    this.link.download(content => {
      if(!content) return;
      this.prevHTML = this.innerHTML = typeof content == 'string'?
        content:
        new TextDecoder("utf-8").decode(content || '');
      this.focus();
    });
  }
}

window.customElements.define('pineal-htm', htm);