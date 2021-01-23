// eslint-disable-next-line no-undef
var socket = io();

socket.on('connect', () => {
    console.log('connected')
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
})


function show_char_creation() {
    show_scene("character_creation")
    document.getElementById('page_1').style.visibility = 'visible';
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
    document.getElementById("page_2").style.visibility = 'visible'
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

socket.on('tags', msg => update_tags(msg));
socket.on('is-reg-valid', msg => my_alert(msg));
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-valid', msg => my_alert(msg));
socket.on('is-login-completed', msg => login(msg));


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
        show_char_creation();
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