window.Acc = {
    FB: {  
        getLoginStatus: () => FB.getLoginStatus(r => {
            console.log(r);
        })
    }
}


servers.connect(Cfg.api).then(ws => {
  ws.cmd('acc', d => {
    var ev = new CustomEvent('authenticated', {
      detail: d
    });

    document.body.dispatchEvent(ev);
  });
});


window.addEventListener('DOMContentLoaded', ev => {
    if(window.FB) Acc.FB.getLoginStatus();
});