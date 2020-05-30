// eslint-disable-next-line no-undef
var socket = io();

var prev_mouse_x = null;
var prev_mouse_y = null;
var is_dragging = false;

var SKILLS = {};

function get_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}

document.getElementById('map').onmousedown = () => {
    is_dragging = true;
    prev_mouse_x = null;
    prev_mouse_y = null;
}

document.onmouseup = () => {
    is_dragging = false;
};

document.getElementById('map').onmousemove = event => {
    if (is_dragging) {
        if (prev_mouse_x != null) {
            var dx = event.pageX - prev_mouse_x;
            var dy = event.pageY - prev_mouse_y;
            map.move(dx, dy);
        }
        prev_mouse_x = event.pageX;
        prev_mouse_y = event.pageY;
    }
    var mouse_pos = get_pos_in_canvas(map.canvas, event);
    var hovered_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
    map.hover_hex(hovered_hex[0], hovered_hex[1]);
};

function show(tag) {
    document.getElementById('battle_tab').style.visibility = 'hidden';
    document.getElementById('market_tab').style.visibility = 'hidden';
    document.getElementById('market_control_tab').style.visibility = 'hidden';
    document.getElementById('tactics_tab').style.visibility = 'hidden';
    document.getElementById('skilltree_tab').style.visibility = 'hidden';
    document.getElementById('map_tab').style.visibility = 'hidden';
    document.getElementById(tag).style.visibility = 'visible';
}

function show_game() {
    document.getElementById('login_container').style.visibility = 'hidden';
    document.getElementById('game_container').style.visibility = 'visible';
    show('battle_tab');
}

document.getElementById('open_reg_window_button').onclick = () => {
    document.getElementById('login-frame').style.visibility = 'hidden';
    document.getElementById('reg-frame').style.visibility = 'visible';
    document.getElementById('open_login_window_button').classList.remove('selected');
    document.getElementById('open_reg_window_button').classList.add('selected');
}

document.getElementById('open_login_window_button').onclick = () => {
    document.getElementById('reg-frame').style.visibility = 'hidden';
    document.getElementById('login-frame').style.visibility = 'visible';
    document.getElementById('open_reg_window_button').classList.remove('selected');
    document.getElementById('open_login_window_button').classList.add('selected');
}

document.getElementById('reg-frame').onsubmit = (event) => {
    event.preventDefault();
    let login = document.getElementById('login-r').value;
    let password = document.getElementById('password-r').value;
    socket.emit('reg', {login: login, password: password});
}

document.getElementById('login-frame').onsubmit = (event) => {
    event.preventDefault();
    let login = document.getElementById('login-l').value;
    let password = document.getElementById('password-l').value;
    socket.emit('login', {login: login, password: password});
}

document.getElementById('open_chat_button').onclick = () => {
    document.getElementById('log').style.visibility = 'hidden';
    document.getElementById('chat').style.visibility = 'visible';
    document.getElementById('open_log_button').classList.remove('selected');
    document.getElementById('open_chat_button').classList.add('selected');
}

document.getElementById('open_log_button').onclick = () => {
    document.getElementById('chat').style.visibility = 'hidden';
    document.getElementById('log').style.visibility = 'visible';
    document.getElementById('open_chat_button').classList.remove('selected');
    document.getElementById('open_log_button').classList.add('selected');
}

document.getElementById('send_message_button').onclick = (event) => {
    event.preventDefault();
    let message = document.getElementById('message_field').value;
    socket.emit('new-message', message);
}

document.getElementById('buy_form_con').onsubmit = (event) => {
    event.preventDefault();
    let tag = document.getElementById('buy_tag_select').value;
    let amount = document.getElementById('buy_amount').value;
    let money = document.getElementById('buy_money').value;
    let max_price = document.getElementById('buy_max_price').value;
    socket.emit('buy', {tag: tag,
                        amount: amount,
                        money: money,
                        max_price: max_price});
}

document.getElementById('sell_form_con').onsubmit = (event) => {
    event.preventDefault();
    let tag = document.getElementById('sell_tag_select').value;
    let amount = document.getElementById('sell_amount').value;
    let price = document.getElementById('sell_price').value;
    socket.emit('sell', {tag: tag,
                         amount: amount,
                         price: price});
}


document.getElementById('attack_button').onclick = () => {
    show('battle_tab');
    socket.emit('attack', null);
}

document.getElementById('market_button').onclick = () => {
    show('market_tab');
}
document.getElementById('market_control_button').onclick = () => {
    show('market_control_tab');
}
document.getElementById('map_button').onclick = () => {
    show('map_tab');
}
document.getElementById('tactics_button').onclick = () => {
    show('tactics_tab');
}
document.getElementById('skilltree_button').onclick = () => {
    show('skilltree_tab');
}


