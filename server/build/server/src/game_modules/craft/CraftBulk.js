"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_bulk_craft_action = exports.new_craft_bulk = exports.produce_output = exports.event_craft_bulk = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const events_1 = require("../events/events");
const crafts_storage_1 = require("./crafts_storage");
const helpers_1 = require("./helpers");
const generate_action_1 = require("./generate_action");
const generic_functions_1 = require("../actions/generic_functions");
const craft_1 = require("../scripted-values/craft");
function event_craft_bulk(character, craft) {
    (0, helpers_1.use_input)(craft.input, character);
    produce_output(craft_1.CraftValues.output_bulk(character, craft), character);
    (0, helpers_1.on_craft_update)(character, craft.difficulty);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.STASH */);
}
exports.event_craft_bulk = event_craft_bulk;
function produce_output(output, character) {
    for (let item of output) {
        events_1.Event.change_stash(character, item.material, item.amount);
    }
}
exports.produce_output = produce_output;
function new_craft_bulk(id, input, output, difficulty) {
    crafts_storage_1.crafts_bulk[id] = {
        id: id,
        input: input,
        output: output,
        difficulty: difficulty,
    };
    crafts_storage_1.craft_actions[id] = generate_bulk_craft_action(crafts_storage_1.crafts_bulk[id]);
    return crafts_storage_1.crafts_bulk[id];
}
exports.new_craft_bulk = new_craft_bulk;
function generate_bulk_craft_action(craft) {
    return {
        duration: generic_functions_1.dummy_duration,
        check: (0, generate_action_1.generate_check_funtion)(craft.input),
        result(char, cell) {
            if ((0, helpers_1.check_inputs)(craft.input, char.stash)) {
                event_craft_bulk(char, craft);
            }
        },
        start: generic_functions_1.dummy_start
    };
}
exports.generate_bulk_craft_action = generate_bulk_craft_action;
