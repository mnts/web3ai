class Neuro{

}


/*
class Graph{
  fbp = window.TheGraph.fbpGraph;
}
*/

(function(){
  var fbpGraph = window.TheGraph.fbpGraph;


  var React = require('react');
  var createReactClass = require('create-react-class');

  TheGraph.SVGImage = React.createFactory( createReactClass({
    displayName: "TheGraphSVGImage",
    render: function() {
        var html = '<image ';
        html = html +'xlink:href="'+ this.props.src + '"';
        html = html +'x="' + this.props.x + '"';
        html = html +'y="' + this.props.y + '"';
        html = html +'width="' + this.props.width + '"';
        html = html +'height="' + this.props.height + '"';
        html = html +'/>';

        return React.createElement('g', {
          className: this.props.className,
          dangerouslySetInnerHTML:{__html: html}
        });
    }
  }));

  TheGraph.factories.node.createNodeIconSVG = TheGraph.factories.createImg = options => {
    console.log(options);
    return TheGraph.SVGImage(options);
  };


  // The graph editor
  var editor = document.getElementById('editor');


  // Context menu specification
  function deleteNode(graph, itemKey, item) {
    app.graph.removeNode(itemKey);
  }

  function deleteEdge(graph, itemKey, item) {
    app.graph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
  }



  let app = Site.apps.graph = {
    library: {
      basic: {
        name: 'basic',
        description: 'basic demo component',
        icon: 'eye',
        inports: [
          {'name': 'in0', 'type': 'all'}
        ],
        outports: [
          {'name': 'out0', 'type': 'all'}
        ]
      }
    },

    icons: {
      fldr: '/design/icons/round.png',
      folder: '/design/icons/tri1.png',
      blank: '/design/files/_blank.png',
      //item: '/design/icons/item.png',
      graph: '/design/icons/graph.png',
      page: '/design/icons/text.png'
    },

    addEdge: (outNodeID) => {
      var nodes = app.graph.nodes;
      var len = nodes.length;
      if ( len<1 ) { return; }
      var node1 = outNodeID || nodes[Math.floor(Math.random()*len)].id;
      var node2 = nodes[Math.floor(Math.random()*len)].id;
      var port1 = 'out' + Math.floor(Math.random()*3);
      var port2 = 'in' + Math.floor(Math.random()*12);
      var meta = { route: Math.floor(Math.random()*10) };
      var newEdge = app.graph.addEdge(node1, port1, node2, port2, meta);
      return newEdge;
    },

    items: {},
    load: item => {
      if(!item) return;
      app.item = item;

      console.log(item);

      let ids = [];
      for(let key in item.processes){
        let node = item.processes[key];
        ids.push(node.component);
      }

      var filter = {id: {$in: ids}};
      app.readFilters();
      $.extend(filter, app.filter);

      Tree.load(filter).then(items => {
        //app.library = [];

        items.forEach(item => {
          app.items[item.id] = item;
          app.prepareNode(item);
        });

        console.log(items);

        fbpGraph.graph.loadJSON(item, (err, graph) => {
          app.graph = graph;

          app.graph.on('endTransaction', ev => {
            app.render();
            app.save();
          });
          app.render();
        });
        /*
        for(let key in item.graph.processes){
          let node = item.graph.processes[key];
          let newNode = app.graph.addNode(key, node.component, node.metadata);
        }
        */
      });
    },

    find: (search) => {
      $('#graph-editor g.nodes > .node.found').removeClass('found');
      if(!search) return;

      var items = Object.values(app.items);
      var found = [];
      items.map(item => {
        if(item.description && (item.description.indexOf(search) + 1))
          return found.push(item.id);

        if(item.title && (item.title.indexOf(search) + 1))
          return found.push(item.id);

        if(item.name && (item.name.indexOf(search) + 1))
          return found.push(item.id);
      });

      Site.apps.graph.graph.nodes.map(node => {
        if(found.indexOf(node.component)+1)
          console.log($('#graph-editor g.nodes > .node[name='+node.id+']'));
        if(found.indexOf(node.component)+1)
          $('#graph-editor g.nodes > .node[name='+node.id+']').addClass('found');
      });

      //$('#graph-editor g.nodes')

      console.log(found);
    },

    filter: {},
    readFilters: () => {
      var $search = app.$footer.children('.filter[name=search]');
      if($search.val().length > 1){
        this.filter = {$text: {$search: $search.val()}};
      }

      app.$footer.children('.filter').each(item => {

      });

      return app.filter;
    },

    initFilters: () => {
      $('<input>', {class: 'fr filter', name: 'search', placeholder: 'Search'}).keyup(ev => {
        app.find(ev.target.value);
      }).appendTo(app.$footer);
    },

    reload: () => {
      app.clean();
      app.load(app.item);
    },

    open: item => {
      console.log('Load graph', item);
      if(!item || !item.graph) return;

      app.load(item.graph);
    },

    prepareNode: item => {
      if(!item) return;
      var node = app.library[item.id] = item;

      var itm = _.pick(item, 'name', 'title', 'description', 'iconsvg', 'inports', 'outports');
      if(item.icon) itm[(typeof item.icon == 'number')?'icon':'iconsvg'] = (typeof item.icon == 'number')?item.icon:(Cfg.files + item.icon);
      else if(item.image) itm.iconsvg = Cfg.files + item.image;
      else itm.iconsvg = app.icons[item.type || 'item'];

      if(!itm.inports) itm.inports = app.library.basic.inports;
      if(!itm.outports) itm.outports = app.library.basic.outports;

      app.library[item.id] = itm;

      return itm;
    },

    clean: () => {
      app.graph = new fbpGraph.Graph();
      app.graph.on('endTransaction', app.render);
      app.render();
    },

    init: () => {
      app.$ = $('<div>', {id: 'graph', class: 'app'}).appendTo(document.body);

    	$('<link>').attr({href: "/design/the-graph-light.css", rel: "stylesheet"}).appendTo(app.$);
      $('<link>').attr({href: "/design/graph.css", rel: "stylesheet"}).appendTo(app.$);

      app.$editor = $('<div>', {id: 'graph-editor', class: "the-graph-light"}).appendTo(app.$);

      app.initFooter();

      app.clean();
      //window.addEventListener("resize", app.render);

      app.initEvents();
      app.initFilters();
    },

    initEvents: () => {
      this.addEventListener('drop', ev => {
        console.log(Tree.drg);

        if(!Tree.drg.$) return;

        var $a = Tree.drg.$,
            $node = $a.parent(),
            $item = $node.parent();

        var item = $item.data();

        var id = randomString(3);
            title = item.title || item.name || '#'+item.id;

        var itm = app.prepareNode(item);

        var metadata = {
          label: title,
          x: (ev.x - app.x - 40) / app.scale,
          y: (ev.y - app.y - 40) / app.scale
        };

        var newNode = app.graph.addNode(id, item.id, metadata);

        var tid = $(this).parent().parent().data('id');

        app.save();

        return false
      }, false);
    },

    contextMenus: {
      main: true,
      selection: true,
      nodeInport: null,
      nodeOutport: null,
      graphInport: null,
      graphOutport: null,
      edge: {
        icon: "long-arrow-right",
        s4: {
          icon: "trash-o",
          iconLabel: "delete",
          action: deleteEdge
        }
      },
      node: {
        s4: {
          icon: "trash-o",
          iconLabel: "delete",
          action: deleteNode
        },


        w4: {
          icon: "font-awesome",
          iconLabel: "icon",
          action: (graph, itemKey, item) => {
            Index.fa_pick.open();
            Index.fa_pick.pick = icon => {
              W({
                cmd: 'update',
                id: item.component,
                set: {
                  icon: parseInt(icon.id)
                }
              }, r => {
                app.reload();
              });
            }
          }
        },


        e4: {
          icon: "wrench",
          iconLabel: "edit",
          action: (graph, itemKey, item) => {
        		Properties.collection = 'tree';
        		Properties.get(item.component, 'tree');
          }
        },

        n4: {
          icon: "caret-right",
          iconLabel: "open",
          action: (graph, itemKey, itm) => {
            console.log(itm);
            var item = app.items[itm.component];

            if(item.url)
              window.open(item.url, '_blank');
            else
              $('#t'+item.component + ' a.tr').click();
          }
        }
      },
      group: {
        icon: "th",
        s4: {
          icon: "trash-o",
          iconLabel: "ungroup",
          action: (graph, itemKey, item) => {
            graph.removeGroup(itemKey);
          },
        },
      }
    },

    initFooter: () => {
      let $footer = app.$footer = $('<footer>').appendTo(app.$);
      let $save = $('<button>').click(ev => {
        app.save();
      }).text('Save')//.appendTo($footer);

      $('<button>').click(ev => {
        app.addEdge();
      }).text('Add edge').appendTo($footer);

      $('<input>', {
        placeholder: 'Enter node title'
      }).bindEnter(function(ev){
        var id = Math.round(Math.random()*100000).toString(36);

        var title = this.value;

        this.value = '';

        var itm = app.prepareNode({
          title, id
        });

        var metadata = {
          label: title,
          x: Math.round(Math.random() * $('#graph-editor').width()),
          y: Math.round(Math.random() * $('#graph-editor').height())
        };

        var newNode = app.graph.addNode(id, id, metadata);

      }).appendTo($footer);
    },

    add: itrem => {

    },

    save: () => {
      let graph = app.graph.toJSON();

      let $active = $('#tree .av');
      if(!$active.length){
        var item = {
          type: 'graph',
          graph
        };
        Tree.create_input(item, $('#tree > li > ul'));
        return;
      }

      var item = $('#tree .av').data();
      item.graph = graph;

      Tree.query('update', {id: item.id, set: {graph}}).then(r => {
        console.log(r);
        //$save.blink(r.item?'green':'red');
      });
    },

    clear: function(){
      var missing = [];
      console.log(app.graph.nodes);
      (app.graph.nodes || []).map((node, i) => {
        if(!app.library[node.component]){
          missing.push(node.id);
          app.graph.nodes[i] = null;
        }
      });

      app.graph.nodes = app.graph.nodes.filter(el =>  {
        return el != null;
      });

      app.graph.nodes.map(el =>  {
        if(el && el.metadata){
          var item = app.items[el.component];
          if(item)
            el.metadata.label = item.title || item.name || '#'+item.id;
        }
      });

      (app.graph.edges || []).map((node, i) => {
        if(missing.indexOf(node.from.node) + 1){
          app.graph.edges[i] = null;
          return;
        }

        if(missing.indexOf(node.to.node) + 1)
            app.graph.edges[i] = null;
      });

      app.graph.edges = app.graph.edges.filter((el, i) =>  {
        console.log(el, i);
        return el != null;
      });

      console.log(app.graph.edges);
    },

    scale: 1,
    render: () => {
      app.clear();

      var props = {
        readonly: false,
        graph: app.graph,
        menus: app.contextMenus,
        library: app.library,
        onPanScale: (x, y, s) => {
          app.scale = s;
          app.x = x;
          app.y = y;
        }
      };

      //console.log('render', props);
      var editor = app.$editor[0];
      var element = app.element = React.createElement(TheGraph.App, props);
      app.node = ReactDOM.render(element, editor);
    }
  };
})();


