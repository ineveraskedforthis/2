// const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character', 'quest', 'stash', 'craft']

import {init_map_control, Map} from './modules/map.js';
import {CharInfoMonster} from './modules/char_info_monster.js';
import {CharacterScreen, EQUIPMENT_TAGS} from './modules/CharacterScreen/character_screen.js'
import { socket, globals } from './modules/globals.js';
import { reg, login } from './modules/ViewManagement/scene.js'
import './modules/Battle/battle_image_init.js'
import './modules/Market/items_market.js'
import { BattleImage } from './modules/Battle/battle_image.js';
import { loadImages } from './modules/load_images.js';
import './new_log_message.js';
import './request_perks.js'
import './request_buildings.js'
import './craft_list_div.js'
import './login.js'
import { stash_tag_to_id, stash_id_to_tag, update_savings, update_savings_trade, update_stash, update_tags } from './bulk_tags.js';
import { update_market } from './update_market.js';
import { update_characters_list } from './update_characters_list.js';
import { SKILL_NAMES } from './SKILL_NAMES.js';
import { goods_market } from './goods_market.js'
import { set_up_header_with_strings } from './headers.js';


const char_info_monster = new CharInfoMonster();
const map = new Map(document.getElementById('map_canvas'), document.getElementById('map_control'), socket, globals);
init_map_control(map, globals);

const character_screen = new CharacterScreen(socket);


// noselect tabs 

[...document.querySelectorAll(".noselect")].forEach( el => 
 el.addEventListener('contextmenu', e => e.preventDefault())
);


socket.on('connect', () => {
    console.log('connected')
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
})

set_up_header_with_strings([
    {element: 'skills_header', connected_element: 'skills_tab'},
    {element: 'perks_header', connected_element: 'perks_tab'}, 
    {element: 'stats_header', connected_element: 'stats_tab'}
])

var SKILL_TAGS = {}

