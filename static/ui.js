const SKILL_DESC = {
    'warrior_training': 'increases musculature, unlocks learning warrior specific spells after reaching level 3',
    'mage_training': 'improves your magical power, unlocks learning mage specific spells after reaching level 3',
    'charge': 'unlock charge ability: you are moved to your enemy position at cost of increasing rage',
    'rage_control': 'rage influence accuracy less',
    'cold_rage': 'rage influence accuracy even less',
    'the_way_of_rage': 'rage almost does not influence accuracy',
    'blocking_movements': 'you learn basics of blocking attacks, now you have better chances to block enemy\'s attack',
    'blood_battery': 'blood now makes all magical damage higher',
    'first_steps_in_magic': 'unlock magic bolt: ranged ability with low blunt damage',
    'less_stress_from_crafting': 'at second level of this ability you can safely craft various things, third one decrease stress even more and unlock futher development of your crafting abilities',
    'less_stress_from_making_food': 'you gain less stress from preparing food',
    'disenchanting': 'unlock ability to break items into zaz',
    'less_stress_from_disenchant': 'you gain less stress from disenchanting',
    'sewing': 'unlock ability to sew clothes',
    'cook': 'unlock ability to prepare food',
    'enchanting':'unlock ability to use zaz to add enchantments to items',
    'less_stress_from_enchant': 'you gain less stress from enchanting',
}

const SKILL_NAMES = {
    'warrior_training': 'Warrior training',
    'mage_training': 'Mage training',
    'charge': 'Charge',
    'first_steps_in_magic': 'First steps in magic',
    'blocking_movements': 'Blocking movements',
    'cook': 'Cooking'
}



var CURR_SKILL_DESC = undefined
var SKILL_SELECTED = undefined
var LOCAL_SKILLS = []
var skill_divs = {}
var learned_skill_divs = {}














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










function show_skill_tab(tag) {
    let tab = document.getElementById(tag + '_skills');
    tab.classList.add('visible');
}

function hide_skill_tab(tag) {
    let tab = document.getElementById(tag + '_skills');
    tab.classList.remove('visible');
}

function skill_tab_select(tag) {
    let tab = document.getElementById(tag + '_skills_tab')
    tab.classList.add('selected')
}
function skill_tab_deselect(tag) {
    let tab = document.getElementById(tag + '_skills_tab')
    tab.classList.remove('selected')
}

document.getElementById('learned_skills_tab').onclick = () => {
    skill_tab_select('learned')
    show_skill_tab('learned')
    skill_tab_deselect('local')
    hide_skill_tab('local')
}

document.getElementById('local_skills_tab').onclick = () => {
    skill_tab_select('local')
    show_skill_tab('local')
    skill_tab_deselect('learned')
    hide_skill_tab('learned')
}

function set_skill_description(tag) {
    if (CURR_SKILL_DESC != tag) {
        if (tag == undefined) {
            document.getElementById('skills_description').innerHTML = ''
        } else {
            document.getElementById('skills_description').innerHTML = SKILL_NAMES[tag] + '<br>' + SKILL_DESC[tag]
        }
        CURR_SKILL_DESC = tag;
    }
}

function shadow_skill(tag) {
    skill_divs[tag].classList.add('shadowed')
}
function unshadow_skill(tag) {
    skill_divs[tag].classList.remove('shadowed')
}

function send_skill_up_message(socket, tag) {
    console.log(tag)
    socket.emit('up-skill', tag);
}

function build_skill_div(tag, cur_level) {
    let skill = document.createElement('div');
    skill.classList.add("skill")
    skill.id = 'skill_' + tag

    let image = document.createElement('div');
    image.classList.add("skill_thumbnail")
    image.style =  "background: no-repeat 100%/100% url(/static/img/thumb_" + tag + ".png);"

    let skill_level = document.createElement('div')
    skill_level.classList.add("skill_level")

    let level_up = document.createElement('div')
    level_up.classList.add("level_up")
    level_up.innerHTML = 'upgrade'

    let level = document.createElement('div')
    level.classList.add("current_level")
    level.innerHTML = cur_level

    skill.appendChild(image)
    skill.appendChild(skill_level)

    skill_level.appendChild(level_up)
    skill_level.appendChild(level)

    skill.onmouseover = () => {
        set_skill_description(tag)
    }
    skill.onmouseout = () => {
        set_skill_description(SKILL_SELECTED)
    }
    skill.onclick = () => {
        if (SKILL_SELECTED != undefined) {
            document.getElementById('skill_' + SKILL_SELECTED).classList.remove('selected')
        }
        SKILL_SELECTED = tag;
        skill.classList.add('selected');
    }
    ((tag) => 
        level_up.onclick = () => send_skill_up_message(this.socket, tag)
    )(tag)

    return skill
}

