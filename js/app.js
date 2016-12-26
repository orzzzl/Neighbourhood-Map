var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });
}

$(function() {

    $('#slide-submenu').on('click', function() {
        $(this).closest('.list-group').fadeOut('slide', function() {
            $('.mini-submenu').fadeIn();
        });

    });

    $('.mini-submenu').on('click', function() {
        $(this).next('.list-group').toggle('slide');
        $('.mini-submenu').hide();
    })
})
