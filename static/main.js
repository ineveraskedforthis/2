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
    
    $('#attack-button').click(() => {
        socket.emit('attack', null);
    })

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
        $('#users-list').append($('<li>').text(msg));
    })
    
    socket.on('users-online', msg => {
        $('#users').empty();
        msg.forEach(item => {
            $('#users').append($('<li>').text(msg));
        })
    });
    
    socket.on('log-message', msg => {
        $('#game-log').append($('<p>').text(msg));
    });
    
    socket.on('char-info', msg =>{
        $('#char-info').empty();
        $('#char-info').append($('<p>').text(`name: ${msg.login}`))
        $('#char-info').append($('<p>').text(`hp:${msg.character.hp}/${msg.character.max_hp}`))
    });
});