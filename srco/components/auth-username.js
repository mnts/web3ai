class element extends PolymerElement{
  static get is(){
    return 'auth-username';
  }

  static get template(){
    return`
    	<link rel="stylesheet" href="/design/components/auth-username.css">
      <style>
        main{
          display: block;
        }

        :host{
          display: inline-block;
        }
      </style>

      <form name='auth'/>
		<paper-input title='Email' name='email'/>
		<paper-input title='Password' type='password' name='password'/>
		<button type='submit'>Log In</button>
      </form>
    `;
  }

  
  constructor(){
    super();
    this.server = Cfg.server;
    this.domain = document.location.host;
  }

  ready(){
    super.ready();
  }
};


window.customElements.define(element.is, element);
