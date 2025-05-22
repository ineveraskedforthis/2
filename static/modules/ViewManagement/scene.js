import { globals } from "../globals.js";
import { elementById } from "../HTMLwrappers/common.js";
import { my_alert } from "../MessageBox/my_alert.js";
import { socket } from "../Socket/socket.js";
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
    let button = elementById('reset_windows');
    button.onclick = () => { localStorage.setItem('tabs_properties', 'null'); tab.reset_style_all(); tab.save_tabs_all(); };
}
{
    let button = elementById('toggle_render');
    button.onclick = () => { globals.draw_characters = false; };
}
//CHANGE SCENES STUFF
function show_char_creation() {
    show_scene("character_creation");
    document.getElementById('page_1').style.visibility = 'inherit';
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
        my_alert(msg);
    }
    else if (msg == 'ok') {
        console.log('login success');
        socket.emit('play');
    }
    let tutorial_stage = localStorage.getItem('tutorial');
    if (tutorial_stage == null) {
        // show_tutorial(0);
    }
}
export function reg(msg) {
    if (msg != 'ok') {
        my_alert(msg);
    }
    else if (msg == 'ok') {
        // tactic_screen.reset_tactic()
        // show_char_creation();
        console.log('registration success');
        socket.emit('play');
    }
}
export function init_game_scene(maps) {
    socket.on('no-character', show_char_creation);
    socket.on('loading_completed', show_game);
    socket.on('char-removed', show_char_creation);
    tab.load_all(socket, maps);
}
