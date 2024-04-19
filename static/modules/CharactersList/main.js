import { elementById, select, selectOne } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { socket } from "../Socket/socket.js";
import { List } from "../../widgets/List/list.js";
export function init_character_list_interactions() {
    socket.on('cell-characters', data => { update_characters_list(data); });
    elementById("attack_selected_character").onclick = attack_selected_character;
    elementById("support_selected_character").onclick = support_selected_character;
    elementById("rob_selected_character").onclick = rob_selected_charater;
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
const columns = [
    {
        header_text: "Name",
        type: "string",
        value: (item) => item.name,
        custom_style: ["flex-3"]
    },
    {
        header_text: "Race",
        type: "string",
        value: (item) => item.race,
        custom_style: ["flex-2"]
    },
    {
        header_text: "",
        type: "string",
        value: (item) => item.robbed ? "x" : "o",
        custom_style: ["flex-0-0-30px"]
    }
];
const character_list = new List(elementById('characters_list'));
character_list.columns = columns;
character_list.onclick = (item, line) => {
    select_character(item.id);
};
character_list.per_line_class_by_item = (item) => {
    let result = ["generic-button", 'ListCharacterId_' + item.id];
    if (item.dead) {
        result.push("text-red");
    }
    return result;
};
export function update_characters_list(data) {
    character_list.data = data;
}
function select_character(id) {
    if (globals.selected_character != undefined) {
        let character_div = select('.ListCharacterId_' + globals.selected_character);
        for (const item of character_div) {
            item.classList.remove('selected');
        }
    }
    globals.selected_character = id;
    let character_div = selectOne('.ListCharacterId_' + id);
    character_div.classList.add('selected');
}