function build_learned_skill_div(tag, cur_level) {
        let skill = document.createElement('div');
    skill.classList.add("skill")
    skill.id = 'l_skill_' + tag

    let image = document.createElement('div');
    image.classList.add("skill_thumbnail")
    image.style =  "background: no-repeat 100%/100% url(/static/img/thumb_" + tag + ".png);"

    let skill_level = document.createElement('div')
    skill_level.classList.add("skill_level")

    let level_up = document.createElement('div')
    level_up.classList.add("level_up")
    level_up.innerHTML = 'upgrade'

    let level = document.createElement('div')
    level.classList.add("current_level")
    level.innerHTML = cur_level

    skill.appendChild(image)
    skill.appendChild(skill_level)

    skill_level.appendChild(level_up)
    skill_level.appendChild(level)

    skill.onmouseover = () => {
        set_skill_description(tag)
    }
    skill.onmouseout = () => {
        set_skill_description(SKILL_SELECTED)
    }
    skill.onclick = () => {
        if (SKILL_SELECTED != undefined) {
            document.getElementById('skill_' + SKILL_SELECTED).classList.remove('selected')
        }
        SKILL_SELECTED = tag;
        skill.classList.add('selected');
    }
    return skill
}

function load_skills(data) {
    for (let tag in data) {
        skill_divs[tag] = build_skill_div(tag, 0)
        learned_skill_divs[tag] = build_learned_skill_div(tag, 0)
    }
}

function update_local_skills(data) {
    let list = document.getElementById('local_skills');
    LOCAL_SKILLS = data;
    list.innerHTML = ''
    
    if ((data != undefined) & (data != null)) {
        for (let tag of data) {
            list.appendChild(skill_divs[tag])
        }
    }    
}

function update_skill_data(data) {
    console.log('update skills')
    let list = document.getElementById('learned_skills');
    list.innerHTML = '';
    for (let tag in data) {
        skill_divs[tag].querySelector('.current_level').innerHTML = data[tag];
        let clone = skill_divs[tag].cloneNode(true)
        clone.id = 'l_skill_' + tag
        clone.querySelector('.level_up').innerHTML = 'level:'
        clone.onmouseover = () => {
            set_skill_description(tag)
        }
        clone.onmouseout = () => {
            set_skill_description(SKILL_SELECTED)
        }
        clone.onclick = () => {
            if (SKILL_SELECTED != undefined) {
                document.getElementById('l_skill_' + SKILL_SELECTED).classList.remove('selected')
            }
            SKILL_SELECTED = tag;
            clone.classList.add('selected');
        }
        list.appendChild(clone)
    }
}



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
document.getElementById('map').onmouseout = event => {
    pressed = false;
};



// tutorial
document.getElementById('tutorial_status').onmouseover = event => {
    let status_frame = document.getElementById("status_frame")
    // status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_status').onmouseout = event => {
    let status_frame = document.getElementById("status_frame")
    // status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};

document.getElementById('tutorial_buttons').onmouseover = event => {
    let status_frame = document.getElementById("control_frame")
    // status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_buttons').onmouseout = event => {
    let status_frame = document.getElementById("control_frame")
    // status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};

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
socket.on('skill-tree', data => load_skills(data));
socket.on('tags-tactic', msg => tactic_screen.update_tags(msg));
socket.on('char-info-detailed', msg => character_screen.update(msg))

socket.on('skills', msg => update_skill_data(msg));
socket.on('local-skills', msg => update_local_skills(msg))
socket.on('tactic', msg => tactic_screen.update(msg));
socket.on('map-pos', msg => {console.log(msg); map.set_curr_pos(msg.x, msg.y)});
socket.on('explore', msg => {map.explore(msg)});



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



// eslint-disable-next-line no-undef
var char_image = new CharacterImage(document.getElementById('char_image'));
// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
var market_table = new MarketTable(document.getElementById('market'));
socket.emit('get-market-data', null);
var item_market_table = new ItemMarketTable(document.getElementById('auction_house_tab'))
// var auction_house = new AuctionHouse(document.getElementById('auction_house_tab'));
socket.emit('get-market-data', null);// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
// var skill_tree = new SkillTree(document.getElementById('skilltree'), socket);
// eslint-disable-next-line no-undef
var tactic_screen = new TacticScreen(document.getElementById('tactic'), socket);
// eslint-disable-next-line no-undef
var character_screen = new CharacterScreen(socket);

