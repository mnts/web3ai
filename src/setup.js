import './data/Link.js';

var domain = window.location.host.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].split(':')[0];

Index.main_url = 'mongo://'+document.location.host+'/tree'+'?domain='+domain;

if(window.Cfg_site){
  Object.assign(Cfg, Cfg_site);
}

tippy.setDefaults({
  placement: 'bottom',
  animation: 'perspective',
  arrow: true
});

const main_link = new Link(Index.main_url);

main_link.load(item => {
  console.log(item)
  let layout = document.getElementById('layout');
  if(item.style)
    Object.assign(layout.style, item.style);
});