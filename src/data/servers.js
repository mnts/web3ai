class Servers{
  constructor(){
      this.list = {};
  }

  connect(host, sid){
    var pp = host.indexOf(':');

    if(host.substr(pp) == ':80')
      host = host.substr(0, pp);
    
    return new Promise((ok, no) => {
      var wsp = this.list[host];
      if(wsp){
        if(wsp instanceof Promise)
          return wsp.then(ws => {
            ok(ws);
          });

          return ok(wsp);
      }

      
      var sid;
      if(
        (Cfg.api.indexOf(host) + 1) && 
        document.location.hash.substr(1).indexOf('sid=') === 0
      ){
        sid = document.location.hash.split('=')[1];
        document.location.hash = '';
      }

      this.list[host] = new Promise((k, n) => {
        let ws = new WS({
          server: host,
          sid: sid || Cookies.get('sid_'+md5(host))
          //autoReconnect: true
        });

        ws.msg = m => {
          if(!m.cmd) return;
          
          var ev = new CustomEvent('ws.cmd.'+m.cmd, {
              detail: {
                m,
                ws,
                host
              },
          });

          document.dispatchEvent(ev);
        };

        ws.on.session = m => {
          this.sid = ws.sid = m.sid;
          ws.session = m;
          Cookies.set('sid_'+md5(host), this.sid, { expires: 365});
          this.list[host] = ws;
          ok(ws);
          k(ws)
          
        };
      });
    });
  }
}

let servers = window.servers = new Servers();
export default servers;