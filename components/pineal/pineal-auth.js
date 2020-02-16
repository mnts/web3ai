import servers from '../../src/data/servers.js';

const domain = 'spiritual.casa';

class element extends HTMLElement{
  static get is(){
    return 'pineal-auth';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          display: inline-block;
        }
      </style>

      <link rel="stylesheet" href="//`+Cfg.server+`/design/interface.css">
      <link rel="stylesheet" href="//`+Cfg.server+`/design/components/pineal-auth.css">
      <link rel="stylesheet" href="//${Cfg.server}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">


      <form id='auth' class='login'>
        <input placeholder='E-mail address' name='email'/>
        <br/>
        <input placeholder='Password' type='password' name='password'/>
        <input placeholder='Repeat it' type='password' name='repassword'/>
        
        <p id='agree_p'>
          <input name='agree' type='checkbox'/>
          I have read and agree with 
          <a id='agree_terms'>Terms</a> and 
          <a id='agree_data'>Data Policy</a>
        </p>
                
        <button name='login' name='login' type='submit'>
          <i class='fas fa-user-lock'></i>
          Login
        </button>
        <a id='open_register'>Create an account</a>

        <button name='register' name='register' type='submit'>
          <i class='fas fa-user-plus'></i>
          Register
        </button>
        <a id='open_login'>Login</a>

        <p id='error'></p>
      </form>

      <h4>Authenticate using social media</h4>
      <div id="head-socMedia">
          <button id="auth-facebook">
              <i class="fab fa-facebook"></i>
          </button>

          <button id="auth-instagram">
              <i class="fab fa-instagram"></i>
          </button>

          <button id="auth-twitter">
              <i class="fab fa-twitter"></i>
          </button>
      </div>
    `;
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

  auth(user){
    var ev = new CustomEvent('authenticated', {
      detail: { user }
    });
    
    document.body.dispatchEvent(ev);
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.init();
  }

  init(){
    this.shadowRoot.innerHTML = element.template;
    this.form = this.select('#auth').elements;
  
    
     var that = this;
     var auth = this.select('#auth');
     auth.addEventListener('submit', ev => {
        var email = this.form.email.value;
        
        var re = /\S+@\S+\.\S+/;
        if(!re.test(email)){
            this.form.email.classList.add('err');
            this.select('#error').textContent = 'Wrong email format'
        }
        
        let password = this.form.password.value;
        if(password.length < 6){
           this.form.password.classList.add('err');
           this.select('#error').textContent = 'Password is too sort'
        }

       if(auth.classList.contains('login')){

         if(!this.select('.err')){
           auth.login.disabled = true;
           this.W({
             cmd: 'auth', email, password
           }).then(r => {
             this.select('#error').textContent = r.error || '';
              auth.login.removeAttribute('disabled');

              if(r.error == 'wrong password')
                this.form.password.classList.add('err');

              if(r.error == 'not found')
                this.form.email.classList.add('err');

              if(r.user) this.auth(r.user);
           });
         }
       }
       else
       if(auth.classList.contains('register')){
         if(password != this.form.repassword.value){
            this.form.repassword.classList.add('err');
            this.select('#error').textContent = 'Passwords doesnt match';
         }
    
          if(!this.form.agree.checked){
             this.select('#error').textContent = 'Not agree with rules';
             this.form.agree.classList.add('err');
          }

         if(!this.select('.err')){
          auth.register.disabled = true;
           var user = {email};
           this.W({
             cmd: 'createUser', user, password
           }).then(r => {
              this.select('#error').textContent = r.error || '';

              if(r.error == 'taken name'){
                this.select('#error').textContent = 'already exists';
                this.form.email.classList.add('err');
              }

              auth.register.disabled = false;
              if(r.user) this.auth(r.user);
           }); 
         }
       }
      ev.preventDefault();
      return false;

     });

     this.form.email.addEventListener('change', ev => {
        let email = ev.composedPath()[0];
        email.classList.remove('err');
        
        this.W({
          cmd: 'loadProfile',
          email: email.value
        }).then(r => {
          var cl = auth.classList;
          if(r.user){
            cl.add('login');
            cl.remove('register');
          }
          else{
            cl.add('register');
            cl.remove('login');
          }
          this.user = r.user;
        });
    });

    this.form.agree.addEventListener('change', ev => {
        this.form.agree.classList.remove('err');
    });


    this.select('#open_register').addEventListener('click', ev => {
      this.form.email.classList.remove('err');
      var cl = auth.classList;
      cl.add('register');
      cl.remove('login');
    });
    
    this.select('#open_login').addEventListener('click', ev => {
      this.form.email.classList.remove('err');
      var cl = auth.classList;
      cl.add('login');
      cl.remove('register');
    });


     this.form.password.addEventListener('change', ev => {
        console.log(ev);
        let input = ev.composedPath()[0];
        input.classList.remove('err');
     });

     this.form.repassword.addEventListener('change', ev => {
        let input = ev.composedPath()[0];
        input.classList.remove('err');
     });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
