//import {styleSheets} from '../styling.js';
import {fix4name} from '../utilities/item.js';
import servers from '../data/servers.js';


class Component extends HTMLElement{
  static get is(){
    return 'ilunafriq-story';
  }

  static get template(){
    return`
      <style>
        :host{
          display: none;
          vertical-align: top;
        }

        #img{
          min-height: 20px;
        }

        main{
        	display: none;
        }
      </style>


      <link rel="stylesheet" href="//${Cfg.server}/design/components/ilunafriq-story.css">
		
      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">



      <main>
        <div id='img'></div>
        <button id='upload'>
          <i class='fas fa-upload'></i>
        </button>
        <input id='title' placeholder='write title'/>
        <textarea id='description' placeholder='Short description of the story'></textarea>
        
        <fractal-htm contentEditable id='article'>
          Write the story
        </fractal-htm>

        <div id="owner-block">
            <img src="//${Cfg.server}/design/user.png" alt='O'/>
            <div id='owner-info'>
              <a id='owner'></a>
              <relative-time id='info-when'></relative-time>
            </div>
        </div>
        <div id="info-block">
            <span class="fas fa-thumbs-up forPublished" id='stat-likes'>0</span>
            <span class="fas fa-eye forPublished" id='stat-views'>0</span>
            <span class="fas fa-comments forPublished" id='stat-comments'>0</span>
            <span class="fas fa-trash forCreate forEdit" id='stat-remove'>Remove</span>
            <span class="fas fa-check forCreate" id='stat-publish'>Publish</span>
        </div>
        <slot></slot>
      </main>

	
      <link rel="stylesheet" href="//spiritual.casa/style/bootstrap.min.css">
      <link rel="stylesheet" href="//spiritual.casa/style/stylesheet.css">
		<link rel="stylesheet" href="style/icon.css">
		<link rel="stylesheet" href="style/loader.css">
		<link rel="stylesheet" href="style/idangerous.swiper.css">
		<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

            <div id='nrg-user'>
		<div class="be-user-block">
			<div class="be-user-detail">
				<a class="be-ava-user" href="blog-detail-2.html">
				<i class="fa fa-user"></i>
				</a>
				<p class="be-use-name">Daniel Ng</p>
				<span class="be-user-info">
					Singapore, Singapore
				</span>
			</div>
			<div class="be-user-activity-block">
				<div class="row">
				<div class="col-lg-6">
					<a href="blog-detail-2.html" class="be-user-activity-button be-follow-type"><i class="fa fa-plus"></i>FOLLOW</a>
				</div>
				<div class="col-lg-6">
					<a href="blog-detail-2.html" class="col-lg-6 be-user-activity-button send-btn be-message-type"><i class="fa fa-eye"></i>MESSAGE</a>
				</div>
				</div>
			</div>
			<h5 class="be-title">
				About Project
			</h5>
			<p class="be-text-userblock">
				Fusce dolor libero, efficitur et lobortis at, faucibus nec nunc. Proin fermentum turpis eget nisi facilisis lobortis. Praesent malesuada facilisis maximus. Donec sed lobortis tortor. Ut nec lacinia sapien, sit amet dapibus magna.
			</p>
		</div>
		<a href="blog-detail-2.html" class="be-button-vidget like-btn blue-style"><i class="fas fa-thumbs-up"></i>LIKE PROJECT</a>
		<a href="blog-detail-2.html" class="be-button-vidget add-btn grey-style"><i class="fas fa-check"></i>ADD TO COLLECTION</a>
	</div>

      <div class="be-comment-block">
						<h1 class="comments-title">Comments (3)</h1>
						<p class="about-comment-block">
							You must <a href="blog-detail-2.html" class="be-signup-link">SIGN UP</a>
							 to join the conversation.
						</p>
						<div class="be-comment">
								<div class="be-img-comment">	
									<a href="blog-detail-2.html">
										<img src="img/c1.png" alt="" class="be-ava-comment">
									</a>
								</div>
								<div class="be-comment-content">
									
										<span class="be-comment-name">
											<a href="blog-detail-2.html">Ravi Sah</a>
											</span>
										<span class="be-comment-time">
											<i class="fa fa-clock-o"></i>
											May 27, 2015 at 3:14am
										</span>

									<p class="be-comment-text">
										Pellentesque gravida tristique ultrices. 
										Sed blandit varius mauris, vel volutpat urna hendrerit id. 
										Curabitur rutrum dolor gravida turpis tristique efficitur.
									</p>
								</div>
								
							</div>
						<div class="be-comment">
							<div class="be-img-comment">	
									<a href="blog-detail-2.html">
										<img src="img/c2.png" alt="" class="be-ava-comment">
									</a>
								</div>
								<div class="be-comment-content">
									
										<span class="be-comment-name">
											<a href="blog-detail-2.html">Phoenix, the Creative Studio</a>
									</span>
										<span class="be-comment-time">
											<i class="fa fa-clock-o"></i>
											May 27, 2015 at 3:14am
										</span>

									<p class="be-comment-text">
										Nunc ornare sed dolor sed mattis. In scelerisque dui a arcu mattis, at maximus eros commodo. Cras magna nunc, cursus lobortis luctus at, sollicitudin vel neque. Duis eleifend lorem non ant. Proin ut ornare lectus, vel eleifend est. Fusce hendrerit dui in turpis tristique blandit.
									</p>
									</div>
								
							</div>
						<div class="be-comment">
							<div class="be-img-comment">	
									<a href="blog-detail-2.html">
										<img src="img/c3.png" alt="" class="be-ava-comment">
									</a>
								</div>
								<div class="be-comment-content">
										<span class="be-comment-name">
											<a href="blog-detail-2.html">Dorian Camp</a>
									</span>
										<span class="be-comment-time">
											<i class="fa fa-clock-o"></i>
											May 27, 2015 at 3:14am
										</span>
									<p class="be-comment-text">
										Cras magna nunc, cursus lobortis luctus at, sollicitudin vel neque. Duis eleifend lorem non ant
									</p>
								</div>
						</div>
					</div>
				
    `;
  }

