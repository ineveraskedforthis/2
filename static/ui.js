// eslint-disable-next-line no-undef
var socket = io();


// var dps = {
//     food: [],
//     meat: [],
//     leather: [],
//     clothes: [],
//     tools: [],
// }
// var chart = new CanvasJS.Chart("chartContainer", {
//     title :{
//         text: "prices"
//     },
//     toolTip: {
//         shared: true
//     },
//     data: [
//         {
//             type: "line",
//             name: 'food',
//             dataPoints: dps['food']
//         },
//         {
//             type: "line",
//             name: 'meat',
//             dataPoints: dps['meat']
//         },
//         {
//             type: "line",
//             name: 'leather',
//             dataPoints: dps['leather']
//         },
//         {
//             type: "line",
//             name: 'clothes',
//             dataPoints: dps['clothes']
//         },
//         {
//             type: "line",
//             name: 'tools',
//             dataPoints: dps['tools']
//         }
//     ]
// });

// var xVal = 0;
// var yVal = 100;
// var dataLength = 300; // number of dataPoints visible at any point

var updateChart = function (tag, x) {
    // yVal = x;
    // dps[tag].push({
    //     x: xVal,
    //     y: yVal
    // });
	// if (dps[tag].length > dataLength) {
	// 	dps[tag].shift();
	// }
};

// chart.render();

socket.on('connect', () => {
    console.log('connected')
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
})



var SKILLS = {};


let draw_char = localStorage.getItem('char_image');

{
    let button = document.getElementById('char_image_button')
    button.onclick = () => {if (draw_char == 'yes') {draw_char = 'no'; localStorage.setItem('char_image', 'no')} else {draw_char = 'yes'; localStorage.setItem('char_image', 'yes')}}
}

{
    let button = document.getElementById('logout');
    button.onclick = () => {localStorage.setItem('session', 'null'); location.reload()};
}

function get_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    return tmp
}

var prev_mouse_x = null;
var prev_mouse_y = null;
var pressed = false;

