$(function() {
    var socket = io();
    selected = null;
    $('#login-frame').submit(e => {
        e.preventDefault();
        socket.emit('login', {login: $('#login-l').val(), password: $('#password-l').val()});
    });

    $('#reg-frame').submit(e => {
        e.preventDefault();
        socket.emit('reg', {login: $('#login-r').val(), password: $('#password-r').val()});
    });

    $('li').click(function() {
        if (selected != null) {
            $(selected).removeClass('selected');
        }
        $(this).addClass('selected');
        selected = this;
    });

    socket.on('is-reg-valid', msg => {
        if (msg != 'ok') {
            alert(msg);
        }
    });
    
    socket.on('is-reg-completed', msg => {
        alert(msg);
    })
});