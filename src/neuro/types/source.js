import Neuron from '../Neuron.js';

export default class source extends Neuron{
//  static icon = 'icons:description'
  static get item(){
    return {
      type: 'source',
      title: 'Code'
    }
  }

  constructor(item){
    super(item);

    this.icon = 'code';
    this.defaultValue = '\n\n\n\n\n\n\n\n\n';
  }

  initApp(){
    this.initScripts();

    this.app_div = this.container = document.createElement('div');
    this.container.classList.add('app');
    this.container.link = this.link;
    this.app_div.id = 'app-'+md5(this.link.url);

    var codeMirror = this.codeMirror = CodeMirror(this.app_div, {
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: false,
      indentWithTabs: true,
      smartIndent: false,
      tabSize: 3,
      indentUnit: 3,
      onCursorActivity: function(){
        codeMirror.setLineClass(hLine, null, null);
        //hLine = codeMirror.addLineClass(codeMirror.getCursor().line, null, "activeLine");
      }
    });

    this.$footer = $('<footer>').appendTo(this.container);
 
    $('<button>').text('Save').click(ev => {
      ev.target.classList.add('loading');
      this.link.upload(this.codeMirror.getValue()).then(file => {
        ev.target.classList.remove('loading');
        $(ev.target).blink('green');
      });
    }).appendTo(this.$footer);

    this.append();
  }

  initScripts(){
    if(!$('script[src$="codemirror.js"]').length){
      $('<link>', {href: '/lib/codemirror.css', rel:"stylesheet"}).appendTo('body');
      $('<script>', {src: '/lib/codemirror.js'}).appendTo('body');
      $('<script>', {src: '/lib/CM-modes/javascript.js'}).appendTo('body');
      $('<script>', {src: '/lib/CM-modes/xml.js'}).appendTo('body');
      $('<script>', {src: '/lib/CM-modes/css.js'}).appendTo('body');
      $('<script>', {src: '/lib/CM-modes/htmlmixed.js'}).appendTo('body');
      $('<script>', {src: '/lib/CM-modes/yaml.js'}).appendTo('body');
      $('<link>', {href: '/design/source.css', rel:"stylesheet"}).appendTo('body');
    }
  }

  open(link){
    if(!this.app_div) this.initApp();

    this.select();

    this.codeMirror.refresh();

    if(!this.isLoaded) this.link.load(item => {
      var codeMirror = this.codeMirror;
      codeMirror.clearHistory();
      codeMirror.focus();
      codeMirror.setValue('  ');

      var ext = (/(?:\.([^.]+))?$/.exec(item.name || '')[1] || '').toLowerCase();

      if(item.type == 'site')
        codeMirror.setOption('mode', 'htmlmixed');
      else
      if(ext == 'js' || ext == 'json')
        codeMirror.setOption('mode', 'javascript');
      else
      if(['htm','html'].indexOf(ext)+1)
        codeMirror.setOption('mode', 'htmlmixed');
      else
      if(['xml','svg'].indexOf(ext)+1)
        codeMirror.setOption('mode', 'xml');
      else
      if(ext == 'css')
        codeMirror.setOption('mode', 'css');
      else
      if(['yml','yaml'].indexOf(ext)+1)
        codeMirror.setOption('mode', 'yaml');

      //codeMirror.setOption('readOnly', admin);

      $('#source-download').showIf(item.file);
      $('#source-saveObject').hide();


      var admin = true;
      $('#source .admin').showIf(admin);
      $('#source-download').showIf(item.file && admin);
      $('#source-openSite').showIf(item.type == 'site');

      this.link.download((data, file) => {
        //Source.data = String.fromCharCode.apply(null, data);

        this.data = (typeof data == 'string')?
          data:
          (new TextDecoder("utf-8").decode(data));

        codeMirror.focus();
        codeMirror.setValue(this.data || '');
        codeMirror.refresh();

        this.isLoaded = true;
      });

      /*
      setTimeout(function(){
        codeMirror.refresh();
      }, 90);
      */
    });
  }

  openObject(item, collection){
    Site.openApp('source');


    var itemY = jsyaml.safeDump(item);

    console.log(itemY);

    codeMirror.clearHistory();
    codeMirror.focus();
    codeMirror.setValue(Source.defaultValue);
    codeMirror.setValue(' ');

    codeMirror.setOption('mode', 'yaml');

    setTimeout(() => {
      codeMirror.setValue(itemY);
    }, 100);

    $('#source-download, #source-save, #source-openSite').hide();
    $('#source-saveObject').show();
  }

  saveObject(item){
    $('#source-download, #source-save, #source-openSite').hide();

    var item = jsyaml.safeLoad(codeMirror.getValue());
    var q = {
      cmd: 'update',
      set: item,
      id: item.id,
      collection: 'tree'
    };

    W(q, r => {
      $('#source-saveObject').blink((r.item)?'green':'red');

      if(!q.collection || q.collection == 'tree'){
        var $prp = $('#tree .av');
        if($prp.length){
          var $item = Tree.build(item).addClass('av');
          $prp.replaceWith($item);
        }
      }
    });
  }

  loadTheme(name){
    codeMirror.setOption("theme", name);
    var path = Cfg.libs+'CM_themes/'+name+'.css';
    if($('link[path="'+path+'"]').length) return;
    $('<link>', {
      type: 'text/css',
      rel: 'stylesheet',
      href: path
    }).appendTo('head');
  }
}
