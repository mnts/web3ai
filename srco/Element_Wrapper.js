export default class Wrapper{
  constructor(link, element){
    this.link = link;

    if(element instanceof HTMLElement || element instanceof jQuery)
      this.$parent = $(element || '');
    else
      $.extend(this, element);

    if(this.$parent)
      this.parent_item = this.$parent.data();

    this.load(link);
  }

  load(link){
    var $placeHolder = $('<div>');

    if(this.$parent)
      $placeHolder.appendTo(this.$parent);


    return this.loadPromise = new Promise((ok, no) => {
      //setTimeout(ev => {
      link.load(item => {
        let $element = this.build(item);

        if(!this.template && (!item || !item.element || !$element.length))
          return $placeHolder.remove();

        this.item = item;
        this.$element = $element;
        this.element = this.$element[0];
        $placeHolder.replaceWith($element);

        ok(item);
        if(this.onLoad)
          this.onLoad(this.$element);

        if(!this.noChildren)
          this.children($element);
      });
      //});
    });
  }

  children($element){
    this.link.children(links => {
      if(this.item.permissios){
        var perm = this.item.permissios;
        if(parm.add){
          if(typeof perm.add.item == 'string')
            links.unshift(Link(perm.add.item));
        }
      }

      links.forEach(link => {
        if(this.inherit)
          this.inherit.$parent = $element;
        let wrapper = new Wrapper(link, this.inherit || $element);
      });
    });
  }

  build(item){
    if(
      this.template ||
      (this.parent_item && this.parent_item.template_force && this.parent_item.template)
    )
      $.extend(item, this.template || this.parent_item.template);


    if(!item.element) return;

    if(typeof item.element == 'string'){
      var id = item.element+'-'+md5(this.link.url);
      var $element = $('<'+item.element+'>', {
        id
      //  src: this.link.url
      });
    }
    else
    if(typeof item.element == 'object'){
      var id = item.element.name+'-'+md5(this.link.url);
      var $element = $('<'+(item.element.name || 'div')+'>', {
        id
       // src: this.link.url
      });

      if(item.element.selector){
        if(!item.element.name) $element = $(item.element.selector);
        else $element.append($(item.selector).html());
      }

      if(item.element.attributes) $element.attr(item.element.attributes);
      if(item.element.css) $element.css(item.element.css);
    }


    $element.data(item);
    $element[0].link = this.link;

    return $element;
  }
}
