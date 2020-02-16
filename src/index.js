import '/node_modules/jquery/dist/jquery.min.js';
import '/lib/npm_bundle.js';
import '/lib/libs.js';
//import './npm.js';

window.global = window;

//import Popper from './node_modules/popper.js/dist/popper.min.js';
//window.Popper = Popper;
//console.log(Popper);
//window.Popper = Popper;
//import './node_modules/tooltip.js/dist/umd/tooltip.min.js';
import '/lib/js-yaml.min.js';
//import './node_modules/sugar/dist/sugar-es5.min.js';
//Sugar.extend();

//import"./node_mod/zangodb/build/src/index.js";
//import"./node_mod/paper-range-slider/paper-range-slider.js";

import '/lib/js.cookie.js';
import '/node_modules/tippy.js/umd/index.all.js';
import '/node_modules/@github/time-elements/dist/time-elements.js';
import '/lib/md5.js';
import '/lib/functions.js';
import '/lib/interface.js';

import '/lib/ws.js';

const extend = NPM.extend;

import './config.js';

if(window.Cfg_site){
  extend(Cfg, Cfg_site);
}

tippy.setDefaults({
  placement: 'bottom',
  animation: 'perspective',
  arrow: true
});

var qs = q => document.querySelector(q);

if(Cookies.get('devMode')){
  //Cfg.server = '';
  //Cfg.api = 'localhost:4251';
}

import './chrome.js';

import types from './neuro/types.js';

//import './data/wysiwyg.js';

//import stack from './services/blockstack.js';

//import "/node_modules/time-elements/dist/time-elements-legacy.js";

var domain = location.host.split('.').slice(-2).join('.');


window.Index = {
  apps: {},
  types
};


//import './styling.js';

import {setColor} from './services/colors.js';
Index.setColor = setColor;

import './data/Link.js';


//import icons from './data/fa.js';
//Index.fa = icons;

//import image from './items/image.js';
//import item from './items/item.js';

//import FA_pick from './modals/FA_pick.js';

import './body/mobile.js';

import './services/ipfs.js';
import './services/components.js';
import './services/side.js';
import './services/search.js';
import './services/upload.js';


import './services/map.js';
  
import './services/facebook.js';
import {DB_promise} from './services/db.js';

import './account.js';

$(ev => {
  window.addEventListener('hashchange', ev => {
    var app = qs(window.location.hash);
    $(app).addClass('selected').siblings().removeClass('selected');
  });
});

window.addEventListener('DOMContentLoaded', async (event) => {
  const response = await fetch('/manifest.json');
  window.manifest = await response.json();
  
  
  let eve = new CustomEvent('pineal_ready', { detail: {}});
  document.dispatchEvent(eve);
});