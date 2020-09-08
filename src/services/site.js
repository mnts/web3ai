import Link from '../data/Link.js';

var domain = window.location.host.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].split(':')[0];
Index.main_url = 'mongo://'+document.location.host+'/sites'+'?domain='+domain;

var nav_links_el = document.querySelector('meta[name=nav]');
if(nav_links_el){
    let cont = nav_links_el.getAttribute('content');
    if(cont && typeof cont == 'string')
        cont.split(';').map(url => {
            Lib.item.children.push(url);
        });
}

var setTitle = title => {
    if(!title) return;
    document.querySelector('title').innerText = title;
    var title_el = document.querySelector('#head > [slot=title]');
    if(title_el) title_el.innerText = title;
}

var site = Link(Index.main_url);
site.load(item => {
    if(!item) return;

    if(item.title) setTitle(item.title);

    var head_el = document.querySelector('#head');
    if(item.icon && item.icon.indexOf('://')+1)
        head_el.setAttribute('logo', item.icon);
        
    document.body.dispatchEvent(new Event('site_loaded'));

    
    const home = document.querySelector('#home');
    if(home.tagName == "FRACTAL-HTM")
        home.setAttribute('src', 'mongo://'+item.domain+'/sites#'+item.id);
    //document.querySelector('#navigation').setAttribute('src', site.url);
});

site.children(links => {

    const headTag = 'fractal-head';
    if(Cfg.nav && Cfg.nav.auto_open && !document.body.classList.contains('mobile'))
        customElements.whenDefined(headTag).then(() => {
            //document.querySelector(headTag).select('#nav-toggle').click(); 
        });
});
