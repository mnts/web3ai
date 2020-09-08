const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);

window.addEventListener('DOMContentLoaded', function(){
    selectAll('#menu-icons > a').map(a => {
        a.addEventListener('click', ev => {
            console.dir(a);
            
            document.querySelector('#body').open(a.hash);

            ev.preventDefault();
            return false;
        });
    });
});