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

const JP = NPM.path.join;

//import './components/pineal-colors.js';

const default_path = '/src/components/';
var paths = Cfg.components || {};

var define = name => {
  	var brand = name.split('-')[0];
  	const path = paths[name] || paths[brand] || default_path;
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