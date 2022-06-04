"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attack = void 0;
exports.attack = {
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return 6 /* INVALID_CELL */;
            }
            let targets = cell.get_characters_list();
            let target = undefined;
            for (let id of targets) {
                let target_char = char.world.get_char_from_id(id);
                if ((target_char.get_tag() == 'test') && (char.get_tag() == 'rat') || (target_char.get_tag() == 'rat') && (char.get_tag() == 'test')) {
                    if (!target_char.in_battle() && Math.random() > 0.8) {
                        target = target_char;
                    }
                }
            }
            if (target == undefined) {
                return 3 /* NO_RESOURCE */;
            }
            else {
                char.action_target = target.id;
                return 1 /* OK */;
            }
        }
        else
            return 2 /* IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let target_char = char.world.get_char_from_id(char.action_target);
        await char.world.create_battle(pool, [char], [target_char]);
    },
    start: async function (pool, char, data) {
    },
    immediate: true
};
