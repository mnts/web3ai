//import {styleSheets} from '//pineal.cc/src/styling.js';
const url = new URL(import.meta.url);

const create = tag => document.createElement(tag);
import Link from '/src/data/Link.js';

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-invite';
  }

  static get template(){
    return `
        <link rel="stylesheet" href="//${url.host}/design/interface.css">
        
		<style>
		    :host{
        		height: 460px;
		    }

			main{
				text-align: left;
				padding: 12px;
				display: flex;
                flex-direction: column;
                height: 100%;
			}

			p{
				color: grey;
			}

			ul{
				flex-grow: 1;
			}

			.email{
				font-weight: bold;
                font-size: 14px;
                display: inline-block;
			}

			.minus{
				border-radius: 50%;
				background-color: #BBB;
				margin: 1px 4px;
                height: 24px;
			}

			#email{
				width: 200px;
			}

			button{

			}
		</style>
        
    	<main>
    	    <div>
    			<h3></h3>
	    		<p id='about'></p>
		    </div>
		    	
			<ul></ul>
			
			<div id='invite'>
    			<input id=email placeholder='Enter email'/> 
	    		<button id='add'>+</button>
			    <hr/>
			 </div>

			<div>
                <button id='send' style='background-color: green'>Send</button>
                <button id='skip'>Skip</button>
			</div>
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
    var width;

    const c = Cfg.inviting;
    if(!c) return;
    
    this.select('h3').innerText = c.title;
    this.select('#about').innerText = c.about;

    this.select('#add').addEventListener('click', ev => {
    	this.add_email();
    });
    
    this.select('#email').addEventListener('keyup', ev => {
        if(ev.keyCode == 13) this.add_email();
    });
    
    this.select('#skip').addEventListener('click', ev => {
    	this.close();
    });
    this.select('#send').addEventListener('click', ev => {
    	this.sendAll();
    });
    
    document.body.addEventListener('published', ev => {        
    	this.setAttribute('src', ev.detail.url);
    	this.classList.add('on');
    });
  }

  close(){
  	 this.classList.remove('on');
  }

  add_email(){
  	const input = this.select('#email');

	const email = input.value;

  	const email_els = this.selectAll('.email');
  	email_els.map(el => {
        if(el.innerText == email) return;
  	});

	if(!validateEmail(email))
		return $(input).blink('red');

	input.value = '';

	const li = create('li');

	const span = create('span');
	span.classList.add('email');
	span.innerText = email;
	li.append(span);

	const minus = create('button');
	minus.classList.add('minus');
	minus.innerText = '-';
	li.append(minus);
	minus.addEventListener('click', ev => li.remove());

	this.select('ul').append(li);

  	if(email_els.length == 9)
		this.select('#invite').style.display = 'none';
  }

  sendAll(){
  	const email_els = this.selectAll('.email');
  	email_els.map(el => {
        this.send(el.innerText);
  	});

	this.link.set('num_invites', email_els.length);

    this.close();
  };

  send(email){
    const c = Cfg.inviting;

	this.link.load(item => {
		Ws.send({
			cmd: 'email',
			name: c.name,
			tid: c.tid,
			to: email,
			subject: c.subject,
			text: c.alt_text,
			context: {
			  item,
			  url: document.location.href
			}
		}, r => {

		});
	});
  }
  
  static get observedAttributes(){
    return ['src'];
  }
  
  attributeChangedCallback(name, oldVal, newVal){
    if(name == 'src'){
	  this.link = new Link(newVal);
      this.select('#invite').style.display = 'block';
      this.select('ul').innerHTML = '';
    }
    
  }

  selectAll(qs){
  	return Array.prototype.slice.call(
	    this.shadowRoot.querySelectorAll(qs)
	);
  }

  
  select(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);
