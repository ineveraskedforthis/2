'use strict'

class GameField {
    constructor(canvas, x, y) {
        this.canvas = canvas.get(0);
        this.hex_side = 20;
        this.camera = [-50, -200];
        this.x = x;
        this.y = y;
        this.hovered = null;
        this.selected = null;
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 400);
        for (var i = 0; i < this.x; i++) {
            for (var j = 0; j < this.y; j++) {
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 255, 0, 0.5)');
                } else {
                    this.draw_hex(i, j, 'stroke', '(0, 0, 0, 1)');
                }
            }
        }
    }

    draw_hex(i, j, mode, color) {
        var ctx = this.canvas.getContext('2d');
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var center_x = (this.hex_side + w) * i - this.camera[0];
        var center_y = 2 * h * j - h * i - this.camera[1];
        ctx.fillStyle = 'rgba' + color;
        ctx.beginPath();
        ctx.moveTo(center_x + this.hex_side, center_y);
        ctx.lineTo(center_x + w, center_y - h);
        ctx.lineTo(center_x - w, center_y - h);
        ctx.lineTo(center_x - this.hex_side, center_y);
        ctx.lineTo(center_x - w, center_y + h);
        ctx.lineTo(center_x + w, center_y + h);
        if (mode == 'fill') {
            ctx.fill();
        } else if (mode == 'stroke') {
            ctx.lineTo(center_x + this.hex_side, center_y);
            ctx.stroke()
        }
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.font = '10px Times New Roman';
        ctx.fillText(`${i} ${j}`, center_x - w, center_y + h / 2);
    }

    move(dx, dy) {
        this.camera[0] -= dx;
        this.camera[1] -= dy;
    }

    get_hex(x, y) {
        x = x + this.camera[0];
        y = y + this.camera[1];
        var h = this.hex_side * Math.sqrt(3) / 2;
        var a_vector = [Math.sqrt(3) / 2, -1 / 2];
        var c_vector = [Math.sqrt(3) / 2, 1 / 2];
        var a = Math.floor((x * a_vector[0] + y * a_vector[1]) / h);
        var b = Math.floor(y / h);
        var c = Math.floor((x * c_vector[0] + y * c_vector[1]) / h);
        var alpha = [[0, 0, 0], [0, -1, 0], [0, -1, -1], [-1, -1, -1], [-1, 0, -1], [-1, 0, 0]];
        for (var i = 0; i < 6; i++) {
            var y_mult_3 = b + c - alpha[i][1] - alpha[i][2];
            if (y_mult_3 % 3 == 0) {
                var y = Math.floor(y_mult_3 / 3);
                var x = c - y - alpha[i][2];
                if (a == 2 * x - y + alpha[i][0]) {
                    return [x, y];
                }
            }

        }
    }

    hover_hex(i, j) {
        this.hovered = [i, j];
    }
}

class MarketTable {
    constructor(container) {
        this.data = [];
        this.container = container;
        this.table = $('<table>');
    }

    draw() {
        this.container.empty();
        this.container.append(this.table);
    }

    update(data = []) {
        this.data = data;
        this.table = $('<table>');
        var header = this.populate_row($('<tr>'), ['type', 'tag', 'amount', 'price', 'name']);
        this.table.append(header);
        for (var i of this.data) {
            var row = this.populate_row($('<tr>'), [i.typ, i.tag, i.amount, i.price, i.owner_name]);
            this.table.append(row);
        }
        this.draw();
    }

    populate_row(row, l) {
        for (var i of l) {
            row.append($('<td>').text(i));
        }
        return row;
    }

}

function get_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}