// eslint-disable-next-line no-undef
var battle_image = new BattleImage(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_background'));

//battle canvas pressed
let bcp = false

document.getElementById('battle_canvas').onmousedown = event => {
    event.preventDefault();
    bcp = true
}

document.getElementById('battle_canvas').onmousemove = event => {
    let mouse_pos = get_pos_in_canvas(battle_image.canvas, event);
    battle_image.hover(mouse_pos);
};

document.getElementById('battle_canvas').onmouseup = event => {
    let mouse_pos = get_pos_in_canvas(battle_image.canvas, event);
    if (bcp) {
        battle_image.press(mouse_pos);
        bcp = false;
    }
}






document.getElementById('map').onmousedown = event => {
    event.preventDefault();
    pressed = true;
    prev_mouse_x = null;
    prev_mouse_y = null;

    let mouse_pos = get_pos_in_canvas(map.canvas, event);    
    let selected_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
    map.select_hex(selected_hex[0], selected_hex[1]);
    if (event.button == 2) {
        map.send_move_request()
    }
}

document.getElementById('map').onmousemove = event => {
    if (pressed)
    {
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

document.getElementById('map').onmouseup = event => {
    let mouse_pos = get_pos_in_canvas(map.canvas, event);
    let selected_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
    map.select_hex(selected_hex[0], selected_hex[1]);
    pressed = false;
}


// tutorial
document.getElementById('tutorial_status').onmouseover = event => {
    let status_frame = document.getElementById("status_frame")
    status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_status').onmouseout = event => {
    let status_frame = document.getElementById("status_frame")
    status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};


document.getElementById('tutorial_buttons').onmouseover = event => {
    let status_frame = document.getElementById("control_frame")
    status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_buttons').onmouseout = event => {
    let status_frame = document.getElementById("control_frame")
    status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};




/*function show(tag) {
    document.getElementById('battle_tab').style.visibility = 'hidden';
    document.getElementById('market_tab').style.visibility = 'hidden';
    document.getElementById('market_control_tab').style.visibility = 'hidden';
    document.getElementById('tactics_tab').style.visibility = 'hidden';
    document.getElementById('skilltree_tab').style.visibility = 'hidden';
    document.getElementById('map_tab').style.visibility = 'hidden';
    document.getElementById('character_screen').style.visibility = 'hidden';
    document.getElementById(tag).style.visibility = 'visible';
}*/

function showTab(tabId){
    let parent_elem = document.getElementById(tabId).parentElement;
    for (var i = 0; i < parent_elem.childNodes.length; i++) {
        if (parent_elem.childNodes[i].id != undefined && parent_elem.childNodes[i].id != null && parent_elem.childNodes[i].id != ''){
            document.getElementById(parent_elem.childNodes[i].id).style.visibility = 'hidden';
        }
    }
    document.getElementById(tabId).style.visibility = 'visible';    
}

// function show(tag) {
//     document.getElementById('battle_tab').style.display = 'none';
//     document.getElementById('market_tab').style.display = 'none';
//     document.getElementById('market_control_tab').style.display = 'none';
//     document.getElementById('tactics_tab').style.display = 'none';
//     document.getElementById('skilltree_tab').style.display = 'none';
//     document.getElementById('map_tab').style.display = 'none';
//     document.getElementById('character_screen').style.display = 'none';
//     document.getElementById(tag).style.display = 'block';
// }

function show_game() {
    document.getElementById('login_container').style.visibility = 'hidden';
    document.getElementById('login-frame').style.visibility = 'hidden';
    document.getElementById('reg-frame').style.visibility = 'hidden';
    document.getElementById('game_container').style.visibility = 'visible';
    showTab('character_screen');
}

function show_tutorial() {
    showTab('tutorial');
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
    let amount = parseInt(document.getElementById('buy_amount').value);
    let max_price = parseInt(document.getElementById('buy_max_price').value);
    let money = amount * max_price;
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


let market_actions = document.getElementById('market_actions');

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('sell', {tag: 'meat', amount: '1', price: '100'})
)();
this.button.innerHTML = 'SELL 1 MEAT FOR 100';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('buy', {tag: 'food', amount: '1', money: '150', max_price: '150'})
)();
this.button.innerHTML = 'BUY 1 FOOD FOR 150';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('buy', {tag: 'water', amount: '1', money: '100', max_price: '100'})
)();
this.button.innerHTML = 'BUY 1 WATER FOR 100';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('clear_orders')
)();
this.button.innerHTML = 'CLEAR ORDERS';
market_actions.appendChild(this.button);




document.getElementById('attack_button').onclick = () => {
    socket.emit('send-market-data', false)
    showTab('battle_tab');
}

document.getElementById('battle_action').onclick = () => {
    let action = battle_image.get_action();
    if (action != undefined) {
        socket.emit('battle-action', action);
    }    
}

document.getElementById('battle_use_skill').onclick = () => {
    let action = battle_image.get_action_spell();
    if (action != undefined) {
        socket.emit('battle-action', action);
    } 
}

document.getElementById('attack').onclick = () => {
    socket.emit('attack', null);
}
document.getElementById('attack_outpost').onclick = () => {
    socket.emit('attack-outpost', null);
}

document.getElementById('market_button').onclick = () => {
    socket.emit('send-market-data', true)
    showTab('market_tab');
}
document.getElementById('market_control_button').onclick = () => {
    socket.emit('send-market-data', false)
    showTab('market_control_tab');
}
document.getElementById('map_button').onclick = () => {
    socket.emit('send-market-data', false)
    showTab('map_tab');
}
document.getElementById('tactics_button').onclick = () => {
    socket.emit('send-market-data', false)
    showTab('tactics_tab');
}
document.getElementById('skilltree_button').onclick = () => {
    socket.emit('send-market-data', false)
    showTab('skilltree_tab');
}
document.getElementById('character_screen_button').onclick = () => {
    socket.emit('send-market-data', false);
    socket.emit('char-info-detailed');
    showTab('character_screen');
}
document.getElementById('auction_house_button').onclick = () => {
    socket.emit('send-market-data', true);
    showTab('auction_house_tab');
    // showTab('auction_buy_tab');
}


