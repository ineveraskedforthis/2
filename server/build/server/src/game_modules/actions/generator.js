"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_action = void 0;
const generic_functions_1 = require("./generic_functions");
const effects_1 = require("../events/effects");
function generate_action(fatigue_cost, duration_modifer, trigger, effect, start_effect, associated_reason) {
    return {
        duration(character) {
            return (1 + character.get_fatigue() / 50) * duration_modifer(character);
        },
        check: function (character, cell) {
            let basic_check = (0, generic_functions_1.basic_trigger)(character);
            if (basic_check.response == 'OK') {
                return trigger(character, cell);
            }
            return basic_check;
        },
        result: function (character, cell) {
            if (this.check(character, cell).response == 'OK') {
                effects_1.Effect.Change.fatigue(character, fatigue_cost, associated_reason);
                effect(character, cell);
            }
        },
        start: function (character, cell) {
            start_effect(character, cell);
        },
    };
}
exports.generate_action = generate_action;
