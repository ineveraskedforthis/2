"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_craft_item_action = exports.new_craft_item = exports.event_craft_item = exports.create_item = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_objects_1 = require("../data/data_objects");
const crafts_storage_1 = require("./crafts_storage");
const helpers_1 = require("./helpers");
const generate_action_1 = require("./generate_action");
const generic_functions_1 = require("../actions/generic_functions");
const craft_1 = require("../scripted-values/craft");
function create_item(model_tag, affixes, durability) {
    if (model_tag.tag == "armour") {
        const result = data_objects_1.Data.Items.create_armour(durability, affixes, model_tag.value);
        result.durability = durability;
        result.durability += Math.round(Math.random() * 10);
        return result;
    }
    let result = data_objects_1.Data.Items.create_weapon(durability, affixes, model_tag.value);
    result.durability = durability;
    result.durability += Math.round(Math.random() * 10);
    return result;
}
exports.create_item = create_item;
function event_craft_item(character, craft) {
    let result = create_item(craft.output, craft.output_affixes.slice(), craft_1.CraftValues.durability(character, craft));
    let response = character.equip.data.backpack.add(result.id);
    if (response !== false)
        (0, helpers_1.use_input)(craft.input, character);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.STASH */);
    (0, helpers_1.on_craft_update)(character, [{ skill_checks: craft.difficulty }]);
}
exports.event_craft_item = event_craft_item;
function new_craft_item(id, input, output, output_affixes, difficulty) {
    if (difficulty.length == 0) {
        console.log('craft ' + id + " is invalid: no difficulty checks");
    }
    crafts_storage_1.crafts_items[id] = {
        id: id,
        input: input,
        output: output,
        output_affixes: output_affixes,
        difficulty: difficulty,
    };
    crafts_storage_1.craft_actions[id] = generate_craft_item_action(crafts_storage_1.crafts_items[id]);
    return crafts_storage_1.crafts_items[id];
}
exports.new_craft_item = new_craft_item;
function generate_craft_item_action(craft) {
    return {
        duration: generic_functions_1.dummy_duration,
        check: (0, generate_action_1.generate_check_funtion)(craft.input),
        result: function (char, cell) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                event_craft_item(char, craft);
            }
        },
        start: generic_functions_1.dummy_start
    };
}
exports.generate_craft_item_action = generate_craft_item_action;
