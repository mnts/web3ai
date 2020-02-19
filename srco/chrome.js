 window.Lib = {};

 Lib.item = {
  title: 'fractal',
  type: 'folder',
  children: [
   // 'chrome-storage://self/Index.items.home'
  ]
};

if(window.chrome && chrome.storage){
  Lib.item.children.push('chrome-storage://private');
  Lib.item.children.push('chrome-storage://topSites');
  Lib.item.children.push('chrome-bookmark://1');
}
else{
  //Lib.item.children.push('http://'+location.host+'/');
  //Lib.item.children.push('local-storage://local');

    var domain = window.location.host.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].split(':')[0];

    //if(domain.indexOf('.lh')) domain = 'localhost';
    
	if(false){ // use gun db domains
		var gun_name = 'domain_'+md5(domain);
		if(domain.indexOf('pineal.') == 0)
		  gun_name = 'pineal';
	}
	else{ // load domain node from mongo
		//Lib.item.children.push('fs://'+document.location.host+'/menu');
		Lib.item.children.push('mongo://'+document.location.host+'/tree'+'?domain='+domain);

		if(document.location.href.indexOf('cms') + 1)
			Lib.item.children.push('mongo://'+document.location.host+'/tree'+'#cms');
	}
	
	//Lib.item.children.push('fs://localhost/');
}

Lib.defaults = {
  'chrome-storage://topSites': 'mem://self/Lib.items.topSites',
  'chrome-storage://private': 'mem://self/Lib.items.private',
  'local-storage://local': 'mem://self/Lib.items.local'
};


Lib.types = {
  folder: {
    title: 'Folder',
    name: 'folder',
    type: 'folder'
  }
}


Lib.templates = {
	story: {
		type: 'story'
	}
};

var domain = document.location.host;

console.log(Cfg.app_name);

Lib.filters = {
	stories: {
		title: 'Stories',
		filter: {
			collection: 'stories',
			query: {
				//domain
				domain
			}
		}
	}
};

Lib.items = {
	components: {
		title: 'WEB Components',
		type: 'folder',
		children: [
			'mem://self/Lib.items.topSites'
		]
	},

  topSites: {
    title: 'Top Sites',
    id: 'topSites',
    type: 'folder',
    children: [],
    element: {
    	name: 'pineal-folder'
    }
  },

  private: {
    title: 'Chrome-storage (private)',
    id: 'private',
    children: [],
    type: 'folder'

  },

  local: {
    title: 'Local storage',
    id: 'local',
    children: [],
    type: 'folder'
  }
};


if(window.chrome && chrome.topSites)
  chrome.topSites.get(items => {
    items.forEach(item => {
      item.icon = 'chrome://favicon/'+item.url;
      item.id = 'topSite_'+md5(item.url);

      let url = 'mem://self/Lib.items.'+item.id;

      Lib.items[item.id] = item;
      Lib.items.topSites.children.push(url);
    });
  });


/*
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', ' ', 'auto');
// ga('set', 'checkProtocolTask', null); // Disable file protocol checking.
ga('send', 'pageview');

ga('set', 'checkProtocolTask', function(){}); 
ga('require', 'displayfeatures');
ga('send', 'pageview', '/tab.html');

/*
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2166334-7']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://ssl.google-analytics.com/analytics.js','ga'); // Note: https protocol here

ga('create', 'UA-XXXXX-YY', 'auto'); // Enter your GA identifier
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/mypage.html'); // Specify the virtual path

*/