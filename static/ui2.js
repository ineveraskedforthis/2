// eslint-disable-next-line no-undef
var socket = io();

const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character']

import {init_map_control, Map} from './modules/map.js';
import {CharInfoMonster} from './modules/char_info_monster.js';
import {BattleImage, init_battle_control} from './modules/battle_image.js';
import {GoodsMarket, ItemMarketTable} from './modules/market_table.js';
import {CharacterScreen, EQUIPMENT_TAGS} from './modules/character_screen.js'

var globals = {
    prev_mouse_x: null,
    prev_mouse_y: null,
    pressed: false,
    pressed_resize_bottom: false,
    pressed_resize_top: false,
    bcp: false,
    socket: socket
}

const char_info_monster = new CharInfoMonster();
const map = new Map(document.getElementById('map_canvas'), document.getElementById('map_control'), socket);
init_map_control(map, globals);
const battle_image = new BattleImage(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_background'));
init_battle_control(battle_image, globals);
const character_screen = new CharacterScreen(socket);


// market
const goods_market = new GoodsMarket(document.querySelector('.goods_market'), socket);
const item_market_table = new ItemMarketTable(document.querySelector('.auction_body'), socket);

{
    let market_button = document.getElementById('open_market')
    let auction_button = document.getElementById('open_auction')

    let market = document.querySelector('.goods_market');
    let auction = document.querySelector('.auction_body');

    market_button.onclick = () => {
        market.classList.remove('hidden');
        auction.classList.add('hidden');

        auction_button.classList.remove('selected');
        market_button.classList.add('selected');
    }

    auction_button.onclick = () => {
        market.classList.add('hidden');
        auction.classList.remove('hidden');

        market_button.classList.remove('selected');
        auction_button.classList.add('selected');
    }

}


// market-end


socket.on('connect', () => {
    console.log('connected')
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
})


// MOVABLE STUFF 
let bottom_corners = document.querySelectorAll('.movable > .bottom')
for (let corner of bottom_corners) {
    (corner => {corner.onmousedown = (event) =>{
        if (!globals.pressed_resize_bottom)
        {
            globals.pressed_resize_bottom = true
            globals.current_resize = corner.parentElement
        } else {
            globals.pressed_resize_bottom = false
        }
    }})(corner)
}

let top_corners = document.querySelectorAll('.movable > .top')
for (let corner of top_corners) {
    (corner => {corner.onmousedown = (event) =>{
        if (!globals.pressed_resize_top)
        {
            globals.pressed_resize_top = true
            globals.current_resize = corner.parentElement
        } else {
            globals.pressed_resize_top = false
        }
    }})(corner)
}

let game_scene = document.getElementById('actual_game_scene')
game_scene.onmousemove = event => {
        if (globals.pressed_resize_bottom)
        {
            let x = event.pageX;
            let y = event.pageY;
            let rect_1 = globals.current_resize.getBoundingClientRect();
            let rect_2 = game_scene.getBoundingClientRect();
            let new_width = x - rect_1.left + 2;
            let new_height = y - rect_1.top + 2;
            globals.current_resize.style.width = new_width + 'px'
            globals.current_resize.style.height = new_height + 'px'
        }
        if (globals.pressed_resize_top)
        {
            let x = event.pageX;
            let y = event.pageY;
            let rect_1 = globals.current_resize.getBoundingClientRect();
            let rect_2 = game_scene.getBoundingClientRect();

            let width = rect_1.right - rect_1.left;
            let height = rect_1.bottom - rect_1.top;
            let new_left = Math.min(rect_1.right - 1, Math.min(rect_2.right - rect_2.left - width, Math.max(1, x - rect_2.left - 1)));
            let new_top = Math.min(rect_1.bottom - 1, Math.min(rect_2.bottom - rect_2.top - height, Math.max(1, y - rect_2.top - 1)));
            // let new_width = rect_1.right - rect_1.left - (new_left - old_left);
            // let new_height = rect_1.bottom - rect_1.top - (new_top - old_top);

            globals.current_resize.style.top = new_top + 'px';
            globals.current_resize.style.left = new_left + 'px';
            // globals.current_resize.style.width = new_width + 'px'
            // globals.current_resize.style.height = new_height + 'px'
        }
};

// MOVABLE STUFF END





// MESSAGES STUFF
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

document.getElementById('open_chat_button').onclick = () => {
    document.getElementById('log').style.visibility = 'hidden';
    document.getElementById('chat').style.visibility = 'inherit';
    document.getElementById('open_log_button').classList.remove('selected');
    document.getElementById('open_chat_button').classList.add('selected');
}

document.getElementById('open_log_button').onclick = () => {
    document.getElementById('chat').style.visibility = 'hidden';
    document.getElementById('log').style.visibility = 'inherit';
    document.getElementById('open_chat_button').classList.remove('selected');
    document.getElementById('open_log_button').classList.add('selected');
}

document.getElementById('send_message_button').onclick = (event) => {
    event.preventDefault();
    let message = document.getElementById('message_field').value;
    socket.emit('new-message', message);
}

//MESSAGES STUFF END



//CHANGE SCENES STUFF
function show_char_creation() {
    show_scene("character_creation")
    document.getElementById('page_1').style.visibility = 'inherit';
}

function show_game() {
    show_scene("actual_game_scene")
}

function show_scene(scene_id) {
    let parent_elem = document.getElementById(scene_id).parentElement;
    for (var i = 0; i < parent_elem.childNodes.length; i++) {
        if (parent_elem.childNodes[i].id != undefined && parent_elem.childNodes[i].id != null && parent_elem.childNodes[i].id != ''){
            document.getElementById(parent_elem.childNodes[i].id).style.visibility = 'hidden';
        }
    }
    document.getElementById(scene_id).style.visibility = 'visible';    
}

function toogle_tab(tag) {
    let tab = document.getElementById(tag + '_tab');
    if (tab.classList.contains('hidden')) {
        tab.classList.remove('hidden');
        return 'on'
    } else {
        tab.classList.add('hidden');
        return 'off'
    }
}

for (let tag of game_tabs) {
    if (tag == 'battle') {
        continue
    }
    let button = document.getElementById(tag + '_button');
    button.onclick = () => {
        let res = toogle_tab(tag);
        button.classList.toggle('active')
        console.log(tag, res)
        if ((tag == 'market') & (res == 'on')) {
            socket.emit('send-market-data', true)
        } else {
            socket.emit('send-market-data', false)
        }
    }
}
//CHANGE SCENES STUFF



//SKILL TREE STUFF
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


function show_skill_tab(tag) {
    let tab = document.getElementById(tag + '_skills');
    tab.classList.remove('hidden');
}

function hide_skill_tab(tag) {
    let tab = document.getElementById(tag + '_skills');
    tab.classList.add('hidden');
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
        level_up.onclick = () => send_skill_up_message(socket, tag)
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

    console.log(data)
    
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
//SKILL TREE STUFF END





//CREDENTIALS STUFF

{
    let button = document.getElementById('logout');
    button.onclick = () => {localStorage.setItem('session', 'null'); location.reload()};
}

document.getElementById('open_reg_window_button').onclick = () => {
    document.getElementById('login-frame').style.visibility = 'hidden';
    document.getElementById('reg-frame').style.visibility = 'inherit';
    document.getElementById('open_login_window_button').classList.remove('selected');
    document.getElementById('open_reg_window_button').classList.add('selected');
}

document.getElementById('open_login_window_button').onclick = () => {
    document.getElementById('reg-frame').style.visibility = 'hidden';
    document.getElementById('login-frame').style.visibility = 'inherit';
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
//CREDENTIAL STUFF END




//CHARACTER CREATION STUFF
document.getElementById("next_1").onclick = (event) => {
    event.preventDefault();
    document.getElementById("page_2").style.visibility = 'inherit'
}

document.getElementById("next_2").onclick = (event) => {
    event.preventDefault();
    show_game();
}

for (let i = 0; i<3; i++) {
    document.getElementById("eyes_"+ i).onclick = (event) => {
        event.preventDefault();
        document.getElementById("character_image_eyes").style.backgroundImage = 'url(/static/img/eyes_'+ i + '.png)'
    }
}
for (let i = 0; i<3; i++) {
    document.getElementById("chin_"+ i).onclick = (event) => {
        event.preventDefault();
        document.getElementById("character_image_chin").style.backgroundImage = 'url(/static/img/chin_'+ i + '.png)'
    }
}
for (let i = 0; i<3; i++) {
    document.getElementById("mouth_"+ i).onclick = (event) => {
        event.preventDefault();
        document.getElementById("character_image_mouth").style.backgroundImage = 'url(/static/img/mouth_'+ i + '.png)'
    }
}
//CHARACTER CREATION STUFF ENDS


//EQUIP DISPLAY

function update_equip(data) {
    for (let tag of EQUIPMENT_TAGS) {
        let div = document.querySelector('.character_image.equip.' + tag);
        let item_tag = data[tag].tag;
        div.style = "background: no-repeat center/100% url(/static/img/" + item_tag + "_big.png);"
    }
}

//EQUIP DISPLAY END

function start_battle(data) {
    toogle_tab('battle')
    battle_image.clear()
    battle_image.load(data)
}

function end_battle() {
    toogle_tab('battle')
    battle_image.clear()
}

// SOCKET ONS

socket.on('tags', msg => update_tags(msg));
socket.on('alert', msg => alert(msg));

socket.on('sections', msg => map.load_sections(msg));

socket.on('is-reg-valid', msg => my_alert(msg));
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-valid', msg => my_alert(msg));
socket.on('is-login-completed', msg => login(msg));

socket.on('session', msg => {localStorage.setItem('session', msg)})
socket.on('reset_session', () => {localStorage.setItem('session', 'null')})

socket.on('hp', msg => char_info_monster.update_hp(msg));
socket.on('exp', msg => char_info_monster.update_exp(msg));
socket.on('savings', msg => char_info_monster.update_savings(msg));
socket.on('status', msg => char_info_monster.update_status(msg));
socket.on('name', msg => char_info_monster.update_name(msg));

socket.on('char-info-detailed', msg => character_screen.update(msg))
socket.on('stash-update', msg => {goods_market.update_inventory(msg); character_screen.update_stash(msg)});
socket.on('equip-update', msg => {character_screen.update_equip(msg); update_equip(msg)});

socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));

socket.on('map-pos', msg => {
    let location = map.set_curr_pos(msg.x, msg.y);
    change_bg(location);
});
socket.on('explore', msg => {map.explore(msg)});

socket.on('new-action', msg => battle_image.add_action({name: msg, tag:msg}));

socket.on('battle-has-started', data => start_battle(data))
socket.on('battle-has-ended', data => end_battle(data))
socket.on('battle-update', data => battle_image.update(data))
socket.on('battle-action', data => {
    let res = battle_image.battle_action(data);
    new_log_message(res)
    if (res == 'battle has ended') end_battle();
})
socket.on('enemy-update', data => battle_image.update_enemy(data))

socket.on('skill-tree', data => load_skills(data));
socket.on('skills', msg => update_skill_data(msg));
socket.on('local-skills', msg => update_local_skills(msg))

socket.on('market-data', data => goods_market.update_data(data));
socket.on('item-market-data', data => {item_market_table.update(data)});

function update_tags(msg) {
    let market_div = document.querySelector('.goods_list') 
    let inventory_div = document.getElementById('inventory_stash')
    for (var tag of msg) {

        {
            let div_cell = document.createElement('div');
            div_cell.classList.add('goods_type');
            div_cell.classList.add(tag);

            {
                let div_image = document.createElement('div');
                div_image.classList.add('goods_icon');
                div_image.style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
                div_cell.appendChild(div_image)
            }

            {
                let div_text = document.createElement('div');
                div_text.innerHTML = tag;
                div_text.classList.add('goods_name');
                div_cell.appendChild(div_text);
            }

            {
                let avg_price = document.createElement('div');
                avg_price.innerHTML = 'undefined';
                avg_price.classList.add('goods_avg_buy_price');
                div_cell.appendChild(avg_price);
            }

            {
                let avg_price = document.createElement('div');
                avg_price.innerHTML = 'undefined';
                avg_price.classList.add('goods_avg_sell_price');
                div_cell.appendChild(avg_price);
            }

            {
                let div = document.createElement('div');
                div.innerHTML = 'undefined';
                div.classList.add('goods_amount_in_inventory');
                div_cell.appendChild(div);
            }

            ((tag) => div_cell.onclick = () => {
                goods_market.select(tag)
            })(tag)

            market_div.appendChild(div_cell)

            div_cell = document.createElement('div');
            div_cell.classList.add('goods_type');
            div_cell.classList.add(tag);

            {
                let div_image = document.createElement('div');
                div_image.classList.add('goods_icon');
                div_image.style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
                div_cell.appendChild(div_image)
            }

            {
                let div_text = document.createElement('div');
                div_text.innerHTML = tag;
                div_text.classList.add('goods_name');
                div_cell.appendChild(div_text);
            }
            
            {
                let div = document.createElement('div');
                div.innerHTML = 'undefined';
                div.classList.add('goods_amount_in_inventory');
                div_cell.appendChild(div);
            }

            inventory_div.appendChild(div_cell)
        }



    }
}

function change_bg(tag) {
    let div = document.getElementById('actual_game_scene');
    div.style.backgroundImage = "url(/static/img/bg_" + tag + ".png)"
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
        // tactic_screen.reset_tactic()
        show_game();
    }
    let tutorial_stage = localStorage.getItem('tutorial');
    if (tutorial_stage == null) {
        // show_tutorial(0);
    }
}

function reg(msg) {
    if (msg != 'ok') {
        alert(msg);
    } else if (msg == 'ok') {
        // tactic_screen.reset_tactic()
        show_char_creation();
    }
}

var currentTime = (new Date()).getTime(); var lastTime = (new Date()).getTime();
var delta = 0;

function draw(time) {
    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (document.getElementById('actual_game_scene').style.visibility == 'visible') {
        if (!document.getElementById('battle_tab').classList.contains('hidden')) {
            battle_image.draw(images, delta);
        }
        if (!document.getElementById('map_tab').classList.contains('hidden')){
            map.draw(images, time);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(images_list[0], images_list[1], () => { 
    console.log(images);
    window.requestAnimationFrame(draw);
});