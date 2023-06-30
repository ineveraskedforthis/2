import { socket, globals } from './modules/globals.js';

socket.on('cell-characters', data => { update_characters_list(data); });
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
{
    let attack_button = document.getElementById("attack_selected_character");
    attack_button.onclick = attack_selected_character;
    let support_button = document.getElementById("support_selected_character");
    support_button.onclick = support_selected_character;
    let rob_button = document.getElementById("rob_selected_character");
    rob_button.onclick = rob_selected_charater
}
export function update_characters_list(data) {
    console.log('update characters_list');
    console.log(data);
    let list_div = document.getElementById('characters_list');
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
function select_character(id) {
    if (globals.selected_character != undefined) {
        let character_div = document.getElementById('ListCharacterId_' + globals.selected_character);
        if (character_div != undefined) {
            character_div.classList.remove('selected');
        }
    }

    globals.selected_character = id;
    let character_div = document.getElementById('ListCharacterId_' + id);
    character_div.classList.add('selected');
}
