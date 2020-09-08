import '../components/pineal/pineal-tree.js';
import '../components/pineal/pineal-auth.js';
import '../components/pineal/pineal-account.js';
import '../components/pineal/pineal-user.js';
//import './components/pin-catalog.js';
//import './components/pin-item.js';
//import './components/pineal-htm.js';
import '../components/fractal/fractal-htm.js';
import '../components/fractal/fractal-media.js';
import '../components/fractal/fractal-options.js';
import '../components/pineal/pineal-gallery.js';
import '../components/fractal/fractal-rate.js';
import '../components/pineal/pineal-nav.js';
import '../components/pineal/pineal-networks.js';

const JP = NPM.path.join;

//import './components/pineal-colors.js';

const default_path = '/src/components/';
var paths = Cfg.components || {};

var define = name => {
  	var brand = name.split('-')[0];
  	var path = paths[brand] || default_path;
    if(typeof paths[name] == 'string')
      path = paths[name];
    else
    if(typeof paths[name] == 'object' && paths[name].path)
      path = paths[name].path;

    import(path.endsWith('.js')?path:JP(path, name+'.js'));
}

var find2define = window.lazyDefine = (doc) => {
  (doc || document).querySelectorAll('*:not(:defined)').forEach(element => {
    define(element.localName);
  });
}


document.addEventListener('DOMContentLoaded', ev => {
  lazyDefine();
  /*
  document.body.addEventListener( 'DOMNodeInserted', ev => {
    if(event.target.parentNode.localName == 'body'){
      console.dir(ev.target.parentNode);
    };

  }, false );
  */
});

export {define, find2define};