$(function(){
  $('#search-input').bindEnter(function(ev){

    var link = L(this.value);

    console.log(link);

    link.load(item => console.log(item));

    link.children(links => console.log(links));
  });
});
