"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attack = void 0;
const systems_communication_1 = require("../../../systems_communication");
const system_1 = require("../../../base_game_classes/character/system");
const racial_hostility_1 = require("../../../base_game_classes/character/races/racial_hostility");
exports.attack = {
    duration(char) {
        return 0;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            let targets = cell.get_characters_list();
            let target = undefined;
            for (let id of targets) {
                let target_char = system_1.CharacterSystem.id_to_character(id);
                if ((0, racial_hostility_1.hostile)(char.archetype.race, target_char.archetype.race)) {
                    if (!target_char.in_battle()) {
                        target = target_char;
                    }
                }
            }
            if (target == undefined) {
                return 8 /* CharacterActionResponce.NO_POTENTIAL_ENEMY */;
            }
            else {
                char.action_target = target.id;
                return 1 /* CharacterActionResponce.OK */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let target_char = char.world.get_char_from_id(char.action_target);
        await char.world.create_battle(pool, [char], [target_char]);
    },
    start: function (char, data) {
    },
    immediate: true
};