$(function() {
    var socket = io();
    var selected = null;
    var game_field = new GameField($('#game-field'), 4, 4);
    var market_table = new MarketTable($('#market'));
    market_table.update();
    var prev_mouse_x = null;
    var prev_mouse_y = null;
    var is_dragging = false;
    socket.emit('get-market-data', null);

    $('#game-field').hide();
    $('#market').hide();
    $('#sell-form-con').hide();

    $('#game-field').mousedown(() => {
        is_dragging = true;
        prev_mouse_x = null;
        prev_mouse_y = null;
    });

    $(window).mouseup(() => {
        is_dragging = false;
    });

    $('#game-field').mousemove(event => {
        if (is_dragging) {
            if (prev_mouse_x != null) {
                dx = event.pageX - prev_mouse_x;
                dy = event.pageY - prev_mouse_y;
                game_field.move(dx, dy);
            }
            prev_mouse_x = event.pageX;
            prev_mouse_y = event.pageY;
        }
        var mouse_pos = get_pos_in_canvas(game_field.canvas, event);
        var hovered_hex = game_field.get_hex(mouse_pos.x, mouse_pos.y);
        game_field.hover_hex(hovered_hex[0], hovered_hex[1]);
        game_field.draw();
    });

    $('#login-frame').submit(e => {
        e.preventDefault();
        socket.emit('login', {login: $('#login-l').val(), password: $('#password-l').val()});
    });

    $('#reg-frame').submit(e => {
        e.preventDefault();
        socket.emit('reg', {login: $('#login-r').val(), password: $('#password-r').val()});
    });

    $('#send-message-frame').submit(e => {
        e.preventDefault();
        socket.emit('new-message', $('#message').val())
    })

    $('#buy-form-con').submit(e => {
        e.preventDefault();
        socket.emit('buy', {tag: $('#buy-tag-select').val(),
                            amount: $('#buy-amount').val(),
                            money: $('#buy-money').val(),
                            max_price: $('#buy-max-price').val()});
    });

    $('#sell-form-con').submit(e => {
        e.preventDefault();
        socket.emit('sell', {tag: $('#sell-tag-select').val(),
                             amount: $('#sell-amount').val(),
                             price: $('#sell-price').val()});
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
    });

    $('#show-log').click(() => {
        $('#game-field').hide();
        $('#game-log').show();
        $('#market').hide();
    });

    $('#show-map').click(() => {
        game_field.draw();
        $('#game-field').show();
        $('#game-log').hide();
        $('#market').hide();
    });

    $('#show-market').click(() => {
        $('#game-field').hide();
        $('#game-log').hide();
        $('#market').show();
    });

    $('#show-buy-form').click(() => {
        $('#buy-form-con').show();
        $('#sell-form-con').hide();
    });

    $('#show-sell-form').click(() => {
        $('#buy-form-con').hide();
        $('#sell-form-con').show();
    });

    socket.on('tags', msg => {
        for (var tag of msg) {
            $('#buy-tag-select').append($('<option>').val(tag).text(tag));
            $('#sell-tag-select').append($('<option>').val(tag).text(tag));
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
    });

    socket.on('is-login-valid', msg => {
        if (msg != 'ok') {
            alert(msg);
        }
    });

    socket.on('is-login-completed', msg => {
        if (msg != 'ok') {
            alert(msg);
        }
    });

    socket.on('new-user-online', msg => {
        $('#users-list').append($('<li>').text(msg));
    });

    socket.on('users-online', msg => {
        $('#users').empty();
        msg.forEach(item => {
            $('#users').append($('<li>').text(msg));
        })
    });

    socket.on('log-message', msg => {
        $('#game-log').append($('<p>').text(msg));
    });

    socket.on('new-message', msg => {
        if (msg != 'message-too-long')
            $('#game-log').append($('<p>').text(msg.user + ' : ' + msg.msg));
    })

    socket.on('char-info', msg => {
        $('#char-info').empty();
        $('#char-info').append($('<p>').text(`name: ${msg.name}`));
        $('#char-info').append($('<p>').text(`hp:${msg.hp}/${msg.max_hp}`));
        $('#char-info').append($('<p>').text(`exp: ${msg.exp}`));
        $('#char-info').append($('<p>').text(`savings: ${msg.savings.data['standard_money']}`));
        for (let i in msg.stash) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.stash[i]}`));
        }
    });

    socket.on('market-data', data => {
        market_table.update(data);
    })

    socket.on('alert', msg => {
        alert(msg);
    });
});
