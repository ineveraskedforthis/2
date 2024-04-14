"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_crafts_bulk_list = exports.new_craft_bulk = exports.output_bulk = exports.produce_output = exports.event_craft_bulk = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const generate_action_1 = require("./generate_action");
const crafts_storage_1 = require("./crafts_storage");
const helpers_1 = require("./helpers");
const events_1 = require("../events/events");
const system_1 = require("../character/system");
const content_1 = require("../../.././../game_content/src/content");
function event_craft_bulk(character, craft) {
    (0, helpers_1.use_input)(craft.input, character);
    produce_output(output_bulk(character, craft), character);
    (0, helpers_1.on_craft_update)(character, craft.difficulty);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
}
exports.event_craft_bulk = event_craft_bulk;
function produce_output(output, character) {
    for (let item of output) {
        events_1.Event.change_stash(character, item.material, item.amount);
    }
}
exports.produce_output = produce_output;
function output_bulk(character, craft) {
    let result = [];
    //calculating skill output
    // min is 0
    // max is 10
    // choose minimum across all skills
    let ratio = helpers_1.MAX_SKILL_MULTIPLIER_BULK;
    for (let check of craft.difficulty) {
        const skill = system_1.CharacterSystem.skill(character, check.skill);
        ratio = Math.min((0, helpers_1.skill_to_ratio)(skill, check.difficulty), ratio);
    }
    for (let item of craft.output) {
        const material = content_1.MaterialStorage.get(item.material);
        //calculate bonus from perks
        let bonus = 0;
        if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */) {
            if (character._perks.meat_master)
                bonus += 1;
        }
        if (material.magic_power > 0) {
            if (character._perks.alchemist)
                bonus += 2;
            if (character._perks.mage_initiation)
                bonus += 1;
        }
        if (material.category == 0 /* MATERIAL_CATEGORY.BOW_AMMO */) {
            if (character._perks.fletcher)
                bonus += 5;
        }
        let amount = Math.floor(item.amount * ratio + bonus);
        if (character.race == 'rat')
            amount = 0;
        result.push({ material: item.material, amount: amount });
    }
    return result;
}
exports.output_bulk = output_bulk;
function new_craft_bulk(id, input, output, difficulty) {
    crafts_storage_1.crafts_bulk[id] = {
        id: id,
        input: input,
        output: output,
        difficulty: difficulty,
    };
    crafts_storage_1.craft_actions[id] = (0, generate_action_1.generate_bulk_craft_action)(crafts_storage_1.crafts_bulk[id]);
    return crafts_storage_1.crafts_bulk[id];
}
exports.new_craft_bulk = new_craft_bulk;
function get_crafts_bulk_list(character) {
    let list = [];
    for (let item of Object.values(crafts_storage_1.crafts_bulk)) {
        list.push(item);
    }
    return list;
}
exports.get_crafts_bulk_list = get_crafts_bulk_list;

