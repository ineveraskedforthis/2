import { elementById } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js"
import { socket } from "../Socket/socket.js";
import { CharacterView } from "@custom_types/responses.js";


export function init_character_list_interactions() {
    socket.on('cell-characters', data => { update_characters_list(data); });
    elementById("attack_selected_character").onclick = attack_selected_character;
    elementById("support_selected_character").onclick = support_selected_character;
    elementById("rob_selected_character").onclick = rob_selected_charater
}


function attack_selected_character() {
    if (globals.selected_character == undefined) {
        return;
    }
    socket.emit('attack-character', globals.selected_character);
}
function support_selected_character() {
    if (globals.selected_character == undefined) {
        return;
    }
    socket.emit('support-character', globals.selected_character);
}
function rob_selected_charater() {
    if (globals.selected_character == undefined) {
        return;
    }
    socket.emit('rob-character', globals.selected_character);
}

export function update_characters_list(data: CharacterView[]) {
    console.log('update characters_list');
    console.log(data);
    let list_div = elementById('characters_list');
    globals.local_characters = data;

    list_div.innerHTML = '';

    let flag_remove_selection = true;

    for (let item of data) {
        let character_div = document.createElement('div');
        let character_name = document.createElement('div');
        character_name.innerHTML = item.name;

        character_div.appendChild(character_name);
        character_div.id = 'ListCharacterId_' + item.id;
        character_div.classList.add('list_item');
        if (item.dead) {
            character_div.classList.add('red-text');
        }

        ((id) => character_div.onclick = () => {
            select_character(id);
        })(item.id);

        if (item.id == globals.selected_character) {
            flag_remove_selection = true;
        }

        list_div.appendChild(character_div);
    }

    if (flag_remove_selection) {
        globals.selected_character = undefined;
    }
}
function select_character(id: number) {
    if (globals.selected_character != undefined) {
        let character_div = document.getElementById('ListCharacterId_' + globals.selected_character);
        if (character_div != undefined) {
            character_div.classList.remove('selected');
        }
    }

    globals.selected_character = id;
    let character_div = elementById('ListCharacterId_' + id);
    character_div.classList.add('selected');
}
