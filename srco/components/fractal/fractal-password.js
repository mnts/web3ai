
import servers from '../../data/servers.js';
const url = new URL(import.meta.url);
import account from '../../account.js';

class element extends HTMLElement{
  static get is(){
    return 'fractal-password';
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
      <link rel="stylesheet" href="//${url.host}/design/components/fratal-password.css">
      <link rel="stylesheet" href="//${url.host}/node_modules/@fortawesome/fontawesome-free/css/all.min.css" type="text/css">

       <form accept-charset="UTF-8" role="form">
            <fieldset>
                <!--
                <div class="form-group">
                    <span class="input-group-addon"><i class="fa fa-lock" aria-hidden="true"></i></span>
                    <input type="password" placeholder="Current Password" name="cpassword" class="form-control" value="">
                </div>
                -->

                <div class="inp">
                    <span class="input-group-addon"><i class="fa fa-lock text-danger" aria-hidden="true"></i></span>
                    <input type="password" placeholder="New Password" name="password" class="form-control" value="">
                </div>

                <div class="inp">
                   <span class="input-group-addon"><i class="fa fa-lock text-danger" aria-hidden="true"></i></span>
                   <input type="password" placeholder="Confirm Password" name="repassword" class="form-control" value="">
                </div>

                <button name='submit' type="submit">&#10004;</button>
                
                <p id='error'></p>
            </fieldset>
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

  done(user){
    var ev = new CustomEvent('password_changed');
    
    document.body.dispatchEvent(ev);
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    
    this.build_typeSelection();

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
    this.shadowRoot.innerHTML = this.constructor.template;
    var form = this.select('form');
    this.form = form.elements;
    this.item = {};
  
    

     var that = this;
     form.addEventListener('submit', ev => {
        let password = this.form.password.value;
        if(password.length < 6){
           this.form.password.classList.add('err');
           this.select('#error').textContent = 'Password is too sort'
        }

         if(password != this.form.repassword.value){
            this.form.repassword.classList.add('err');
            this.select('#error').textContent = 'Passwords doesnt match';
         }

        this.form.submit.disabled = true;
         if(!this.select('.err')){
           this.W({
             cmd: 'changePassword', password
           }).then(r => {
              this.select('#error').textContent = r.error || '';
              
              /*
              if(r.error == 'taken name'){
                this.select('#error').textContent = 'already exists';
                this.form.email.classList.add('err');
              }
              */

              this.form.submit.disabled = false;
              if(r.done) $(this.form.submit).blink('green', 2000, () => {
                this.hidden = true;
              });
              else $(this.form.submit).blink('red');
           }); 
         }
      ev.preventDefault();
      return false;

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
