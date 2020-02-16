//import { LitElement, html } from '@polymer/lit-element';
//import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import './server.js';

export default class Servers extends HTMLElement{
  render(){
    this.list = {};

    return html`
      <div>
        List of currently connected servers
      </div>
    `;

    var eve = new CustomEvent('servers', {detail: 123});
    this.dispatchEvent();
  }

  connect(host){
    if(host.indexOf(':') < 0)
      host += ':'+Cfg.port;
    return new Promise((ok, no) => {
      var wsp = this.list[host];
      if(wsp){
        if(wsp instanceof Promise)
          return wsp.then(ws => {
            ok(ws);
          });

        return ok(wsp);
      }

      this.list[host] = new Promise((k, n) => {
        let ws = new WS({
          server: host
          //autoReconnect: true
        });

        ws.on.session = m => {
          this.session = m;
          this.sid = m.sid;
          this.list[host] = ws;
          ok(ws);
          k(ws)
        };
      });
    });
  }

  constructor(){
    super();

    //setPassiveTouchGestures(true);
  }

  firstUpdated() {
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      const pageTitle = this.appTitle + ' - ' + this._page;
    }
  }

  _menuButtonClicked() {
    //store.dispatch(updateDrawerState(true));
  }

  _drawerOpenedChanged(e) {
    //store.dispatch(updateDrawerState(e.target.opened));
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
    this._drawerOpened = state.app.drawerOpened;
  }
}

window.customElements.define('pineal-servers', Servers);
