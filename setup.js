window.html = function(cont){
  var parser = new DOMParser();
  
  
  return parser.parseFromString(cont, "text/html");
}
