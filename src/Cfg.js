window.Cfg = {
  port: 80,
  host: location.host,
  server: location.host,
  gun: {
    path: 'http://localhost:8765/gun'
  },

  fs:{
    dir_file: 'item.json'
  },
  
  http: {
    port: 4253
  },

  ipfs: {
    url: 'https://cdn.jsdelivr.net/npm/ipfs/src/core/index.min.js',
    host: 'localhost',
    port: '5001',
    protocol: 'http',
    on: true
  },
  files: 'http://localhost/files/', 

  components: {
      fractal: '/src/components/fractal',
      'fractal-item': '/src/components/fractal-item/component.js',
      ilunafriq: '/src/components/ilunafriq',
      pineal: '/src/components/pineal',
      catalogem: '/src/components/catalogem',
      pix8: '/src/components/pix8',
      xy: '/src/node_modules/xy-ui/components',
      'paper-range-slider': '/src/node_mod/paper-range-slider/paper-range-slider.js'
  },

  acc: {
     mobile_separate: false,
     email_confirm: false,
     profile_page: false,
     online_check: true,
     currency: {
       title: 'Coins'
     }
  },

  nav: {
    auto_open: true
  },
  

  publisher_check: false
};

Cfg.api = Cfg.server;

if(window.Cfg_site){
  $.extend(true, Cfg, Cfg_site);
}

export default Cfg;
