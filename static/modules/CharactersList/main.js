import { select, selectHTMLs } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { socket } from "../Socket/socket.js";
import { List } from "../../widgets/List/list.js";
import { update_local_npc_images } from "../CharacterImage/main.js";
export function init_character_list_interactions() {
    socket.on('cell-characters', data => { update_characters_list(data); });
    for (const item of selectHTMLs('.attack-selected')) {
        item.onclick = attack_selected_character;
    }
    for (const item of selectHTMLs('.support-selected')) {
        item.onclick = support_selected_character;
    }
    for (const item of selectHTMLs('.rob-selected')) {
        item.onclick = rob_selected_charater;
    }
}
function attack_character(id) {
    return () => socket.emit('attack-character', id);
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
const columns_mini = [
    {
        header_text: "Name",
        type: "string",
        value: (item) => item.name,
        custom_style: ["flex-3"]
    },
    {
        header_text: "",
        type: "string",
        onclick: (item) => attack_character(item.id),
        value: (item) => "Attack",
        custom_style: ["flex-2"]
    },
    {
        header_text: "",
        type: "string",
        value: (item) => item.robbed ? "x" : "o",
        custom_style: ["flex-0-0-30px"]
    }
];
const lists = [];
for (const container of selectHTMLs(".characters-display-mini")) {
    const character_list = new List(container);
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
    lists.push(character_list);
}
export function update_characters_list(data) {
    for (const item of lists) {
        item.data = data;
    }
    update_local_npc_images(data);
}
function select_character(id) {
    if (globals.selected_character != undefined) {
        let character_div = select('.ListCharacterId_' + globals.selected_character);
        for (const item of character_div) {
            item.classList.remove('selected');
        }
    }
    globals.selected_character = id;
    let character_div = select('.ListCharacterId_' + id);
    for (const item of character_div) {
        item.classList.add('selected');
    }
}
