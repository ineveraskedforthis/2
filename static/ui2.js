// eslint-disable-next-line no-undef
var socket = io();

// const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character', 'quest', 'stash', 'craft']
const game_tabs = ['map', 'skilltree', 'stash', 'craft', 'equip', 'market', 'local_characters']
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

var stash_tag_to_id = {}
var stash_id_to_tag = {}

const char_info_monster = new CharInfoMonster();
const map = new Map(document.getElementById('map_canvas'), document.getElementById('map_control'), socket);
init_map_control(map, globals);
var battle_image = new BattleImage(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_background'));
init_battle_control(battle_image, globals);
window.battle_image = battle_image
const character_screen = new CharacterScreen(socket);



// noselect tabs 

[...document.querySelectorAll(".noselect")].forEach( el => 
 el.addEventListener('contextmenu', e => e.preventDefault())
);



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


var tabs_queue = []

var tabs_position = {}


let tabs_properties = JSON.parse(localStorage.getItem('tabs_properties'))

function save_tab(tag) {
    let tab = document.getElementById(tag + '_tab')
    tabs_properties[tag] = {
        top: tab.style.top,
        left: tab.style.left,
        width: tab.style.width,
        height: tab.style.height,
        zIndex: tab.style.zIndex,
        active: !tab.classList.contains('hidden')
    }
    localStorage.setItem('tabs_properties', JSON.stringify(tabs_properties))
}

function load_tab(tag) {
    console.log(tag)
    let tab = document.getElementById(tag + '_tab')
    tab.style.top = tabs_properties[tag].top
    tab.style.left = tabs_properties[tag].left
    tab.style.width = tabs_properties[tag].width
    tab.style.height = tabs_properties[tag].height
    tab.style.zIndex = tabs_properties[tag].zIndex

    if (tabs_properties[tag].active) {
        toogle_tab(tag)
    }
}

if (tabs_properties == null) {
    tabs_properties = {}
}

for (let tag of game_tabs) {
    console.log(tabs_properties)
    if (tag in tabs_properties) {
        load_tab(tag)
    } else {
        save_tab(tag)
    }
} 

let bottom_corners = document.querySelectorAll('.movable > .bottom')
for (let corner of bottom_corners) {
    (corner => {corner.onmousedown = (event) =>{
        if (!globals.pressed_resize_bottom)
        {
            globals.pressed_resize_bottom = true
            globals.current_resize = corner.parentElement

            let tag = corner.parentElement.id.split('_')[0]
            pop_tab(tag)
            push_tab(tag)
        } else {
            globals.pressed_resize_bottom = false
            let tag = corner.parentElement.id.split('_')[0]
            save_tab(tag)
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

            let tag = corner.parentElement.id.split('_')[0]
            pop_tab(tag)
            push_tab(tag)
        } else {
            globals.pressed_resize_top = false
            let tag = corner.parentElement.id.split('_')[0]
            save_tab(tag)    
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
    if (msg == null) {
        return
    }
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

{
    let tab = document.getElementById('battle_tab');
    tab.classList.add('hidden');
}


function toogle_tab(tag) {
    // console.log('toogle tab ' + tag)
    let tab = document.getElementById(tag + '_tab');
    let button = document.getElementById(tag + '_button')

    button.classList.toggle('active')

    // console.log(tab.classList.contains('hidden'))
    // console.log(tab.classList)
    if (tab.classList.contains('hidden')) {
        tab.classList.remove('hidden');
        push_tab(tag)
        return 'on'
    } else {
        
        tab.classList.add('hidden');
        pop_tab(tag)
        
        return 'off'
    }

    
}

function push_tab(tag) {
    let tab = document.getElementById(tag + '_tab');
    tabs_queue.push(tag)
    tabs_position[tag] = tabs_queue.length - 1
    tab.style.zIndex = +tabs_queue.length + 1

    save_tab(tag)
}

function pop_tab(tag) {
    tabs_queue.splice(tabs_position[tag], 1)
    update_z_levels_tabs()
    save_tab(tag)
}

window.addEventListener('keydown', function(event) {
    if (event.defaultPrevented) {
        return
    }

    // console.log(event.code)

    if (event.code == "Escape") {
        // console.log('!!!')
        let length = tabs_queue.length
        // console.log(length)
        if (length > 0) {
            toogle_tab(tabs_queue[length - 1])
        }
    }
})

function update_z_levels_tabs() {
    for (let i in tabs_queue) {
        let tab_tag = tabs_queue[i]
        tabs_position[tab_tag] = i
        let tab = document.getElementById(tab_tag + '_tab');
        tab.style.zIndex = tabs_position[tab_tag]

        save_tab(tab_tag)
    } 
}

function turn_tab_on(tag) {
    let tab = document.getElementById(tag + '_tab');
    tab.classList.remove('hidden');
}

function turn_tab_off(tag) {
    let tab = document.getElementById(tag + '_tab');
    tab.classList.add('hidden');
}

for (let tag of game_tabs) {
    if (tag == 'battle') {
        continue
    }
    let button = document.getElementById(tag + '_button');
    button.onclick = () => {
        let res = toogle_tab(tag);
        
        console.log(tag, res)
        if ((tag == 'market') & (res == 'on')) {
            socket.emit('send-market-data', true)
        } else {
            socket.emit('send-market-data', false)
        }
    }
}
//CHANGE SCENES STUFF


// QUESTS

let quests_ui_object = {}
quests_ui_object.selected_quest_giver = undefined;
quests_ui_object.quest_givers = {}

function quests_reset() {
    let qg = document.querySelector('.quest_list')
    qg.innerHTML = ""

    let q = document.querySelector('.quest_block')
    q.innerHTML = ""
}

function update_quest_giver(quest_giver) {
    quests_ui_object.quest_givers[quest_giver.tag] = quest_giver.quests
    let tag = quest_giver.tag
    {
        let div = document.createElement('div')
        div.id = tag + '_questgiver'
        div.classList.add('quest_giver_block')

        let por_div = document.createElement('div')
        por_div.classList.add('portrait')
        por_div.style.backgroundImage = 'url(/static/img/portrait_'+ tag + '.png)'
        div.appendChild(por_div)

        let name_div = document.createElement('div')
        name_div.classList.add('name')
        name_div.innerHTML = quest_giver.name
        div.appendChild(name_div);

        ((div, tag) => {div.onclick = () => {
            let prev = document.querySelector('.quest_givers > .selected')
            if (prev != null) prev.classList.remove('selected')

            div.classList.add('selected')
            quests_ui_object.selected_quest_giver = div.id; 
            document.querySelector('.quest_portrait').style.backgroundImage = 'url(/static/img/portrait_'+ tag + '.png)'
        }})(div, tag)

        let list = document.querySelector('.quest_givers')
        list.appendChild(div)
    }

    for (let quest of quest_giver.quests) {
        let qtag = quest.tag
        let div = document.createElement('div')
        div.id = qtag + '_quest_' + tag 
        div.classList.add('quest_block')

        let d_short = document.createElement('div')
        d_short.classList.add('d_short')
        d_short.innerHTML = quest.name;
        ((tab) => tab.onclick = () => {
            tab.parentElement.querySelector('.d_expand').classList.toggle('hidden')      
        })(d_short)
        div.appendChild(d_short);

        let d_expand = document.createElement('div')
        d_expand.classList.add('d_expand')
        d_expand.classList.add('hidden')
        div.appendChild(d_expand)

        let description = document.createElement('div')
        description.innerHTML = quest.description

        let button = document.createElement('div')
        button.classList.add("button")
        button.innerHTML = 'Get reward'

        d_expand.appendChild(description)
        d_expand.appendChild(button)

        let list = document.querySelector('.quest_list')
        list.appendChild(div)
    }

}

update_quest_giver({tag: 'ith_merchant_mayor', name: 'G\'Ith\'Ub', quests: [{tag: 'kill', name: 'kill yourself', description: 'please'}]})


//


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
    'cook': 'Cooking',
    clothier: 'Clothing making',
    cooking: 'Cooking',
    onehand: 'One handed weapons',
    polearms: 'Polearms',
    noweapon: "Unarmed",
    skinning: 'Skinning animals',
    magic_mastery: 'Magic',
    blocking: 'Blocking attacks',
    evasion: 'Evading attacks',
    woodwork: 'Woodworking',
    hunt: 'Hunting'
}

var CURR_SKILL_DESC = undefined
var SKILL_SELECTED = undefined
var LOCAL_SKILLS = []
var skill_divs = {}
var learned_skill_divs = {}


function show_skill_tab(tag) {
    let tab = document.getElementById(tag + '_tab');
    tab.classList.remove('hidden');
}

function hide_skill_tab(tag) {
    let tab = document.getElementById(tag + '_tab');
    tab.classList.add('hidden');
}

function skill_tab_select(tag) {
    let tab = document.getElementById(tag + '_header')
    tab.classList.add('selected')
}
function skill_tab_deselect(tag) {
    let tab = document.getElementById(tag + '_header')
    tab.classList.remove('selected')
}

document.getElementById('skills_header').onclick = () => {
    skill_tab_select('skills')
    show_skill_tab('skills')
    skill_tab_deselect('perks')
    hide_skill_tab('perks')
}

document.getElementById('perks_header').onclick = () => {
    skill_tab_select('perks')
    show_skill_tab('perks')
    skill_tab_deselect('skills')
    hide_skill_tab('skills')
}

document.getElementById('open_armour_header').onclick = () => {
    skill_tab_select('open_armour')
    show_skill_tab('backpack_armour')
    skill_tab_deselect('open_weapon')
    skill_tab_deselect('open_all')
    hide_skill_tab('backpack_weapon')
}
document.getElementById('open_weapon_header').onclick = () => {
    skill_tab_select('open_weapon')
    show_skill_tab('backpack_weapon')
    skill_tab_deselect('open_armour')
    skill_tab_deselect('open_all')
    hide_skill_tab('backpack_armour')
}
document.getElementById('open_all_header').onclick = () => {
    skill_tab_select('open_all')
    show_skill_tab('backpack_weapon')
    show_skill_tab('backpack_armour')
    skill_tab_deselect('open_armour')
    skill_tab_deselect('open_weapon')
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

var SKILL_TAGS = {}

function load_skill_tags(data){
    SKILL_TAGS = data;
    for (let tag in SKILL_TAGS) {
        let div = build_skill_div(tag)
        document.getElementById('skills_tab').append(div)
    }
}

function build_skill_div(tag){
    let skill_div = document.createElement('div')
    skill_div.id = tag + '_skill_div'
    
    let name_label = document.createElement('div')
    name_label.classList.add('label')
    name_label.innerHTML = SKILL_NAMES[tag]
    

    let practice_bar_container = document.createElement('div')
    let practice_bar = document.createElement('span')
    practice_bar_container.classList.add('hbar')
    practice_bar_container.appendChild(practice_bar)

    practice_bar_container.appendChild(name_label)

    skill_div.appendChild(practice_bar_container)

    let practice_number = document.createElement('div')
    practice_number.classList.add('practice_n')
    practice_number.innerHTML = '?'
    skill_div.appendChild(practice_number)

    return skill_div
}

function update_skill_data(data) {
    for (let tag in SKILL_TAGS) {
        let div = document.getElementById(tag + '_skill_div')
        let amount = div.querySelector('.practice_n')
        amount.innerHTML = data[tag]?.practice
        let span = div.querySelector('.hbar > span')
        span.style.width = data[tag]?.practice + '%'
    }
}

// function shadow_skill(tag) {
//     skill_divs[tag].classList.add('shadowed')
// }
// function unshadow_skill(tag) {
//     skill_divs[tag].classList.remove('shadowed')
// }

// function send_skill_up_message(socket, tag) {
//     socket.emit('up-skill', tag);
// }

// function build_skill_div(tag, cur_level) {
//     let skill = document.createElement('div');
//     skill.classList.add("skill")
//     skill.id = 'skill_' + tag

//     let image = document.createElement('div');
//     image.classList.add("skill_thumbnail")
//     image.style =  "background: no-repeat 100%/100% url(/static/img/thumb_" + tag + ".png);"

//     let skill_level = document.createElement('div')
//     skill_level.classList.add("skill_level")

//     let level_up = document.createElement('div')
//     level_up.classList.add("level_up")
//     level_up.innerHTML = 'upgrade'

//     let level = document.createElement('div')
//     level.classList.add("current_level")
//     level.innerHTML = cur_level

//     skill.appendChild(image)
//     skill.appendChild(skill_level)

//     skill_level.appendChild(level_up)
//     skill_level.appendChild(level)

//     skill.onmouseover = () => {
//         set_skill_description(tag)
//     }
//     skill.onmouseout = () => {
//         set_skill_description(SKILL_SELECTED)
//     }
//     skill.onclick = () => {
//         if (SKILL_SELECTED != undefined) {
//             document.getElementById('skill_' + SKILL_SELECTED).classList.remove('selected')
//         }
//         SKILL_SELECTED = tag;
//         skill.classList.add('selected');
//     }
//     ((tag) => 
//         level_up.onclick = () => send_skill_up_message(socket, tag)
//     )(tag)

//     return skill
// }

// function build_learned_skill_div(tag, cur_level) {
//     let skill = document.createElement('div');
//     skill.classList.add("skill")
//     skill.id = 'l_skill_' + tag

//     let image = document.createElement('div');
//     image.classList.add("skill_thumbnail")
//     image.style =  "background: no-repeat 100%/100% url(/static/img/thumb_" + tag + ".png);"

//     let skill_level = document.createElement('div')
//     skill_level.classList.add("skill_level")

//     let level_up = document.createElement('div')
//     level_up.classList.add("level_up")
//     level_up.innerHTML = 'upgrade'

//     let level = document.createElement('div')
//     level.classList.add("current_level")
//     level.innerHTML = cur_level

//     skill.appendChild(image)
//     skill.appendChild(skill_level)

//     skill_level.appendChild(level_up)
//     skill_level.appendChild(level)

//     skill.onmouseover = () => {
//         set_skill_description(tag)
//     }
//     skill.onmouseout = () => {
//         set_skill_description(SKILL_SELECTED)
//     }
//     skill.onclick = () => {
//         if (SKILL_SELECTED != undefined) {
//             document.getElementById('skill_' + SKILL_SELECTED).classList.remove('selected')
//         }
//         SKILL_SELECTED = tag;
//         skill.classList.add('selected');
//     }
//     return skill
// }

// function load_skills(data) {
//     for (let tag in data) {
//         skill_divs[tag] = build_skill_div(tag, 0)
//         learned_skill_divs[tag] = build_learned_skill_div(tag, 0)
//     }
// }

// function update_local_skills(data) {
//     let list = document.getElementById('local_skills');
//     LOCAL_SKILLS = data;
//     list.innerHTML = ''

//     console.log(data)
    
//     if ((data != undefined) & (data != null)) {
//         for (let tag of data) {
//             list.appendChild(skill_divs[tag])
//         }
//     }    
// }

// function update_skill_data(data) {
//     console.log('update skills')
//     let list = document.getElementById('learned_skills');
//     list.innerHTML = '';
//     for (let tag in data) {
//         skill_divs[tag].querySelector('.current_level').innerHTML = data[tag];
//         let clone = skill_divs[tag].cloneNode(true)
//         clone.id = 'l_skill_' + tag
//         clone.querySelector('.level_up').innerHTML = 'level:'
//         clone.onmouseover = () => {
//             set_skill_description(tag)
//         }
//         clone.onmouseout = () => {
//             set_skill_description(SKILL_SELECTED)
//         }
//         clone.onclick = () => {
//             if (SKILL_SELECTED != undefined) {
//                 document.getElementById('l_skill_' + SKILL_SELECTED).classList.remove('selected')
//             }
//             SKILL_SELECTED = tag;
//             clone.classList.add('selected');
//         }
//         list.appendChild(clone)
//     }
// }
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

        let item_tag = data[tag]?.tag||'empty';
        div.style = "background: no-repeat center/100% url(/static/img/" + item_tag + "_big.png);"
    }
}

//EQUIP DISPLAY END

function start_battle(data) {
    console.log('start battle')
    turn_tab_on('battle')
    battle_image.clear()
    battle_image.load(data)
}

function end_battle() {
    turn_tab_off('battle')
    battle_image.clear()
}


//stash update
function update_savings(msg) {
    document.getElementById('savings').innerHTML = 'Money: ' + msg
}
function update_savings_trade(msg) {
    document.getElementById('savings_trade').innerHTML = 'Money reserved in trade: ' + msg
}

function update_stash(data) {
    console.log("STAAAAASH")
    console.log(data)
    for (let tag in stash_id_to_tag) {
        let stash = document.getElementById('goods_stash')
        // console.log(tag, stash_id_to_tag[tag])
        let div = stash.querySelector('.' + stash_id_to_tag[tag] + ' > .goods_amount_in_inventory')
        if (div != null)  {
            div.innerHTML = data[tag] || 0
        }
    }
}

function process_stash_click(tag) {
    console.log(tag)
    if (tag == 'food') {
        socket.emit('eat')
    }
}
//


//craft 

{
    let div = document.getElementById('cook_meat')
    div.onclick = () => socket.emit('cfood')
}

{
    let div = document.getElementById('make_spear')
    div.onclick = () => socket.emit('mspear')
}



// SOCKET ONS

socket.on('tags', msg => update_tags(msg));
socket.on('alert', msg => {my_alert(msg); new_log_message(msg)});

socket.on('sections', msg => map.load_sections(msg));

socket.on('is-reg-valid', msg => my_alert(msg));
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-valid', msg => my_alert(msg));
socket.on('is-login-completed', msg => login(msg));

socket.on('session', msg => {localStorage.setItem('session', msg)})
socket.on('reset_session', () => {localStorage.setItem('session', 'null')})

socket.on('hp', msg => char_info_monster.update_status(msg));
socket.on('exp', msg => char_info_monster.update_exp(msg));
socket.on('savings', msg => update_savings(msg));
socket.on('savings-trade', msg => update_savings_trade(msg));
socket.on('status', msg => char_info_monster.update_status(msg));
socket.on('name', msg => char_info_monster.update_name(msg));

socket.on('char-info-detailed', msg => character_screen.update(msg))
socket.on('stash-update', msg => {console.log('stash-update'); update_stash(msg)});
socket.on('equip-update', msg => {character_screen.update_equip(msg); update_equip(msg)});

socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));

socket.on('map-pos', msg => {
    let location = map.set_curr_pos(msg.x, msg.y, msg.teleport_flag);
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
socket.on('player-position', data => {((bi, data) => (bi.set_player(data)))(battle_image, data)})

socket.on('skill-tags', data => load_skill_tags(data));
socket.on('skills', msg => update_skill_data(msg));
// socket.on('local-skills', msg => update_local_skills(msg))

// socket.on('market-data', data => goods_market.update_data(data));

socket.on('market-data', data => update_market(data));

socket.on('item-market-data', data => {item_market_table.update(data)});



socket.on('action-ping', data => restart_action_bar(data.time, data.is_move))
socket.on('cell-visited', data => map.mark_visited(data))

socket.on('map-data-cells', data => { map.load_data(data)})
socket.on('map-data-terrain', data => {map.load_terrain(data)})
socket.on('map-data-reset', data => {map.reset()})

socket.on('cell-characters', data => {update_characters_list(data)})



function attack_selected_character() {
    if (globals.selected_character == undefined) {
        return
    }
    socket.emit('attack-character', globals.selected_character)
}
{
    let attack_button = document.getElementById("attack_selected_charater")
    attack_button.onclick = attack_selected_character
}

function update_characters_list(data) {
    console.log('update characters_list')
    console.log(data)
    let list_div = document.getElementById('characters_list')
    globals.local_characters = data

    list_div.innerHTML = ''

    let flag_remove_selection = true

    for (let item of data) {
        let character_div = document.createElement('div')
        let character_name = document.createElement('div')
        character_name.innerHTML = item.name

        character_div.appendChild(character_name)
        character_div.id = 'ListCharacterId_' + item.id
        character_div.classList.add('list_item');

        ((id) => character_div.onclick = () => {
            select_character(id)
        })(item.id)

        if (item.id == globals.selected_character) {
            flag_remove_selection = true
        }

        list_div.appendChild(character_div)
    }

    if (flag_remove_selection) {
        globals.selected_character = undefined
    }
}

function select_character(id) {
    if (globals.selected_character != undefined) {
        let character_div = document.getElementById('ListCharacterId_' + globals.selected_character)
        if (character_div != undefined) {
            character_div.classList.remove('selected')
        }        
    }

    globals.selected_character = id
    let character_div = document.getElementById('ListCharacterId_' + id)
    character_div.classList.add('selected')
}


{
    let test_data = [
        {name: 'Someone', id: 100},
        {name: 'Noone', id: 200},
        {name: 'Who?', id: 300},
        {name: "He", id: 400}]
    
    
    update_characters_list(test_data)
}

let market_div = document.querySelector('.goods_list')

function send_execute_order_request(order_id, amount) {
    socket.emit('execute-order', {amount: amount, order: order_id})
}

function create_market_order_row(good_tag, amount, sell_price, buy_price, dummy_flag, order_id) {
    let div_cell = document.createElement('div');
    div_cell.classList.add('goods_type');
    

    if (!dummy_flag) {
        div_cell.classList.add(good_tag);
        {
            let div_image = document.createElement('div');
            div_image.classList.add('goods_icon');
            div_image.style = "background: no-repeat center/100% url(/static/img/stash_" + good_tag + ".png);"
            div_cell.appendChild(div_image)
        }
    }
    

    {
        let div_text = document.createElement('div');
        div_text.innerHTML = good_tag;
        div_text.classList.add('goods_name');
        div_cell.appendChild(div_text);
    }

    {
        let avg_price = document.createElement('div');
        avg_price.innerHTML = buy_price;
        avg_price.classList.add('goods_avg_buy_price');
        div_cell.appendChild(avg_price);
    }

    {
        let avg_price = document.createElement('div');
        avg_price.innerHTML = sell_price;
        avg_price.classList.add('goods_avg_sell_price');
        div_cell.appendChild(avg_price);
    }

    {
        let div = document.createElement('div');
        div.innerHTML = amount;
        div.classList.add('goods_amount_in_inventory');
        div_cell.appendChild(div);
    }

    if (!dummy_flag) {
        {
            let div = document.createElement('div');
            div.innerHTML = 'Buy/Sell 1';
            div.classList.add('market_button');
            div_cell.appendChild(div);

            ((order_id, button) => button.onclick = () => send_execute_order_request(order_id, 1))(order_id, div)
        }
    }

    // ((good_tag) => div_cell.onclick = () => {
    //     goods_market.select(good_tag)
    // })(good_tag)

    market_div.appendChild(div_cell)
}

function update_market(data) {
    console.log('update market')
    console.log(data)

    market_div.innerHTML = ''

    create_market_order_row('Item type', 'Amount', 'Sell price', 'Buy_price', true)

    for (let item of data) {
        console.log(item)
        let sell_price = '?'
        let buy_price = '?'
        if (item.typ == 'sell') {sell_price = item.price}
        if (item.typ == 'buy') {buy_price = item.price}
        let tag = stash_id_to_tag[item.tag]
        create_market_order_row(tag, item.amount, sell_price, buy_price, false, item.id)
    } 
}
        // tmp.typ = this.typ;
        // tmp.tag = this.tag;
        // tmp.owner_id = this.owner_id;
        // if (this.owner != undefined) {
        //     tmp.owner_name = this.owner.name;
        //     tmp.owner_tag = this.owner.get_tag;
        // }
        // tmp.amount = this.amount;
        // tmp.price = this.price;
        // tmp.id = this.id;



function update_tags(msg) {
    console.log("TAAAAAAGS")
    console.log(msg)

    

     
    let inventory_div = document.getElementById('goods_stash')
    let material_select = document.getElementById('create_order_material')
    
    stash_tag_to_id = msg
    console.log(stash_tag_to_id)

    for (var tag in msg) {
        stash_id_to_tag[msg[tag]] = tag

        {
            // stash
            let div_cell = document.createElement('div');
            div_cell.classList.add('goods_type_stash');
            div_cell.classList.add('tooltip')
            div_cell.classList.add(tag);
            ((tag) => div_cell.onclick = () => {process_stash_click(tag)})(tag)

            {
                let div_image = document.createElement('div');
                div_image.classList.add('goods_icon');
                div_image.style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
                div_cell.appendChild(div_image)
            }

            {
                let div_text = document.createElement('span');
                div_text.innerHTML = tag;
                div_text.classList.add('tooltiptext');
                div_cell.appendChild(div_text);
            }
            
            {
                let div = document.createElement('div');
                div.innerHTML = '?';
                div.classList.add('goods_amount_in_inventory');
                div_cell.appendChild(div);
            }

            inventory_div.appendChild(div_cell)

            let option = document.createElement('option')
            option.value = msg[tag]
            option.innerHTML = tag
            material_select.appendChild(option)

        }
    }

    goods_market.update_tags(stash_tag_to_id, stash_id_to_tag)



    {
        let test_market_data = [
            {typ: 'sell', amount: 20, tag: 2, owner_name: 'Someone', price: 4},
            {typ: 'sell', amount: 20, tag: 2, owner_name: 'Someone', price: 14},
            {typ: 'buy', amount: 20, tag: 3, owner_name: 'Someone', price: 130},
            {typ: 'sell', amount: 20, tag: 1, owner_name: 'Someone2', price: 70},
            {typ: 'sell', amount: 20, tag: 4, owner_name: 'Someon3e', price: 1},
            {typ: 'buy', amount: 20, tag: 5, owner_name: 'Some4one', price: 5},
            {typ: 'sell', amount: 200, tag: 5, owner_name: 'Someo5ne', price: 220},
        ]
        update_market(test_market_data)
    }
}


{
    let order_button = document.getElementById('create_order_button')
    order_button.onclick = (() => {
        let material = document.getElementById('create_order_material').value
        let type = document.getElementById('create_order_type').value
        let amount = document.getElementById('create_order_amount').value
        let price = document.getElementById('create_order_price').value

        socket.emit(type, {material: Number(material), amount: Number(amount), price: Number(price)})
        // console.log(material, type, amount, price)
    })
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
        // show_char_creation();
        show_game();
    }
}


function restart_action_bar(time, is_move) {
    // console.log('???')
    globals.action_total_time = time
    globals.action_in_progress = true
    globals.action_time = 0
    let div = document.getElementById('action_progress_bar')
    div.classList.remove('hidden')
    let bar = div.querySelector('span')
    bar.style.width = '0%'

    if (is_move) {
        map.move_flag = true
        map.movement_progress = 0
        globals.action_total_time += 0.1
        globals.action_total_time *= 1.1
    }
    
}

var currentTime = (new Date()).getTime(); var lastTime = (new Date()).getTime();
var delta = 0;

function draw(time) {
    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (globals.action_in_progress) {
        globals.action_time += delta
        globals.action_ratio = globals.action_time / globals.action_total_time
        let div = document.getElementById('action_progress_bar')
        if (globals.action_total_time <= globals.action_time) {
            globals.action_in_progress = false
            div.classList.add('hidden')
            // map.move_flag = false
        } else {
            let bar = div.querySelector('span')
            bar.style.width = Math.floor(globals.action_time / globals.action_total_time * 10000)/ 100 + '%'
            if (map.move_flag) {map.movement_progress = globals.action_time / globals.action_total_time }
        }    
    }

    if (globals.map_context_dissapear_time != undefined) {
        if ((globals.map_context_dissapear_time > 0) && (!globals.mouse_over_map_context)) {
            globals.map_context_dissapear_time = Math.max(0, globals.map_context_dissapear_time - delta)
            if (globals.map_context_dissapear_time == 0) {
                document.getElementById('map_context').classList.add('hidden')
            }
        }
    }

    if (document.getElementById('actual_game_scene').style.visibility == 'visible') {
        if (!document.getElementById('battle_tab').classList.contains('hidden')) {
            battle_image.draw(images, delta);
        }
        if (!document.getElementById('map_tab').classList.contains('hidden')){
            map.draw(images, delta);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(images_list[0], images_list[1], () => { 
    console.log(images);
    window.requestAnimationFrame(draw);
});