socket.on('tags', msg => update_tags(msg));
socket.on('is-reg-valid', msg => my_alert(msg));
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-valid', msg => my_alert(msg));
socket.on('is-login-completed', msg => login(msg));
socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));
socket.on('hp', msg => char_info_monster.update_hp(msg));
socket.on('exp', msg => char_info_monster.update_exp(msg));
socket.on('savings', msg => char_info_monster.update_savings(msg));
socket.on('status', msg => char_info_monster.update_status(msg));
socket.on('name', msg => char_info_monster.update_name(msg));
socket.on('market-data', data => {
    // console.log(data);
    market_table.update(data);
    // updateChart('meat', data.avg['meat']);
    // updateChart('food', data.avg['food']);
    // updateChart('leather', data.avg['leather']);
    // updateChart('clothes', data.avg['clothes']);
    // updateChart('tools', data.avg['tools']);
    // xVal++;
    // chart.render()
});
socket.on('item-market-data', data => {
    // console.log('item-market-data'); 
    // console.log(data); 
    item_market_table.update(data)
});
// socket.on('market-data', data => auction_house.update(data));
// socket.on('market-data', data => console.log(data));
socket.on('skill-tree', data => {SKILLS = data});
socket.on('tags-tactic', msg => tactic_screen.update_tags(msg));
socket.on('char-info-detailed', msg => character_screen.update(msg))
socket.on('alert', msg => alert(msg));
socket.on('skills', msg => skill_tree.update(SKILLS, msg));
socket.on('tactic', msg => tactic_screen.update(msg));
socket.on('map-pos', msg => {console.log(msg); map.set_curr_pos(msg.x, msg.y)});
socket.on('explore', msg => {map.explore(msg)});

socket.on('session', msg => {localStorage.setItem('session', msg)})
socket.on('reset_session', () => {localStorage.setItem('session', 'null')})

socket.on('new-action', msg => {console.log('action ' + msg); tactic_screen.add_action(msg); battle_image.add_action(msg)});

socket.on('battle-has-started', data => {
    battle_image.clear()
    // console.log(data)
    battle_image.load(data)
})

socket.on('battle-update', data => {
    battle_image.update(data)
})

socket.on('battle-action', data => {
    if (data == null) {
        return
    }
    battle_image.update_action(data)
    if (data.action == 'attack') {
        if (data.result.crit) {
            new_log_message(data.actor_name + ': critical_damage')
        }
        new_log_message(data.actor_name + ': deals ' + data.result.total_damage + ' damage')
    } else if (data.action.startsWith('kinetic_bolt')) {
        if (data.result.crit) {
            new_log_message(data.actor_name + ': critical_damage')
        }
        new_log_message(data.actor_name + ': deals with magic bolt ' + data.result.total_damage + ' damage')
    } else if (data.action.startsWith('charge')) {
        new_log_message(data.actor_name + '   CHAAAAAAAAAARGE   ' + data.result.total_damage + ' damage')
    }
})

socket.on('enemy-update', msg => {
    let div = document.getElementById('enemy_status');
    div.innerHTML = ''
    for (let i of msg) {
        let label = document.createElement('p');
        label.innerHTML = i.name + ' | | ' + i.hp + ' hp' 
        div.appendChild(label)
    }
})


function update_tags(msg) {
    for (var tag of msg) {
        var tag_option = new Option(tag, tag);
        document.getElementById('buy_tag_select').add(tag_option);
        tag_option = new Option(tag, tag);
        document.getElementById('sell_tag_select').add(tag_option);
        document.getElementById('inv_' + tag + '_image').style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
    }
}

function my_alert(msg) {
    if (msg != 'ok') {
        alert(msg);
    }
}

function login(msg) {
    if (msg != 'ok') {
        alert(msg);
    } else if (msg == 'ok') {
        tactic_screen.reset_tactic()
        show_game();
    }
    let tutorial_stage = localStorage.getItem('tutorial');
    if (tutorial_stage == null) {
        show_tutorial(0);
    }
}

function reg(msg) {
    if (msg != 'ok') {
        alert(msg);
    } else if (msg == 'ok') {
        tactic_screen.reset_tactic()
        show_game();
    }
}