$(function(ev){
  var app = Site.apps.graph;

  Tree.types.graph = function(item){
    console.log(item);
    //Site.openApp('graph');
    Tree.activate(item.id);

    $('.app').hide();
    $('#graph').show();

    app.clean();
    if(!item.graph) return;
    app.load(item.graph);
  };

  app.init();
});

/*
// Add node button
var addnode = function () {
  var id = Math.round(Math.random()*100000).toString(36);
  var component = Math.random() > 0.5 ? 'basic' : 'tall';
  var metadata = {
    label: component,
    x: Math.round(Math.random()*800),
    y: Math.round(Math.random()*600)
  };
  var newNode = graph.addNode(id, component, metadata);
  return newNode;
};
document.getElementById("addnode").addEventListener("click", addnode);

// Add edge button
var addedge = function (outNodeID) {
  var nodes = graph.nodes;
  var len = nodes.length;
  if ( len<1 ) { return; }
  var node1 = outNodeID || nodes[Math.floor(Math.random()*len)].id;
  var node2 = nodes[Math.floor(Math.random()*len)].id;
  var port1 = 'out' + Math.floor(Math.random()*3);
  var port2 = 'in' + Math.floor(Math.random()*12);
  var meta = { route: Math.floor(Math.random()*10) };
  var newEdge = graph.addEdge(node1, port1, node2, port2, meta);
  return newEdge;
};
document.getElementById("addedge").addEventListener("click", function(event) { addedge() });

// Random graph button
document.getElementById("random").addEventListener("click", function () {
  graph.startTransaction('randomgraph');
  for (var i=0; i<20; i++) {
    var node = addnode();
    addedge(node.id);
    addedge(node.id);
  }
  graph.endTransaction('randomgraph');
});

// Get graph button
document.getElementById("get").addEventListener("click", function () {
  var graphJSON = JSON.stringify(graph.toJSON(), null, 2);
  alert(graphJSON);
  //you can use the var graphJSON to save the graph definition in a file/database
});

// Clear button
document.getElementById("clear").addEventListener("click", function () {
  graph = new fbpGraph.Graph();
  renderEditor();
});
*/