function load_skill_tags(data){
    console.log('load skills')
    console.log(data)
    SKILL_TAGS = data;
    document.getElementById('skills_tab').innerHTML = ''
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

// pure_value: pure_value, current_value: current_value
function update_skill_data(data) {
    const tag = data.tag
    const value = data.current_value
    const pure_value = data.pure_value

    const div = document.getElementById(tag + '_skill_div')
    if (div == undefined) {
        return
    }
    const amount = div.querySelector('.practice_n')
    if (amount == null) {
        return
    }
    amount.innerHTML = value
    const span = div.querySelector('.hbar > span')
    span.style.width = value + '%'
}



//CHARACTER CREATION STUFF
var character_display = {
    eyes: 1,
    chin: 0,
    mouth: 0
}

// document.getElementById("next_1").onclick = (event) => {
//     event.preventDefault();
//     document.getElementById("page_2").style.visibility = 'inherit'
// }

document.getElementById("next_2").onclick = (event) => {
    event.preventDefault();
    let name = document.getElementById('char_name').value
    let race = document.getElementById('char_race').value
    let data = {
        name: name,
        mouth: character_display.mouth,
        chin: character_display.chin,
        eyes: character_display.eyes,
        faction: race,
        race: race
    }    
    console.log(data)
    socket.emit('create_character', data)
}

function set_faction(faction) {
    document.getElementById('char_race').value = faction
    if (faction == 'city') var race = 'human' 
    if (faction == 'steppe_humans') var race = 'human' 
    if (faction == 'big_humans') var race = 'human_strong' 
    if (faction == 'rats') var race = 'bigrat' 
    if (faction == 'graci') var race = 'graci' 
    if (faction == 'elodino_free') var race = 'elo' 

    set_body_type(race)
    hover_faction(faction)
}

function hover_faction(faction) {
    document.getElementById('minimap_overlay').style.backgroundImage = 'url(/static/img/minimap/' + faction + '.png)'
}


{
    const width = document.getElementById('minimap_character_creation').clientWidth
    const height = document.getElementById('minimap_character_creation').clientHeight
    document.getElementById('minimap_character_creation').onclick = (event) => {
        const x_position = event.offsetX;
        const y_position = event.offsetY;
        if ((y_position > height / 2) && (x_position < width / 3)) {
            set_faction('city')
        }
        else if ((y_position > height / 2) && (x_position > width / 2)) {
            set_faction('big_humans')
        }
        else if ((y_position > height / 2) && (x_position < width / 1.5)) {
            set_faction('rats')
        }
        else if ((y_position < height / 3) && (x_position > width / 2)) {
            set_faction('elodino_free')
        }
        else if ((y_position < 2 * height / 3) && (x_position > width / 3)) {
            set_faction('graci')
        }
        else if ((y_position < height / 2) && (x_position < width / 3)) {
            set_faction('steppe_humans')
        }
    }
    document.getElementById('minimap_character_creation').onmousemove = (event) => {
        const x_position = event.offsetX;
        const y_position = event.offsetY;
        if ((y_position > height / 2) && (x_position < width / 3)) {
            hover_faction('city')
        }
        else if ((y_position > height / 2) && (x_position > width / 2)) {
            hover_faction('big_humans')
        }
        else if ((y_position > height / 2) && (x_position < width / 1.5)) {
            hover_faction('rats')
        }
        else if ((y_position < height / 3) && (x_position > width / 2)) {
            hover_faction('elodino_free')
        }
        else if ((y_position < 2 * height / 3) && (x_position > width / 3)) {
            hover_faction('graci')
        }
        else if ((y_position < height / 2) && (x_position < width / 3)) {
            hover_faction('steppe_humans')
        }
    }
}

document.getElementById('char_race').addEventListener('change', function() {
    let faction = document.getElementById('char_race').value
    set_faction(faction)
});

var race_model = "human"

function set_body_type(race) {
    // console.log(race)
    race_model = race
    document.getElementById('character_creation_image_body').src = `../static/img/character_image/${race}/pose.png`
    document.getElementById('character_image_body').src = `../static/img/character_image/${race}/pose.png`
}

socket.on('model', (race) => {
    set_body_type(race)
})

// for (let i = 0; i<3; i++) {
//     document.getElementById("eyes_"+ i).onclick = (event) => {
//         event.preventDefault();
//         character_display.eyes = i
//         document.getElementById("character_image_eyes").style.backgroundImage = 'url(/static/img/character_image/eyes_'+ i + '.png)'
//         document.getElementById("character_creation_image_eyes").style.backgroundImage = 'url(/static/img/character_image/eyes_'+ i + '.png)'
        
//     }
// }
// for (let i = 0; i<3; i++) {
//     document.getElementById("chin_"+ i).onclick = (event) => {
//         event.preventDefault();
//         character_display.chin = i
//         document.getElementById("character_image_chin").style.backgroundImage = 'url(/static/img/character_image/chin_'+ i + '.png)'
//         document.getElementById("character_creation_image_chin").style.backgroundImage = 'url(/static/img/character_image/chin_'+ i + '.png)'
//     }
// }
// for (let i = 0; i<3; i++) {
//     document.getElementById("mouth_"+ i).onclick = (event) => {
//         event.preventDefault();
//         character_display.mouth = i
//         document.getElementById("character_image_mouth").style.backgroundImage = 'url(/static/img/character_image/mouth_'+ i + '.png)'
//         document.getElementById("character_creation_image_mouth").style.backgroundImage = 'url(/static/img/character_image/mouth_'+ i + '.png)'
//     }
// }
//CHARACTER CREATION STUFF ENDS


//EQUIP 2D IMAGE DISPLAY

function update_equip(data) {
    console.log('equip update')
    console.log(data)
    for (let tag of EQUIPMENT_TAGS) {
        let div = document.querySelector('.character_image.equip.' + tag);
        console.log(tag, data.equip[tag])
        let item_tag = data.equip[tag]?.name||'empty';

        if (tag == 'secondary') {
            continue
        }

        console.log(`/static/img/character_image/${race_model}/${item_tag}_big.png`)
        div.src = `../static/img/character_image/${race_model}/${item_tag}_big.png`
    }
}

//

function send_switch_weapon_request() {
    socket.emit('switch-weapon')
}

{
    let button = document.getElementById('send_switch_weapon_request')
    button.onclick = send_switch_weapon_request
}


// SOCKET ONS

socket.on('tags', msg => {
    update_tags(msg)
    goods_market.update_tags(stash_tag_to_id, stash_id_to_tag);
});





socket.on('sections', msg => map.load_sections(msg));


socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-completed', msg => login(msg));

socket.on('session', msg => {localStorage.setItem('session', msg)})
socket.on('reset_session', () => {localStorage.setItem('session', 'null')})

socket.on('hp', msg => char_info_monster.update_hp(msg));
socket.on('exp', msg => char_info_monster.update_exp(msg));

socket.on('savings', msg => update_savings(msg));
socket.on('savings-trade', msg => update_savings_trade(msg));

socket.on('status', msg => char_info_monster.update_status(msg));
socket.on('name', msg => char_info_monster.update_name(msg));

socket.on('char-info-detailed', msg => character_screen.update(msg))
socket.on('stash-update', msg => {console.log('stash-update'); update_stash(msg)});
socket.on('equip-update', msg => {character_screen.update_equip(msg); update_equip(msg)});



socket.on('map-pos', msg => {
    console.log('map-pos')
    let location = map.set_curr_pos(msg.x, msg.y, msg.teleport_flag);
    console.log(location)
    change_bg(location);
});

socket.on('enter-room', msg => {
    console.log('enter-room')
    change_bg('house_inside');
})
socket.on('leave-room', msg => {
    console.log('leave-room')
    update_background()
})

function update_background() {
    // console.log('update_background')
    let location = map.re_set_cur_pos();
    // console.log(location)
    change_bg(location);
}


socket.on('explore', msg => {map.explore(msg)});


socket.on('skill-tags', data => load_skill_tags(data));
socket.on('skill', msg => update_skill_data(msg));
// socket.on('local-skills', msg => update_local_skills(msg))

// socket.on('market-data', data => goods_market.update_data(data));

socket.on('market-data', data => update_market(data));


socket.on('action-ping', data => restart_action_bar(data.time, data.is_move))


socket.on('cell-visited', data => map.mark_visited(data))
socket.on('map-data-cells', data => { 
    map.load_data(data)
    update_background()
})
socket.on('map-data-display', data => {map.load_terrain(data)})
socket.on('map-data-reset', data => {map.reset()})
socket.on('map-action-status', data => map.update_action_status(data))
socket.on('cell-action-chance', msg => map.update_probability(msg))


{
    let test_data = [
        {name: 'Someone', id: 100},
        {name: 'Noone', id: 200},
        {name: 'Who?', id: 300},
        {name: "He", id: 400}]
    
    
    update_characters_list(test_data)
}



{   
    function generate_toggle(div) {
        return () => {div.classList.toggle('border-yellow')}
    }
    const destroy_button = document.getElementById('destroy')
    const enchant_button = document.getElementById('enchant')

    const affected_div = document.getElementById('equip_tab')
    destroy_button.onclick = generate_toggle(affected_div)
}


function change_bg(tag) {
    let div = document.getElementById('actual_game_scene');
    div.style.backgroundImage = "url(/static/img/bg_" + tag + ".png)"
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

// var currentTime = (new Date()).getTime(); 
// var lastTime = (new Date()).getTime();

var delta = 0;

// var start = undefined
var previous = undefined

function draw(time) {
    if (previous == undefined) {
        previous = time
    }

    // currentTime = (new Date()).getTime();
    // delta = (currentTime - lastTime) / 1000;
    // lastTime = currentTime;

    delta = (time - previous) / 1000
    previous = time

    // console.log('draw_main')

    if (globals.action_in_progress) {
        globals.action_time += delta
        globals.action_ratio = globals.action_time / globals.action_total_time
        let div = document.getElementById('action_progress_bar')
        if (globals.action_total_time * 1.2 <= globals.action_time ) {
            // if current action_time >= total_time * 1.2
            // so if action had ended with a little overshoot
            // then stop action
            globals.action_in_progress = false
            div.classList.add('hidden')
            //check repeat action flags
            console.log('keep doing?')
            console.log(globals.keep_doing)
            if (globals.keep_doing != undefined) {
                map.send_local_cell_action(globals.keep_doing)
            }
            //do the movement again if you are not at destination already
            if (map.move_flag) {
                map.send_cell_action('continue_move')
            }            
            // map.move_flag = false
        } else {
            let bar = div.querySelector('span')
            bar.style.width = Math.floor(globals.action_time / globals.action_total_time * 10000)/ 100 + '%'
            if (map.move_flag) {map.movement_progress = globals.action_ratio}
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
            BattleImage.draw(delta);
        }
        if (!document.getElementById('map_tab').classList.contains('hidden')){
            map.draw(images, delta);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(() => { 
    console.log(images);
    window.requestAnimationFrame(draw);
});