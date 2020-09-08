var modal;

const selectAll = qs => Array.prototype.slice.call(
	document.querySelectorAll(qs)
);

const select = qs => document.querySelector(qs);

// create an observer instance
var observer = new MutationObserver(muts => {
    let cl = document.body.classList;
    setTimeout(() => {
        muts.forEach(mut => {
            if(
                mut.type == 'attributes' &&
                mut.attributeName == 'class'
            ){
                const on = mut.target.classList.contains('on');
                modal.classList[on?'add':'remove']('on');
            }
        });
    }, 80);
});

const observe = (mdl) => {
    observer.observe(mdl, {
        attributes: true
    });
}

window.addEventListener('DOMContentLoaded', () => {
    modal = select('#modal');

    modal.addEventListener('click', ev => {
         modal.classList.remove('on');
         selectAll('.modal').map(el => {
            el.classList.remove('on');
        });

        modal.dispatchEvent(new Event('close'));
    });

    // pass in the target node, as well as the observer options
    selectAll('.modal').map(mdl => {
        observe(mdl);
    });
});


export {observe, modal};