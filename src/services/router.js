/*
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state))
}
*/

class Router{
  constructor(){
    
  }

  get path(){
    return document.location.pathname;
  }

  get p(){
     return this.path.split('/').slice(1);
  }
}

const initial = {
	p: document.location.pathname.split('/').slice(1)
};

/*
history.pushState({page: 1}, "title 1", "?page=1")
history.pushState({page: 2}, "title 2", "?page=2")
history.replaceState({page: 3}, "title 3", "?page=3")
history.back() // alerts "location: http://example.com/example.html?page=1, state: {"page":1}"
history.back() // alerts "location: http://example.com/example.html, state: null"
history.go(2)  // alerts "location: http://example.com/example.html?page=3, state: {"page":3}"
*/

var router = new Router;

export {initial, Router};

export default router;