//import Node from './Node.js';


const template = document.createElement('template');

template.innerHTML = `	
  <style>
    :host, main {

    }

    :host {
      height: 100%;
      display: flex;
    }

    main{
    }

    main > .app.selected{
      display: block;
    }
  </style>
  
  <slot></slot>
`;

export default class layout extends HTMLElement{
	constructor(){
		super();
		this.tid = {
			acc: 1
		}

		this.items = {};
		this.files = {};
		
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(template.content.cloneNode(true));		

		var link = Link('mongo://'+Cfg.api+'/tree?domain='+document.domain);

	  console.log(link);
		link.load(item => {
			//Domain
			var items = {};
			link.children(links => {
			  //return;
			  console.log(links);
			  links.forEach(lnk => {
			  	lnk.children(lnks => {			 
			  		console.log(lnks); 		
			  		lnks.forEach(lnk => {
			  			lnk.load(itm => {
			  				console.log(itm);
					  		if(itm && itm.element){
					    		var wrapper = new Wrapper(lnk, this);
					    	}
					    });
				    });
			    });
			  });
			});
		});
	}
};

window.customElements.define('pineal-lay', layout);