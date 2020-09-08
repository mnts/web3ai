window.Cfg = {
  port: 80,
  host: location.host,
  server: location.host,
  gun: {
    path: location.origin+':8765/gun'
  },


  fs:{
    dir_file: 'item.json'
  },
  
  http: {
    port: 4253
  },

  ipfs: {
    host: 'localhost',
    port: '5001',
    protocol: 'http',
    on: false
  },
  files: location.origin+'/files/', 

  components: {
      fractal: '/src/components/fractal',
      'fractal-item': '/src/components/fractal-item/component.js',
      ilunafriq: '/src/components/ilunafriq',
      pineal: '/src/components/pineal',
      catalogem: '/src/components/catalogem',
      pix8: '/src/components/pix8',
      xy: '/src/node_modules/xy-ui/components',
      'paper-range-slider': '/src/node_mod/paper-range-slider/paper-range-slider.js'
  }
};

Cfg.api = location.host+'/ws';
