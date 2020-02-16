import servers from '../data/servers.js';

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
          width: 190px;
        }
      </style>

      <link rel="stylesheet" href="//`+Cfg.server+`/design/components/pineal-auth.css">


      <form id='auth'>
        <auth-blockstack></auth-blockstack>

        <input placeholder='Email' name='email'/>

        <input placeholder='Password' type='password' name='password'/>
        <input placeholder='Repeat it' type='password' name='repassword'/>
        
        <button name='login' name='login' type='submit'>Log In</button>
        <button name='register' type='submit'>Register</button>
      </form>
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
    this.form = this.$('#auth').elements;
  
    
     var that = this;
     var auth = this.$('#auth');
     auth.addEventListener('submit', ev => {
        var email = this.form.email.value;
        
        var re = /\S+@\S+\.\S+/;
        if(!re.test(email))
            this.form.email.classList.add('err');
        
        let password = this.form.password.value;
        if(password.length > 8)
           this.form.password.classList.add('err');

       if(auth.classList.contains('login')){
         this.W({
           cmd: 'auth', email, password
         }).then(r => {
            if(r.user) this.auth(r.user);
         });
       }
       else
       if(auth.classList.contains('register')){

         if(password != this.form.repassword.value)
            this.form.repassword.classList.add('err');

         if(!this.$('.err')){
           var user = {email};
           this.W({
             cmd: 'createUser', user, password
           }).then(r => {
              if(r.user) this.auth(r.user);
           }); 
         }
       }
      ev.preventDefault();
      return false;
     });

     this.form.email.addEventListener('change', ev => {
        let email = ev.path[0];
        email.classList.remove('err');
        
        servers.connect(Cfg.api).then(ws => {
          ws.send({
            cmd: 'loadProfile',
            email: email.value
          }, r => {
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
    });


     this.form.password.addEventListener('change', ev => {
        let input = ev.path[0];
        input.classList.remove('err');
     });

     this.form.repassword.addEventListener('change', ev => {
        let input = ev.path[0];
        input.classList.remove('err');
     });
  }

  $(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
  }
};


window.customElements.define(element.is, element);
