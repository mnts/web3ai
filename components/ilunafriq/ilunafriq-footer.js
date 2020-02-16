//import {styleSheets} from '../styling.js';
import {fix4name} from '../../src/utilities/item.js';
import servers from '../../src/data/servers.js';


class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-footer';
  }

  static get template(){
    return`
		<style>
			footer{display: none;}
		</style>

		<link rel="stylesheet" href="/style/bootstrap.min.css">
		<link rel="stylesheet" href="/style/stylesheet.css">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
		<link rel="stylesheet" href="/style/icon.css">
		<link rel="stylesheet" href="/style/loader.css">
		<link rel="stylesheet" href="/style/footer.css">
		<link rel="stylesheet" href="/style/idangerous.swiper.css">

		<link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

		<footer>
			<div class="footer-main">
				<div class="col">
					<div class="footer-block">
						<h1 class="footer-title">About Us</h1>
						<p>Vestibulum tincidunt, augue fermentum accumsan viverra, eros dui rutrum libero, nec imperdiet felis sem in augue luctus <a href="blog-detail-2.html">diam a porta</a> iaculis. Vivamus sit amet fermentum nisl. Duis id <a href="blog-detail-2.html">massa id purus</a> tristique varius a sit amet est. Fusce dolor libero, efficitur et lobortis at, faucibus nec nunc.</p>
					</div>
				</div>
				<div class="col">
					<div class="footer-block">
						<h1 class="footer-title">Some Links</h1>
						<div class="row footer-list-footer">
							<a href="about-us.html">About Us</a>
							<a href="contact-us.html">Help</a>
							<a href="contact-us.html">Contacts</a>
							<a href="activity.html">Projets</a>
							<a href="activity.html">New Works</a>
							<a href="author.html">Popular Authors</a>
							<a href="author.html">New Authors</a>
							<a href="people.html">Careers</a>
							<a href="faq">FAQ</a>
						</div>
					</div>
				</div>

				<div class="col">
					<div class="footer-block">
						<h1 class="footer-title">Subscribe To Our News</h1>
						<form action="./" class="subscribe-form">
							<input type="text" placeholder="Your Name" required="">
							<div class="submit-block">
								<i class="fa fa-envelope"></i>
								<input type="submit" value="">
							</div>
						</form>
					</div>
				</div>
			</div>
			<div class="footer-bottom">
				<div class="container-fluid custom-container">
					<div class="col-md-12 footer-end clearfix">
						<div class="left">
							<span class="copy">© 2019. All rights reserved.</span>
							<span class="created">Created with LOVE</span></span>
						</div>
						<div class="right">
							<a class="btn color-7 size-2 hover-9">About Us</a>
							<a class="btn color-7 size-2 hover-9">Help</a>
							<a class="btn color-7 size-2 hover-9">Privacy Policy</a>
						</div>
					</div>			
				</div>
			</div>		
		</footer>
    `;
  }


  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
  }

  init(){
   // this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;
    

    this.server = Cfg.server;

    this.main_body = document.body;
  }

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }
};


window.customElements.define(Component.is, Component);