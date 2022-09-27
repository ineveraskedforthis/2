"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attack = void 0;
exports.attack = {
    duration(char) {
        return 0;
    },
    check:  function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            let targets = cell.get_characters_set();
            let target = undefined;
            for (let id of targets) {
                let target_char = char.world.get_char_from_id(id);
                if ((target_char.get_tag() == 'test') && (char.get_tag() == 'rat') || (target_char.get_tag() == 'rat') && (char.get_tag() == 'test')) {
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
    result:  function (pool, char, data) {
        let target_char = char.world.get_char_from_id(char.action_target);
        await char.world.create_battle(pool, [char], [target_char]);
    },
    start:  function (pool, char, data) {
    },
    immediate: true
};
