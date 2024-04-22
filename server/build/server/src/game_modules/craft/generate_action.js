"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_check_funtion = void 0;
const content_1 = require("../../.././../game_content/src/content");
const character_1 = require("../data/entities/character");
const helpers_1 = require("./helpers");
function generate_check_funtion(inputs) {
    return (char, cell) => {
        if (char.in_battle())
            return character_1.NotificationResponse.InBattle;
        if ((0, helpers_1.check_inputs)(inputs, char.stash)) {
            return { response: 'OK' };
        }
        return { response: "Not enough resources", value: inputs.map((value) => {
                return {
                    required_amount: value.amount,
                    required_thing: content_1.MaterialStorage.get(value.material).name
                };
            }) };
    };
}
exports.generate_check_funtion = generate_check_funtion;

