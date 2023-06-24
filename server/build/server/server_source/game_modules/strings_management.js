"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.building_from_string = exports.building_to_string = exports.inventory_from_string = exports.inventory_to_string = exports.string_to_character = exports.character_to_string = exports.item_from_string = exports.item_to_string = void 0;
const item_1 = require("./items/item");
const damage_types_1 = require("./damage_types");
const character_1 = require("./character/character");
const SkillList_1 = require("./character/SkillList");
function item_to_string(item) {
    return (JSON.stringify(item));
}
exports.item_to_string = item_to_string;
function item_from_string(s) {
    const item_data = JSON.parse(s);
    let damage = damage_types_1.DmgOps.copy(item_data.damage);
    let resistance = damage_types_1.DmgOps.copy(item_data.resists);
    return new item_1.Item(item_data.durability, item_data.affixes, item_data.slot, item_data.range, item_data.material, item_data.weapon_tag, item_data.model_tag, resistance, damage);
}
exports.item_from_string = item_from_string;
function character_to_string(c) {
    let ids = [c.id, c.battle_id, c.battle_unit_id, c.user_id, c.cell_id].join('&');
    let name = c.name;
    let archetype = JSON.stringify(c.archetype);
    let equip = c.equip.to_string();
    let stash = JSON.stringify(c.stash.get_json());
    let trade_stash = JSON.stringify(c.trade_stash.get_json());
    let savings = c.savings.get();
    let trade_savings = c.trade_savings.get();
    let status = JSON.stringify(c.status);
    let skills = JSON.stringify(c._skills);
    let perks = JSON.stringify(c._perks);
    let traits = JSON.stringify(c._traits);
    let innate_stats = JSON.stringify(c.stats);
    let explored = JSON.stringify({ data: c.explored });
    return [ids, name, archetype, equip, stash, trade_stash, savings, trade_savings, status, skills, perks, traits, innate_stats, explored].join(';');
}
exports.character_to_string = character_to_string;
function string_to_character(s) {
    const [ids, name, raw_archetype, raw_equip, raw_stash, raw_trade_stash, raw_savings, raw_trade_savings, raw_status, raw_skills, raw_perks, raw_traits, raw_innate_stats, raw_explored] = s.split(';');
    let [raw_id, raw_battle_id, raw_battle_unit_id, raw_user_id, raw_cell_id] = ids.split('&');
    if (raw_user_id != '#') {
        var user_id = Number(raw_user_id);
    }
    else {
        var user_id = '#';
    }
    const innate_stats = JSON.parse(raw_innate_stats);
    const stats = innate_stats.stats;
    const character = new character_1.Character(Number(raw_id), Number(raw_battle_id), Number(raw_battle_unit_id), user_id, Number(raw_cell_id), name, JSON.parse(raw_archetype), stats, innate_stats.max.hp);
    character.stats = innate_stats;
    character.explored = JSON.parse(raw_explored).data;
    character.equip.from_string(raw_equip);
    character.stash.load_from_json(JSON.parse(raw_stash));
    character.trade_stash.load_from_json(JSON.parse(raw_trade_stash));
    character.savings.inc(Number(raw_savings));
    character.trade_savings.inc(Number(raw_trade_savings));
    character.set_status(JSON.parse(raw_status));
    character._skills = new SkillList_1.SkillList();
    for (let [_, item] of Object.entries(JSON.parse(raw_skills))) {
        character._skills[_] = item;
    }
    character._perks = JSON.parse(raw_perks);
    character._traits = JSON.parse(raw_traits);
    return character;
}
exports.string_to_character = string_to_character;
function inventory_to_string(inventory) {
    const array = [];
    for (let i of inventory.items) {
        if (i != undefined) {
            array.push(item_to_string(i));
        }
    }
    return JSON.stringify({ items_array: array });
}
exports.inventory_to_string = inventory_to_string;
function inventory_from_string(inventory, s) {
    const data = JSON.parse(s);
    for (let i = 0; i <= 100; i++) {
        const tmp = data.items_array[i];
        if (tmp == undefined)
            return;
        inventory.items.push(item_from_string(tmp));
    }
}
exports.inventory_from_string = inventory_from_string;
function building_to_string(building) {
    return JSON.stringify(building);
}
exports.building_to_string = building_to_string;
function building_from_string(s) {
    return JSON.parse(s);
}
exports.building_from_string = building_from_string;
