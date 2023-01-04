"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.new_craft_item = exports.event_craft_item = exports.create_item = exports.durability = void 0;
const basic_functions_1 = require("../calculations/basic_functions");
const user_manager_1 = require("../client_communication/user_manager");
const system_1 = require("../items/system");
const materials_manager_1 = require("../manager_classes/materials_manager");
const crafts_storage_1 = require("./crafts_storage");
const helpers_1 = require("./helpers");
const generate_action_1 = require("./generate_action");
function base_durability(skill, difficulty) {
    const base = Math.round(skill / difficulty * 100);
    return (0, basic_functions_1.trim)(base, 5, 150);
}
function bonus_durability(character, craft) {
    let durability = 0;
    let skin_flag = false;
    let bone_flag = false;
    let flesh_flag = false;
    for (let item of craft.input) {
        if (item.material == materials_manager_1.RAT_SKIN)
            skin_flag = true;
        if (item.material == materials_manager_1.RAT_BONE)
            bone_flag = true;
        if (item.material == materials_manager_1.MEAT)
            flesh_flag = true;
        if (item.material == materials_manager_1.ELODINO_FLESH)
            flesh_flag = true;
    }
    const template = craft.output;
    if (template.slot == 'weapon') {
        if (character.perks.weapon_maker)
            durability += 10;
    }
    else {
        if (character.perks.skin_armour_master && skin_flag)
            durability += 10;
        if (character.perks.shoemaker && (template.slot == 'foot')) {
            durability += 10;
        }
    }
    return durability;
}
function durability(character, craft) {
    // calculate base durability as average
    let durability = 0;
    for (let item of craft.difficulty) {
        durability += base_durability(character.skills[item.skill], item.difficulty);
    }
    durability = durability / craft.difficulty.length;
    return Math.floor(durability + bonus_durability(character, craft));
}
exports.durability = durability;
function create_item(template, durability) {
    let result = system_1.ItemSystem.create(template);
    // introduce some luck
    result.durability = durability;
    result.durability += Math.round(Math.random() * 10);
    return result;
}
exports.create_item = create_item;
function event_craft_item(character, craft) {
    (0, helpers_1.use_input)(craft.input, character);
    let result = create_item(craft.output, durability(character, craft));
    character.equip.data.backpack.add(result);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
    (0, helpers_1.on_craft_update)(character, craft.difficulty);
}
exports.event_craft_item = event_craft_item;
function new_craft_item(id, input, output, difficulty) {
    crafts_storage_1.crafts_items[id] = {
        id: id,
        input: input,
        output: output,
        difficulty: difficulty,
    };
    crafts_storage_1.craft_actions[id] = (0, generate_action_1.generate_craft_item_action)(crafts_storage_1.crafts_items[id]);
    return crafts_storage_1.crafts_items[id];
}
exports.new_craft_item = new_craft_item;
