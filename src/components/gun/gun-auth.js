import account from '../../account.js';

const url = new URL(import.meta.url);

class element extends HTMLElement{
  static get is(){
    return 'gun-auth';
  }

  static get template(){
    return`
      <style>
        #auth{display: none;}
        
        :host{
          display: inline-block;
        }
      </style>

      <link rel="stylesheet" href="//${url.host}/design/interface.css">
      <link rel="stylesheet" href="//${url.host}/design/components/pineal-auth.css">
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

      <link rel="stylesheet" href="//${url.host}/design/tree.css" rel="preload" as="style">
      <style>
          .tree menu{
              display: none;
          }
      </style>
      

      <form id='auth' class='login'>
        <input placeholder='E-mail address' name='email'/>
        <br/>
        <input placeholder='Password' type='password' name='password'/>
        <input placeholder='Repeat it' type='password' name='repassword'/>

        <div id='reg_setup'>
          
        </div>
        
        <p id='agree_p'>
          <input name='agree' type='checkbox'/>
          I have read and agree with the 
          <a id='agree_terms'>Terms</a> and 
          <a id='agree_data'>Data Policy</a>
        </p>
                
        <button name='login' formnovalidate name='login' type='submit'>
          <i class='fas fa-user-lock'></i>
          Login
        </button>
        <a id='remind'>Forgot?</a>
        <hr/>

        <button name='register' name='register' type='submit'>
          <i class='fas fa-user-plus'></i>
          Register
        </button>
        <a id='open_login'>Login</a>

        <p id='error'></p>
        <button id='open_register'>
          <i class='fas fa-user-plus'></i>
          Create an account
        </button>
      </form>

      <h4>Authenticate using social media</h4>
      <pineal-networks></pineal-networks>
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
      detail: { user, account}
    });
    
    document.body.dispatchEvent(ev);
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    
    this.build_typeSelection();

		console.trace();
    this.init();
  }

  build_typeSelection(types){
    /*
    Cfg.registration.user_types
    <label class="container">One
      <input type="checkbox" checked="checked">
      <span class="checkmark"></span>
    </label>
    */
  }

  init(){
    this.shadowRoot.innerHTML = element.template;
    this.form = this.select('#auth').elements;
    this.item = {};
  
    
     var that = this;
     var auth = this.select('#auth');
     auth.addEventListener('submit', ev => {
        var q = {
         cmd: 'auth'
       };

        var email = this.form.email.value;

        if(!email.length){
            this.form.email.classList.add('err');
            this.select('#error').textContent = 'Cant be empty'
        }
        
        var re = /\S+@\S+\.\S+/;
        if(re.test(email))
          q.email = email;
        else{
          q.name = email;
            //this.form.email.classList.add('err');
            //this.select('#error').textContent = 'Wrong email format'
        }
        
        let password = q.password = this.form.password.value;
        if(q.password.length < 6){
           this.form.password.classList.add('err');
           this.select('#error').textContent = 'Password is too sort'
        }

       if(auth.classList.contains('login')){
         if(!this.select('.err')){
           auth.login.disabled = true;
           this.W(q).then(r => {
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

         var re = /\S+@\S+\.\S+/;
          if(!re.test(email)){
              this.form.email.classList.add('err');
              this.select('#error').textContent = 'Wrong email format'
          }

    
          if(!this.form.agree.checked){
             this.select('#error').textContent = 'Not agree with rules';
             this.form.agree.classList.add('err');
          }

         if(!this.select('.err')){
           auth.register.disabled = true;
           var user = this.item || {};
           user.email = email;
           user.value = 0;
           
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


     this.select('#agree_terms').addEventListener('click', ev => {
      document.querySelector('ilunafriq-footer').select('li[name=terms] a').click();
     });


     this.select('#agree_data').addEventListener('click', ev => {
      document.querySelector('ilunafriq-footer').select('li[name=policy] a').click();
     });

     this.select('#remind').addEventListener('click', ev => {
        var email = this.form.email.value;

        var re = /\S+@\S+\.\S+/;
        if(!re.test(email))
            return $(this.form.email).blink('red');

        var confirmed = confirm('Send authentication link to '+email+' ?');
        if(confirmed) this.W({
          cmd: 'sendSession',
          email
        }).then(r => {
          $(auth.login).blink('green', 200, () => {
            auth.login.innerText = 'Now check your mailbox';
            auth.login.disabled = true;
          });
        });
     });

     this.form.email.addEventListener('change', ev => {
        let email = ev.composedPath()[0];
        email.classList.remove('err');

        email.value = email.value.toLowerCase();

        console.log('changed');

        var q = {
          cmd: 'loadProfile'
        }


        var re = /\S+@\S+\.\S+/;
        q[re.test(email.value)?'email':'name'] = email.value;
        
        this.W(q).then(r => {
          if(r.user && this.classList.contains('super') && !r.user.super){
             this.select('#error').textContent = 'Only for admins';
              email.classList.add('err');
             return;
          }

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
      ev.preventDefault();
      return false;
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
        this.form.repassword.classList.remove('err');
     });

     this.form.repassword.addEventListener('change', ev => {
        let input = ev.composedPath()[0];
        input.classList.remove('err');
        this.form.password.classList.remove('err');
     });

    $(this.form.password).add(this.form.email).bindEnter(ev => {
        if(auth.classList.contains('login'))
          this.form.login.click();
    });
  }

  select(selector){
    return this.shadowRoot.querySelector(selector);
  }

  connectedCallback(){
    const reg_setup = this.select('#reg_setup');
    if(Cfg.registration && Cfg.registration.tree_src && !reg_setup.innerHTML.trim()){
        setTimeout(() => {
          reg_setup.innerHTML = `
              <pineal-tree src='${Cfg.registration.tree_src}'></pineal-tree>
          `;

        }, 1300);
        
        

        reg_setup.addEventListener('fractal_update', ev => {
          var path = ev.detail.path.replace(/^\/|\/$/g, '').replace(/\//g, ".");
          _.set(this.item, path, ev.detail.value);
          console.log(this.item);
        });
    }
  }
};


		console.trace();

window.customElements.define(element.is, element);
