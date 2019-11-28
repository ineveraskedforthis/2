'use strict'
var images = {}

function load_image(s, callback) {
    var tmp = new Image();
    tmp.src = s;
    tmp.onload = callback
    return tmp
}

var loaded = Array.apply(null, Array(12)).map(() => 0)

function check_loading() {
    let f = 1;
    for (let i = 0; i < loaded.length; i++){
        f *= loaded[i];
    }
    return f
}

images['apu_eyes_0'] = load_image('static/img/apu_base_eyes.png', () => loaded[0] = 1);
images['apu_blood_eyes_0'] = load_image('static/img/apu_eyes_blood.png', () => loaded[1] = 1);
images['apu_pupils_0'] = load_image('static/img/apu_pupils_0.png', () => loaded[2] = 1);
images['apu_head_base_0'] = load_image('static/img/apu_head_base.png', () => loaded[3] = 1);
images['apu_mouth_0'] = load_image('static/img/apu_mouth_0.png', () => loaded[4] = 1);
images['apu_mouth_1'] = load_image('static/img/apu_mouth_1.png', () => loaded[5] = 1);
images['apu_wrinkles_0'] = load_image('static/img/apu_wrinkles.png', () => loaded[6] = 1);
images['apu_blood_0'] = load_image('static/img/apu_blood_0.png', () => loaded[7] = 1);
images['apu_blood_1'] = load_image('static/img/apu_blood_1.png', () => loaded[8] = 1);
images['apu_blood_2'] = load_image('static/img/apu_blood_2.png', () => loaded[9] = 1);
images['apu_blood_3'] = load_image('static/img/apu_blood_3.png', () => loaded[10] = 1);
images['apu_blood_4'] = load_image('static/img/apu_blood_4.png', () => loaded[11] = 1);


function draw_image(context, image, x, y, w, h) {
    context.drawImage(image, x, y, w, h)
}



function change_image_data(image_data, f) {
    for (var i = 0; i < image_data.data.length; i += 4) {
        let r = image_data.data[i + 0];
        let g = image_data.data[i + 1];
        let b = image_data.data[i + 2];
        let a = image_data.data[i + 3];
        var result = f([r, g, b, a]);
        for (var j = 0; i < 4; i++) {
            image_data.data[i + j] = result[j]
        }
    }
    return image_data
}

function change_alpha(l, a) {
    l[3] = Math.max(Math.min(Math.floor(l[3] * a), 255), 0)
    return l
}

class CharacterImage {
    constructor(canvas, tmp_canvas) {
        this.canvas = canvas.get(0);
        this.tmp_canvas = tmp_canvas.get(0);
        this.draw_order = ['eyes', 'blood_eyes', 'pupils', 'head', 'mouth', 'wrinkles'];
        this.images = {
            head: 'apu_head_base_0', 
            eyes: 'apu_eyes_0', 
            blood_eyes: 'apu_blood_eyes_0', 
            pupils: 'apu_pupils_0',
            mouth_1: 'apu_mouth_1',
            mouth_0: 'apu_mouth_0',
            wrinkles: 'apu_wrinkles_0',
            blood_0: 'apu_blood_0',
            blood_1: 'apu_blood_1',
            blood_2: 'apu_blood_2',
            blood_3: 'apu_blood_3',
            blood_4: 'apu_blood_4'
        };
        this.stats = {rage: 0, blood: 0, power: 0};
        this.w = 400;
        this.h = 274;
        this.pupils_phi = -Math.PI / 2
        this.pupils_rad = 14
    }

    update(rage, blood, power) {
        this.stats.rage = rage;
        this.stats.blood = blood;
        this.stats.power = power;
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        var tmp = this.tmp_canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 400);
        draw_image(ctx, images[this.images['eyes']], 0, 0, this.w, this.h);
        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['blood_eyes']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0)

        if (rage > 50) {
            let x = Math.cos(this.pupils_phi) * this.pupils_rad * 1.5 - 10;
            let y = Math.sin(this.pupils_phi) * this.pupils_rad * 0.5 - 10;
            draw_image(ctx, images[this.images['pupils']], x, y, this.w, this.h);
            this.pupils_phi += Math.PI / 16;
        }
        else {
            draw_image(ctx, images[this.images['pupils']], 0, 0, this.w, this.h);
        }

        draw_image(ctx, images[this.images['head']], 0, 0, this.w, this.h);
        
        let tmp_blood = this.stats.blood;
        let c = 0;
        while (tmp_blood > 0 && c <= 4) {
            tmp.clearRect(0, 0, 400, 400);
            draw_image(tmp, images[this.images['blood_' + c]], 0, 0, this.w, this.h)
            if (tmp_blood < 20) {
                var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
                for (var i = 3; i < image_data.data.length; i+=4) {
                    image_data.data[i] = Math.floor(image_data.data[i] * tmp_blood / 20)
                }
                tmp.putImageData(image_data, 0, 0);
            }
            ctx.drawImage(this.tmp_canvas, 0, 0);
            tmp_blood -= 20;
            c += 1;
        }

        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['wrinkles']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0);

        if (rage > 80) {
            draw_image(ctx, images[this.images['mouth_1']], 0, 0, this.w, this.h);
        }
        else {
            draw_image(ctx, images[this.images['mouth_0']], 0, 0, this.w, this.h);
        }
    }
}

class GameField {
    constructor(canvas) {
        this.canvas = canvas.get(0);
        this.hex_side = 20;
        this.camera = [-50, -200];
        this.hovered = null;
        this.selected = null;
        this.x = 10;
        this.y = 10;
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
    var game_field = new GameField($('#game-field'));
    game_field.draw()
    var market_table = new MarketTable($('#market'));
    var char_image = new CharacterImage($('#char-image'), $('#tmp-canvas'));

    function draw(tmp) {
        if (check_loading()) {
            char_image.draw()
        } 
        game_field.draw();
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
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
                var dx = event.pageX - prev_mouse_x;
                var dy = event.pageY - prev_mouse_y;
                game_field.move(dx, dy);
            }
            prev_mouse_x = event.pageX;
            prev_mouse_y = event.pageY;
        }
        var mouse_pos = get_pos_in_canvas(game_field.canvas, event);
        var hovered_hex = game_field.get_hex(mouse_pos.x, mouse_pos.y);
        game_field.hover_hex(hovered_hex[0], hovered_hex[1]);
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
        $('#char-info').append($('<p>').text(`exp: ${msg.data.exp}`));
        $('#char-info').append($('<p>').text(`level: ${msg.data.level}`));
        $('#char-info').append($('<p>').text(`skill points: ${msg.data.skill_points}`));
        $('#char-info').append($('<p>').text(`savings: ${msg.savings.data['standard_money']}`));
        for (let i in msg.data.stats) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.data.stats[i]}`));
        };
        $('#char_info').append($('<p>').text(`${msg.data.other}`));
        for (let i in msg.data.other) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.data.other[i]}`));
        }
        char_image.update(msg.data.other.rage, msg.data.other.blood_covering, msg.data.stats.pow)
        for (let i in msg.stash) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.stash[i]}`));
        };
    });

    socket.on('market-data', data => {
        market_table.update(data);
    })

    socket.on('alert', msg => {
        alert(msg);
    });
});