  load(){
    this.link.load(item => this.fill(item));
  }

  activate(){
    
    var event = new CustomEvent("open_item", {
      detail: {
        url: this.link.url 
      }
    });

    console.log(event);
    this.dispatchEvent(event);

    return;
    
    if(this.classList.contains('active')) return;
    $(this).siblings('.active').removeClass('active');
    this.classList.add('active');
    
    var path = this.getAttribute('src');
    if(path && !this.$('#article').getAttribute('src')) this.$('#article').setAttribute('src', path.replace(/\/$/, "") + '/article.htm');
  }

  fill(item){
    var path = this.getAttribute('src').replace(/\/$/, "");

    this.$('#title').value = item.title || item.name;
    this.$('#description').value = item.description;

    if(item.img){
      var image = new Image;
      image.src = item.img;
      image.onload = ev => {
        this.$('#img').append(image);
      };
    }

    if(item.stat){
      this.$('#stat-likes').innerText = item.stat.likes;
      this.$('#stat-views').innerText = item.stat.views;
      this.$('#stat-comments').innerText = item.stat.comments;
    }


    if(item.time) this.$('#info-when').setAttribute('datetime', (new Date(item.time)).format());

    this.$('#owner').innerText = item.owner || 'anonymous';

     var path = this.getAttribute('src');
    if(path && !this.$('#article').getAttribute('src')) this.$('#article').setAttribute('src', path.replace(/\/$/, "") + '/article.htm');
  

    this.item = _.extend({}, this.item, item);
  }

  read(){
    var item = _.extend({},
      this.item, {
      title: this.$('#title').value,
      description: this.$('#description').value,
      owner: ''
    });

    item.name = fix4name(item.title);
    if(Acc.main) item.owner = Acc.main.user.email;

    return item;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.item = {};

    this.init();
  }

  init(){
    //this.shadowRoot.adoptedStyleSheets = [styleSheets.fontAwesome];
    this.shadowRoot.innerHTML = Component.template;
    

    this.server = Cfg.server;

    this.main_body = document.body;

    if(this.item){
      if(this.item.icon){
        if(this.item.icon.indexOf('://') + 1)
          this.icon_http = this.item.icon;
      }
    }

    this.$('#upload').addEventListener('click', ev => {
      fileDialog().then(file => {
        var path = this.getAttribute('src').replace(/\/$/, "");
        var img_url = path + '/img.jpg';
        Link(img_url).upload(file[0]).then(r => {
          var image = new Image;
          image.src = 'http'+img_url.replace(/^fs/, '');
          this.$('#img').innerHTML = '';
          this.$('#img').append(image);
          this.link.set('img', image.src);
        });
      });
    });
    
    this.$('#title').addEventListener('click', ev => {
      console.log(ev);
      this.activate();
    }, false);
    
    this.$('#img').addEventListener('click', ev => {
      this.activate();
    }, false);
      
    this.$('#stat-publish').addEventListener('click', ev => {
      //this.activate();
      let item = this.read();
      //item.id = Math.random().toString(36).substr(7);
      var event = new CustomEvent("publish", {
        detail: {item}
      });

      this.dispatchEvent(event);
    }, false);

    this.$('#stat-remove').addEventListener('click', ev => {
      this.remove();
    }, false);
  }

  href(){
    if(!this.item.url) return;
    location.href = this.item.url;
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }


  updateSrc(){
    if(!this.src) return;
  
    this.link = Link(this.src);
    this.link.load(item => {
      this.set('item', item);
    });
  }

  static get observedAttributes(){
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log(name, oldValue, newValue);
    switch(name){
      case 'src':
        this.link = Link(newValue);
        this.load();
        this.$('#title').setAttribute('disabled', 'disabled');
        this.$('#description').setAttribute('disabled', 'disabled');
        break;
      case 'name':
        console.log(`You won't max-out any time soon, with ${newValue}!`);
        break;
    }
  }

  initApp(){
    this.app_div = document.createElement('div');
    this.app_div.classList.add("app");
    this.app_div.style.padding = '52px 0 0 0';

    Index.apps.node.open(this.app_div);

    this.loadHTM();
  }

  loadHTM(){
    this.link.download(content => {
      if(!content) return;
      this.prevHTML = this.innerHTML = typeof content == 'string'?
        content:
        new TextDecoder("utf-8").decode(content || '');
      this.focus();
    });
  }
};


window.customElements.define(Component.is, Component);