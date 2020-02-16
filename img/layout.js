$(() => {
    $('#home-post').click(ev => {
        $('#catalogem-stories')[0].create();
        console.log($('#catalogem-stories')[0]);
    });
});