function new_log_message(msg) {
    var log = document.getElementById('log');
    var new_line = document.createElement('p');
    var text = document.createTextNode(msg);
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight
}

function new_message(msg) {
    if (msg != 'message-too-long') {
        var chat = document.getElementById('chat');
        var new_line = document.createElement('p');
        var text = document.createTextNode(msg.user + ': ' + msg.msg);
        new_line.append(text);
        chat.appendChild(new_line);
        chat.scrollTop = chat.scrollHeight
    }
}


class CharInfoMonster {
    constructor() {

        this.name =                 document.getElementById('name');

        this.hp =                   document.getElementById('hp_data');
        this.hp_display =           document.getElementById('hp_value_display');

        this.exp =                  document.getElementById('exp_current');  
        this.exp_req =              document.getElementById('exp_required');  
        this.exp_display =          document.getElementById('exp_value_display');


        this.level =                document.getElementById('level_data');
        this.points =               document.getElementById('skill_points_data');

        this.savings =              document.getElementById('savings_data');

        this.rage =                 document.getElementById('rage_data');
        this.rage_display =         document.getElementById('rage_value_display');

        this.blood =                document.getElementById('blood_data');
        this.blood_display =        document.getElementById('blood_value_display');

        this.stress =               document.getElementById('stress_data');
        this.stress_display =       document.getElementById('stress_value_display');
    }

    update_name(data) {
        this.name.innerHTML = data;
    }

    update_hp(data) {
        this.hp.innerHTML = `${data.hp}/${data.mhp}`
        this.hp_display.style.height = `${Math.floor(data.hp/data.mhp * 100)}%`;
    }

    update_exp(data) {
        this.exp.innerHTML = data.exp;
        this.exp_req.innerHTML = data.mexp
        this.exp_display.style.width = `${Math.floor(data.exp/data.mexp * 100)}%`;

        this.level.innerHTML = data.level;
        this.points.innerHTML = data.points;
    }

    update_savings(savings) {
        console.log('savings', savings);
        this.savings.innerHTML = savings;
    }

    update_status(data) {
        this.rage.innerHTML = data.rage;
        this.rage_display.style.height = `${Math.floor(data.rage)}%`;

        this.blood.innerHTML = data.blood_covering;
        this.blood_display.style.height = `${Math.floor(data.blood_covering)}%`;

        this.stress.innerHTML = data.stress;
        this.stress_display.style.height = `${Math.floor(data.stress)}%`;

        char_image.update(data.rage, data.blood_covering, undefined, data.stress)
    }
}
const char_info_monster = new CharInfoMonster();


// eslint-disable-next-line no-undef
var char_image = new CharacterImage(document.getElementById('char_image'));
// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
var market_table = new MarketTable(document.getElementById('market'));
socket.emit('get-market-data', null);
var item_market_table = new ItemMarketTable(document.getElementById('auction_house_tab'))
// var auction_house = new AuctionHouse(document.getElementById('auction_house_tab'));
socket.emit('get-market-data', null);// eslint-disable-next-line no-undef
var map = new Map(document.getElementById('map'), document.getElementById('map_control'), socket);
// eslint-disable-next-line no-undef
var skill_tree = new SkillTree(document.getElementById('skilltree'), socket);
// eslint-disable-next-line no-undef
var tactic_screen = new TacticScreen(document.getElementById('tactic'), socket);
// eslint-disable-next-line no-undef
var character_screen = new CharacterScreen(socket);

var currentTime = (new Date()).getTime(); var lastTime = (new Date()).getTime();
var delta = 0;

function draw(time) {
    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (document.getElementById('game_container').style.visibility == 'visible') {
        if (draw_char == 'yes') {
            char_image.draw(time);
        }
        if (document.getElementById('battle_tab').style.visibility != 'hidden') {
            battle_image.draw(delta);
        }
        if (document.getElementById('map_tab').style.visibility != 'hidden'){
            map.draw(time);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(images_list[0], images_list[1], () => { console.log(images), window.requestAnimationFrame(draw);});