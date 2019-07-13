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

    $('#users-list').on('click', 'li', function() {
        if (selected == this){
            $(selected).removeClass('selected');
            selected = null;
        } else if (selected != null) {
            $(selected).removeClass('selected');
            $(this).addClass('selected');
            selected = this;
        } else {
            $(this).addClass('selected');
            selected = this;
        }
    });

    socket.on('is-reg-valid', msg => {
        if (msg != 'ok') {
            alert(msg);
        }
    });
    
    socket.on('is-reg-completed', msg => {
        if (msg != 'ok') {
            alert(msg);
        }
    })
    
    socket.on('new-user-online', msg => {
        $('ul').append($('<li>').text(msg));
    })
    
    socket.on('users-online', msg => {
        console.log(msg);
        $('ul').empty();
        msg.forEach(item => {
            $('ul').append($('<li>').text(msg));
        })
    });
});