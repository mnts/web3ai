var qs = q => document.querySelector(q);

var setColor = color => {
  let style = document.querySelector('pineal-layout').style;
  style.setProperty('--color', color);
  //style.setProperty('--bg-grad', 'linear-gradient('+color+'BB, var(--color))');
  $('meta[name="theme-color"]').attr('content', color);
}

if(chrome && chrome.storage)
  chrome.storage.sync.get(['color', 'nav-width'], r => {
    setColor(r.color || '#f45801');
    if(r['nav-width']) qs('#layout').updateStyles({'--nav-width': r['nav-width']+'px'});
  });
else{
  setColor(localStorage.getItem('color') || '#f45801');

  let width = localStorage.getItem('nav-width');
  if(width) qs('#layout').updateStyles({'--nav-width': width+'px'});
}




var colors = qs('#colors');
if(colors){
  tippy('#color', {
    content: colors,
    arrow: true,
    interactive: true,
    trigger: 'click'
  });

  colors.addEventListener('pick', ev => {
    setColor(ev.detail.color);
  });

  colors.addEventListener('picked', ev => {
    if(chrome && chrome.storage)
      chrome.storage.sync.set({color: ev.detail.color});
    else
      localStorage.setItem('color', ev.detail.color);

    Index.setColor(ev.detail.color);
  }); 
}

export {setColor};