
const template = document.createElement('template');

var url = new URL(import.meta.url);


export default class Component extends HTMLElement{
//  static icon = 'icons:description'

  static get is(){
    return 'fractal-htm';
  }

  static get template(){
    return `
      <style>
        #main_header{}

        article{
          min-height: 32px;
        }

        main{
        	height: inherit;
        }
      </style>

      <link rel="stylesheet" href="//${url.host}/design/interface.css" type="text/css">
      <link rel="stylesheet" href="//${url.host}/design/textEditor.css" type="text/css">
      <link rel="stylesheet" href="//${url.host}/design/passion.css" type="text/css">
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">


      <main>
        <article class='passion'></article>
      </main>
    `;
  }

  constructor(item){
    super();

    this.attachShadow({ mode: 'open' });
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];

    this.init();
  }

  init(){
    this.shadowRoot.innerHTML = this.constructor.template;

    this.main = this.$("main");
    this.article = this.$("article");

    this.article.innerHTML = this.innerHTML;

    this.initEditor();
  }

  handleDrag(e){
    //kill any default behavior
    ev.dataTransfer.dropEffect = 'copy';
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
      return;
      var $node = drg.$,
          $li = $node.parent(),
          node = $li[0].node;

      if(node.ini.type == 'folder'){        
        var element = document.createElement('fractal-folder');
        element.setAttribute('src', node.link.url);
        range.insertNode(element);
      }
      else{
        var element = document.createElement('fractal-item');
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

  attributeChangedCallback(name, oldValue, newValue){
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.loadHTM();
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
      case 'editable':
        //this.article.setAttribute('contentEditable', !!newValue);
        break;
    }
  }

  static get observedAttributes() {
    return ['src', 'name', 'editable'];
  }

  initEditor(){
    //this.article.setAttribute('contentEditable', !!this.getAttribute('editable'));
	var $editor = $('<div>', {id: "editor", class: 'o', style: 'display: none'}).appendTo(this.main);
	
	/*
	$('<button>', {title: 'save', class: 'fa fa-save'}).click(ev => {
		
	}).appendTo($editor);
	*/

	$('<button>', {title: 'bold'}).css({fontWeight: 'bold'}).text('B').click(ev => {
		document.execCommand('bold', false, null);
	}).appendTo($editor);

	$('<button>', {title: 'italic'}).css({fontStyle: 'italic'}).text('I').click(ev => {
		document.execCommand('italic', false, null);
	}).appendTo($editor);
	
	$('<button>', {title: 'underline'}).css({textDecoration: 'underline'}).text('U').click(ev => {
		document.execCommand('underline', false, null);
	}).appendTo($editor);
	
	$('<button>', {title: 'Simple list', class: 'fa fa-list-ul'}).click(ev => {
		document.execCommand('InsertUnorderedList', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'Ordered list', class: 'fa fa-list-ol'}).click(ev => {
		document.execCommand('InsertOrderedList', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'indent', class: 'fa fa-indent'}).click(ev => {
		document.execCommand('indent', false, null);
	}).appendTo($editor);
	$('<button>', {title: 'outdent', class: 'fa fa-outdent'}).click(ev => {
		document.execCommand('outdent', false, null);
	}).appendTo($editor);

	$('<button>', {title: 'Paragraph'}).text('P').click(ev => {
		document.execCommand('FormatBlock', false, 'p');
	}).appendTo($editor);

	$('<button>', {title: 'Header1'}).text('H1').click(ev => {
		document.execCommand('FormatBlock', false, 'h1');
	}).appendTo($editor);

	$('<button>', {title: 'Header2'}).text('H2').css({fontSize: '12px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h2');
	}).appendTo($editor);

	$('<button>', {title: 'Header3'}).text('H3').css({fontSize: '11px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h3');
	}).appendTo($editor);

	$('<button>', {title: 'Header4'}).text('H4').css({fontSize: '10px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h4');
	}).appendTo($editor);

	$('<button>', {title: 'Header5'}).text('H5').css({fontSize: '9px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h5');
	}).appendTo($editor);

	$('<button>', {title: 'Header6'}).text('H6').css({fontSize: '8px'}).click(ev => {
		document.execCommand('FormatBlock', false, 'h6');
	}).appendTo($editor);

	$('<button>', {title: 'Horizontal line'}).text('-').click(ev => {
		document.execCommand('insertHorizontalRule', false, null);
	}).appendTo($editor);


	$('<button>', {title: 'Undo', class: 'fa fa-undo'}).click(ev => {
		document.execCommand('undo', false, null);
	}).appendTo($editor);

	
	$('<button>', {title: 'Redo', class: 'fa fa-redo'}).click(ev => {
		document.execCommand('redo', false, null);
	}).appendTo($editor);


	$('<button>', {title: 'clean up', class: 'fa fa-broom'}).click(ev => {
		$(this.article).find('*').removeAttr('style class id');
		$(this.article).find('style, script, iframe, img, audio, video').remove();
	}).appendTo($editor);

	var hide = true;

	$editor.mousedown(function(){
		hide = false;
	});
    
	$('#textEditor-save').click(function(){
		TextEditor.save();
	});
   

    this.article.addEventListener('dragenter', this.handleDrag, false);
    this.article.addEventListener('dragover', this.handleDrag, false);
    this.article.addEventListener('drop', this.handleDrop, false);


    
	this.article.addEventListener('focus', ev => {
		$editor.slideDown('fast');
	});

    this.article.prevHTML = '';
	this.article.addEventListener('blur', ev => {
        console.log(hide, ' blur ', ev);
		if(hide) $editor.slideUp('fast');
		else hide = true;

      if(this.article.innerHTML == this.article.prevHTML) return console.error('not changed');
      this.link.upload(this.article.innerHTML);
      this.prevHTML = this.innerHTML;
	});
  }
  
  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  loadHTM(){
    if(!this.link) return;
    this.link.load(item => {
		this.link.download(content => {
			if(!content) return this.article.innerHTML = this.innerHTML;

			this.article.prevHTML = this.article.innerHTML = typeof content == 'string'?
				(content || this.innerHTML):
				new TextDecoder("utf-8").decode(content || this.innerHTML || '');

			this.article.focus();
		});

		  this.link.checkOwnership(own => {
		  	console.log(own);
			own?
				this.article.setAttribute('contenteditable', true):
				this.article.removeAttribute('contenteditable');
		  });
    });
  }
}

window.customElements.define(Component.is, Component);