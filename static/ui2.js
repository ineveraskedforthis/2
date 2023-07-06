// const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character', 'quest', 'stash', 'craft']
import { socket, globals } from './modules/globals.js';

// import './modules/map.js';
import {CharInfoMonster} from './modules/char_info_monster.js';
import {CharacterScreen} from './modules/CharacterScreen/character_screen.js'
import {EQUIPMENT_TAGS} from './modules/CharacterScreen/update.js'
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
import './widgets/Market/market.js'
import { stash_tag_to_id, stash_id_to_tag, update_savings, update_savings_trade, update_stash, update_tags } from './bulk_tags.js';

import { update_characters_list } from './update_characters_list.js';
import { SKILL_NAMES } from './SKILL_NAMES.js';
import { goods_market } from './goods_market.js'
import { set_up_header_with_strings } from './headers.js';
import { draw_map_related_stuff } from './modules/map.js';

const char_info_monster = new CharInfoMonster();


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



//CHARACTER 2D IMAGE DISPLAY

var race_model = "human"

function set_body_type(race) {
    // console.log(race)
    race_model = race
    if (race != 'human') {
        document.getElementById('character_creation_image_body').src = `../static/img/character_image/${race}/pose.png`
        document.getElementById('character_image_body').src = `../static/img/character_image/${race}/pose.png`
        document.querySelector(`.only_body.character_image`).src = ''
        document.querySelector(`.left_arm.character_image`).src = ''
        document.querySelector(`.right_arm.character_image`).src = ''
    } else {
        document.getElementById('character_creation_image_body').src = `../static/img/character_image/${race}/pose.png`
        document.getElementById('character_image_body').src = ``
        document.querySelector(`.only_body.character_image`).src = '../static/img/character_image/human/body.png'
        document.querySelector(`.left_arm.character_image`).src = '../static/img/character_image/human/left_arm.png'
        document.querySelector(`.right_arm.character_image`).src = '../static/img/character_image/human/right_arm.png'
    }
}

socket.on('model', (race) => {
    set_body_type(race)
})

const body_left_arm = document.createElement('img')
body_left_arm.classList.add('character_image')
body_left_arm.classList.add('left_arm')
const body_body = document.createElement('img')
body_body.classList.add('character_image')
body_body.classList.add('only_body')
const body_right_arm = document.createElement('img')
body_right_arm.classList.add('character_image')
body_right_arm.classList.add('right_arm')


let character_image_collection = document.getElementById('character_image_display')
for (let tag of EQUIPMENT_TAGS.slice().reverse()) {
    let equip_piece = document.createElement('img') 
    equip_piece.classList.add('equip')
    equip_piece.classList.add(tag)
    equip_piece.classList.add('character_image')
    equip_piece.classList.add('behind_all')
    equip_piece.alt = ``
    character_image_collection.appendChild(equip_piece)
}

character_image_collection.appendChild(body_left_arm)

for (let tag of EQUIPMENT_TAGS) {
    let equip_piece = document.createElement('img') 
    equip_piece.classList.add('equip')
    equip_piece.classList.add(tag)
    equip_piece.classList.add('character_image')
    equip_piece.classList.add('behind_body')
    equip_piece.alt = ``
    character_image_collection.appendChild(equip_piece)
}

character_image_collection.appendChild(body_body)

for (let tag of EQUIPMENT_TAGS) {
    let equip_piece = document.createElement('img') 
    equip_piece.classList.add('equip')
    equip_piece.classList.add(tag)
    equip_piece.classList.add('character_image')
    equip_piece.classList.add('behind_right_arm')
    equip_piece.alt = ``
    character_image_collection.appendChild(equip_piece)
}

character_image_collection.appendChild(body_right_arm)

for (let tag of EQUIPMENT_TAGS) {
    let equip_piece = document.createElement('img') 
    equip_piece.classList.add('equip')
    equip_piece.classList.add(tag)
    equip_piece.classList.add('character_image')
    equip_piece.classList.add('on_top')
    equip_piece.alt = ``
    character_image_collection.appendChild(equip_piece)
}

const display_layers = ['behind_all', 'behind_body', 'behind_right_arm', 'on_top']

function update_equip(data) {
    console.log('equip update')
    console.log(data)
    for (let layer of display_layers){
        if ((layer != 'on_top') && (race_model != 'human')) {continue}
        for (let tag of EQUIPMENT_TAGS) {
            let div = document.querySelector('.character_image.equip.' + tag + '.' + layer);
            console.log(tag, data.equip[tag])
            let item_tag = data.equip[tag]?.name||'empty';
            if (tag == 'secondary') {
                continue
            }

            if (item_tag == 'empty') {
                div.src = `../static/img/character_image/${race_model}/${item_tag}.png`
            }
            if (race_model == 'human') {
                console.log(`/static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.png`)
                div.src = `../static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.png`
            } else {
                console.log(`/static/img/character_image/${race_model}/${item_tag}.png`)
                div.src = `../static/img/character_image/${race_model}/${item_tag}.png`
            }
            
        }
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






socket.on('skill-tags', data => load_skill_tags(data));
socket.on('skill', msg => update_skill_data(msg));


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

    draw_map_related_stuff(delta)

    if (document.getElementById('actual_game_scene').style.visibility == 'visible') {
        if (!document.getElementById('battle_tab').classList.contains('hidden')) {
            BattleImage.draw(delta);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(() => { 
    console.log(images);
    window.requestAnimationFrame(draw);
});