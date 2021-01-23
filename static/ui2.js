// eslint-disable-next-line no-undef
var socket = io();

import {init_map_control, Map} from './modules/map.js';
import {CharInfoMonster} from './modules/char_info_monster.js';

var globals = {
    prev_mouse_x: null,
    prev_mouse_y: null,
    pressed: false
}

const char_info_monster = new CharInfoMonster();
const map = new Map(document.getElementById('map'), document.getElementById('map_control'), socket);
init_map_control(map, globals)

socket.on('connect', () => {
    console.log('connected')
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
})

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

//MESSAGES STUFF END

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





socket.on('tags', msg => update_tags(msg));
socket.on('alert', msg => alert(msg));

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

socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));

socket.on('map-pos', msg => {
    console.log(msg); 
    let location = map.set_curr_pos(msg.x, msg.y);
    // battle_image.change_bg(location);
});
socket.on('explore', msg => {map.explore(msg)});


function update_tags(msg) {
    // for (var tag of msg) {
    //     var tag_option = new Option(tag, tag);
    //     document.getElementById('buy_tag_select').add(tag_option);
    //     tag_option = new Option(tag, tag);
    //     document.getElementById('sell_tag_select').add(tag_option);
    //     document.getElementById('inv_' + tag + '_image').style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
    // }
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
        // if (document.getElementById('battle_tab').style.visibility != 'hidden') {
        //     battle_image.draw(delta);
        // }
        if (document.getElementById('map_tab').style.visibility != 'hidden'){
            map.draw(images, time);
        }
    }
    window.requestAnimationFrame(draw);
}


const images = loadImages(images_list[0], images_list[1], () => { console.log(images), window.requestAnimationFrame(draw);});