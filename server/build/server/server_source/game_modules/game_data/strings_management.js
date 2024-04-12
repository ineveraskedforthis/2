"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventory_from_string = exports.inventory_to_string = exports.equip_from_string = exports.equip_to_string = exports.string_to_character = exports.character_to_string = exports.item_from_string = exports.item_to_string = void 0;
const item_1 = require("../items/item");
const character_1 = require("../character/character");
function item_to_string(item) {
    return (JSON.stringify(item));
}
exports.item_to_string = item_to_string;
function item_from_string(s) {
    const item_data = JSON.parse(s);
    // let damage = DmgOps.copy(item_data.damage);
    // let resistance = DmgOps.copy(item_data.resists);
    return new item_1.Item(item_data.durability, item_data.affixes, item_data.model_tag);
}
exports.item_from_string = item_from_string;
function character_to_string(character) {
    return JSON.stringify(character);
}
exports.character_to_string = character_to_string;
function string_to_character(s) {
    const data = JSON.parse(s);
    const template = {
        model: data.model,
        ai_map: data.ai_map,
        ai_battle: data.ai_battle,
        race: data.race,
        stats: data.stats,
        resists: data.resists,
        name_generator: (() => { return data.get_name(); }),
        max_hp: data.max_hp
    };
    const character = new character_1.Character(data.id, data.battle_id, data.battle_unit, data.user_id, data.location_id, data.name, template);
    character.explored = data.explored;
    character.equip.load_from_json(data.equip);
    character.home_location_id = data.home_location_id;
    // equip_from_string(data.equip.data, character.equip)
    character.stash.load_from_json(data.stash.data);
    character.trade_stash.load_from_json(data.trade_stash.data);
    character.savings.inc(data.savings.data);
    character.trade_savings.inc(data.trade_savings.data);
    character.set_status(data.status);
    character._skills = data._skills;
    character._perks = data._perks;
    character._traits = data._traits;
    return character;
}
exports.string_to_character = string_to_character;
function equip_to_string(equip) {
    return JSON.stringify(equip);
}
exports.equip_to_string = equip_to_string;
function equip_from_string(s, equip) {
    equip.load_from_json(JSON.parse(s));
    return equip;
}
exports.equip_from_string = equip_from_string;
function inventory_to_string(inventory) {
    // const array:string[] = []
    // for (let i of inventory.items) {
    //     if (i != undefined) {
    //         array.push(item_to_string(i))
    //     }
    // }
    // return JSON.stringify({items_array: array})
    return JSON.stringify(inventory);
}
exports.inventory_to_string = inventory_to_string;
function inventory_from_string(inventory, s) {
    // const data:{items_array: string[]} = JSON.parse(s)
    // for (let i = 0; i <= 100; i++) {
    //     const tmp = data.items_array[i]
    //     if (tmp == undefined) return
    //     inventory.items.push(item_from_string(tmp))
    // }
    inventory.load_from_json(JSON.parse(s));
    return inventory;
}
exports.inventory_from_string = inventory_from_string;