socket.on('tags', msg => {
    for (var tag of msg) {
        var tag_option = new Option(tag, tag);
        document.getElementById('buy_tag_select').add(tag_option);
        tag_option = new Option(tag, tag);
        document.getElementById('sell_tag_select').add(tag_option);
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
    } else if (msg == 'ok') {
        show_game();
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
    } else if (msg == 'ok') {
        show_game();
    }
});

socket.on('log-message', msg => {
    var log = document.getElementById('log');
    var new_line = document.createElement('p');
    var text = document.createTextNode(msg);
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight
});

socket.on('new-message', msg => {
    if (msg != 'message-too-long')
        var chat = document.getElementById('chat');
        var new_line = document.createElement('p');
        var text = document.createTextNode(msg.user + ': ' + msg.msg);
        new_line.append(text);
        chat.appendChild(new_line);
        chat.scrollTop = chat.scrollHeight
})

socket.on('char-info', msg => {
    let status = document.getElementById('status');
    status.textContent = '';
    let name_line = document.createElement('p');
    let hp_line = document.createElement('p');
    let exp_line = document.createElement('p');
    let level_line = document.createElement('p');
    let points_line = document.createElement('p');
    let savings_line = document.createElement('p');

    name_line.append(document.createTextNode(`name: ${msg.name}`));
    hp_line.append(document.createTextNode(`hp:${msg.hp}/${msg.max_hp}`));
    exp_line.append(document.createTextNode(`exp: ${msg.data.exp}`));
    level_line.append(document.createTextNode(`level: ${msg.data.level}`));
    points_line.append(document.createTextNode(`skill points: ${msg.data.skill_points}`));
    savings_line.append(document.createTextNode(`savings: ${msg.savings.data['standard_money']}`));

    status.appendChild(name_line);
    status.appendChild(hp_line);
    status.appendChild(exp_line);
    status.appendChild(level_line);
    status.appendChild(points_line);
    status.appendChild(savings_line);

    for (let i in msg.data.stats) {
        let stats_line = document.createElement('p');
        stats_line.append(document.createTextNode(`${i}: ${msg.data.stats[i]}`));
        status.appendChild(stats_line);
    }
    for (let i in msg.data.other) {
        let other_line = document.createElement('p');
        other_line.append(document.createTextNode(`${i}: ${msg.data.other[i]}`))
        status.appendChild(other_line);
    }
    for (let i in msg.stash) {
        let other_line = document.createElement('p');
        other_line.append(document.createTextNode(`${i}: ${msg.stash[i]}`))
        status.appendChild(other_line);
    }

    char_image.update(msg.data.other.rage, msg.data.other.blood_covering, msg.data.stats.pow)
    skill_tree.update(SKILLS, msg.data.skills);
    tactic_screen.update(msg.data.tactic)
    
});

socket.on('battle-has-started', data => {
    battle_image.clear()
    battle_image.load(data)
})

socket.on('battle-update', data => {
    battle_image.update(data)
})

socket.on('battle-action', data => {
    console.log(data)
    battle_image.update_action(data)
})

socket.on('battle-has-ended', () => {
    battle_image.clear()
})

socket.on('market-data', data => {
    market_table.update(data);
})

socket.on('skill-tree', data => {
    SKILLS = data;
})

socket.on('tags-tactic', msg => {
    tactic_screen.update_tags(msg);
})


socket.on('alert', msg => {
    alert(msg);
});

// eslint-disable-next-line no-undef
var char_image = new CharacterImage(document.getElementById('char_image'), document.getElementById('tmp_canvas'));
// eslint-disable-next-line no-undef
var battle_image = new BattleImage(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_tmp'));
// eslint-disable-next-line no-undef
var market_table = new MarketTable(document.getElementById('market'));
socket.emit('get-market-data', null);
// eslint-disable-next-line no-undef
var map = new Map(document.getElementById('map'));
map.draw()
// eslint-disable-next-line no-undef
var skill_tree = new SkillTree(document.getElementById('skilltree'), socket);
// eslint-disable-next-line no-undef
var tactic_screen = new TacticScreen(document.getElementById('tactic'), socket);


for (var i = 200; i > 10; i -= 5) {
    battle_image.add_fighter(i, 'tost', i)
}
battle_image.add_fighter(0, 'test', 0)



function draw() {
    char_image.draw()
    battle_image.draw()
    map.draw();
    window.requestAnimationFrame(draw);
}

const images = loadImages(images_list[0], images_list[1], () => {console.log(images), window.requestAnimationFrame(draw);});

