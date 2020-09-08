//import {styleSheets} from '../styling.js';
import account from '/src/account.js';
import {fix4name} from '/src/utilities/item.js';
import servers from '/src/data/servers.js';
import {find2define} from '/src/services/components.js';
const select = q => document.querySelector(q);
const J = NPM.urljoin;
const extend = NPM.extend;

import {LitElement, html, css} from "/node_mod/lit-element/lit-element.js";
import {setPassiveTouchGestures} from "/node_mod/@polymer/polymer/lib/utils/settings.js";
import {installMediaQueryWatcher} from "/node_mod/pwa-helpers/media-query.js";
import {installOfflineWatcher} from "/node_mod/pwa-helpers/network.js";
import {installRouter} from "/node_mod/pwa-helpers/router.js";
import {updateMetadata} from "/node_mod/pwa-helpers/metadata.js"; // This element is connected to the Redux store.

const url = new URL(import.meta.url);


export default class Neuron_lit extends LitElement{
  constructor(){
    super();
  }
}