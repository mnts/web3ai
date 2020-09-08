//import {styleSheets} from '//pineal.cc/src/styling.js';
const url = new URL(import.meta.url);
import User from '../../acc/User.js';
import servers from '../../data/servers.js';

class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-video_intro';
  }

  static get template(){
    return `
        <link rel="stylesheet" href="//${url.host}/design/interface.css">
        
		<style>
		    :host{
        		max-width: 460px;
        		height: 350px;
		    }

		    #intro_video{
		    	width: 100%;
		    	height: 300px;
		    }

		    main{
		    	text-align: center;
		    }
		</style>
        
    	<main>
			<fractal-media id='intro_video' class='fill'></fractal-media>
			<button id='continue'>
				<i class='fa fab-paypal'></i>
				Pay $5 To Continue
			</button>
            <button id='close'>
                Cancel
            </button>
	    </main>
	`
  }

  constructor() {
    super();

    this.server = Cfg.server;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.constructor.template;

    this.init();
  }

  init(){
    this.select('#continue').addEventListener('click', ev => {


        this.W({
          cmd: 'paypal.order',
          price: this.getAttribute('price'),
          src: this.getAttribute('src')
        }).then(r => {
          if(r.item)
            window.open(r.item.approval_url, '_blank');
          this.classList.remove('on');
        });
    });

    this.select('#close').addEventListener('click', ev => {
       this.close();
    });
  }

  close(){
  	document.querySelector('#modal').click()
  }
  
  W(m){
    return new Promise((ok, no) => {
       servers.connect(Cfg.api).then(ws => {
            ws.send(m, r => {
              r?ok(r):no();
            });
       });
    });
  }

  fill(item){
      if(item.intro_video)
          this.select('#intro_video').setAttribute('src', item.intro_video);
  }
  
  static get observedAttributes(){
    return ['user'];
  }
  
  attributeChangedCallback(name, oldVal, newVal){
    if(name == 'user'){
    	this.user = new User(newVal);
    	this.user.axon.link.load(item => {
    		this.fill(item);
    	});
    }
  }
  
  select(selector){
    return this.shadowRoot.querySelector(selector);f
  }
};


window.customElements.define(Component.is, Component);
