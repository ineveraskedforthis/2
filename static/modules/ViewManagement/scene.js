import { socket } from "../globals.js";
import { tab } from "./tab.js";
function reloadCss() {
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}
{
    let button = document.getElementById('reset_tabs');
    button.onclick = () => { localStorage.setItem('tabs_properties', 'null'); location.reload(); };
}
//CHANGE SCENES STUFF
function show_char_creation() {
    show_scene("character_creation");
    document.getElementById('page_1').style.visibility = 'inherit';
}
function show_main_menu() {
    show_scene("main_menu");
}
function show_game() {
    console.log('show game');
    show_scene("actual_game_scene");
}
function show_scene(scene_id) {
    console.log('show ' + scene_id);
    let parent_elem = document.getElementById(scene_id).parentElement;
    for (var i = 0; i < parent_elem.children.length; i++) {
        if (parent_elem.children[i].id != undefined && parent_elem.children[i].id != null && parent_elem.children[i].id != '') {
            document.getElementById(parent_elem.children[i].id).style.visibility = 'hidden';
        }
    }
    document.getElementById(scene_id).style.visibility = 'visible';
}
export function login(msg) {
    if (msg != 'ok') {
        alert(msg);
    }
    else if (msg == 'ok') {
        console.log('login success');
        // tactic_screen.reset_tactic()
        show_main_menu();
    }
    let tutorial_stage = localStorage.getItem('tutorial');
    if (tutorial_stage == null) {
        // show_tutorial(0);
    }
}
export function reg(msg) {
    if (msg != 'ok') {
        alert(msg);
    }
    else if (msg == 'ok') {
        // tactic_screen.reset_tactic()
        // show_char_creation();
        console.log('registration success');
        show_main_menu();
    }
}
// Main menu:
document.getElementById('to_character_creation').onclick = () => {
    socket.emit('play');
};
socket.on('no-character', show_char_creation);
socket.on('loading_completed', show_game);
socket.on('char-removed', show_char_creation);
tab.load_all(socket);
