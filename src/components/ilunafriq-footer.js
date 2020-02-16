//import {styleSheets} from '../styling.js';
import {fix4name} from '../utilities/item.js';
import servers from '../data/servers.js';


class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-footer';
  }

  static get template(){
    return`

      <link rel="stylesheet" href="//spiritual.casa/style/bootstrap.min.css">
      <link rel="stylesheet" href="//spiritual.casa/style/stylesheet.css">
		<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
		<link rel="stylesheet" href="//spiritual.casa/style/icon.css">
		<link rel="stylesheet" href="//spiritual.casa/style/loader.css">
		<link rel="stylesheet" href="//spiritual.casa/style/idangerous.swiper.css">

      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

	<style>

    
      </style>
<footer>
		<div class="footer-main">
			<div class="container-fluid custom-container">
				<div class="row">	
					<div class="col-md-3 col-xl-4">
						<div class="footer-block">
							<h1 class="footer-title">About Us</h1>
							<p>Vestibulum tincidunt, augue fermentum accumsan viverra, eros dui rutrum libero, nec imperdiet felis sem in augue luctus <a href="blog-detail-2.html">diam a porta</a> iaculis. Vivamus sit amet fermentum nisl. Duis id <a href="blog-detail-2.html">massa id purus</a> tristique varius a sit amet est. Fusce dolor libero, efficitur et lobortis at, faucibus nec nunc.</p>
							<ul class="soc_buttons">
								<li><a href=""><i class="fa fa-facebook"></i></a></li>
								<li><a href=""><i class="fa fa-twitter"></i></a></li>
								<li><a href=""><i class="fa fa-google-plus"></i></a></li>
								<li><a href=""><i class="fa fa-pinterest-p"></i></a></li>
								<li><a href=""><i class="fa fa-instagram"></i></a></li>
								<li><a href=""><i class="fa fa-linkedin"></i></a></li>
							</ul>
						</div>
					</div>
					<div class="col-md-3 col-xl-2">
						<div class="footer-block">
							<h1 class="footer-title">Some Links</h1>
							<div class="row footer-list-footer">
								<div class="col-md-6">
								<ul class="link-list">
									<li><a href="about-us.html">About Us</a></li>
									<li><a href="contact-us.html">Help</a></li>
									<li><a href="contact-us.html">Contacts</a></li>
									<li><a href="activity.html">Job</a></li>
									<li><a href="activity.html">Projets</a></li>
								</ul></div>
								<div class="col-md-6">
								<ul class="link-list">
									<li><a href="activity.html">New Works</a></li>
									<li><a href="author.html">Popular Authors</a></li>
									<li><a href="author.html">New Authors</a></li>
									<li><a href="people.html">Career</a></li>
									<li><a href="faq">FAQ</a></li>
								</ul>
								</div>
							</div>
						</div>
					</div>				
					<div class="col-md-3 galerry">
						<div class="footer-block">					
							<h1 class="footer-title">Recent Works</h1>
							<a href="blog-detail-2.html"><img src="img/g1.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g2.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g3.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g4.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g5.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g6.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g7.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g8.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g9.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g10.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g11.jpg" alt=""></a>
							<a href="blog-detail-2.html"><img src="img/g12.jpg" alt=""></a>
						</div>
					</div>
					<div class="col-md-3">
						<div class="footer-block">
							<h1 class="footer-title">Subscribe On Our News</h1>
							<form action="./" class="subscribe-form">
								<input type="text" placeholder="Yout Name" required="">
								<div class="submit-block">
									<i class="fa fa-envelope"></i>
									<input type="submit" value="">
								</div>
							</form>
							<div class="soc-activity">
								<div class="soc_ico_triangle">
								</div>
								<div class="message-soc">
									<div class="date">16h ago</div>
									<a href="blog-detail-2.html" class="account">@faq</a> vestibulum accumsan est <a href="blog-detail-2.html" class="heshtag">blog-detail-2.htmlmalesuada</a> sem auctor, eu aliquet nisi ornare leo sit amet varius egestas.
								</div>
							</div>
						</div>
					</div>
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