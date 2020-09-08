var qs = q => document.querySelector(q);

var setColor = color => {
  let style = document.body.style;
  style.setProperty('--color', color);
  style.setProperty('--bg-grad', 'linear-gradient(var(--color), '+color+'CC)');
  $('meta[name="theme-color"]').attr('content', color);
}

if(window.chrome && chrome.storage)
  chrome.storage.sync.get(['color', 'nav-width'], r => {
    setColor(r.color || $("meta[name=theme-color]").attr('content'));
    if(r['nav-width']) qs('#layout').updateStyles({'--nav-width': r['nav-width']+'px'});
  });
else{
  //localStorage.getItem('color');
  setColor($("meta[name=theme-color]").attr('content') || '#f45801');

  let width = localStorage.getItem('nav-width');
  if(width) qs('#layout').updateStyles({'--nav-width': width+'px'});
}



var colors = qs('#colors');
if(colors){
  tippy('#color', {
    content: colors,
    arrow: true,
    interactive: true,
    trigger: 'click',
    animation: 'perspective'
  });

  colors.addEventListener('pick', ev => {
    setColor(ev.detail.color);
  });

  colors.addEventListener('picked', ev => {
    if(window.chrome && chrome.storage)
      chrome.storage.sync.set({color: ev.detail.color});
    else
      localStorage.setItem('color', ev.detail.color);

    Index.setColor(ev.detail.color);
  }); 
}

export {setColor};