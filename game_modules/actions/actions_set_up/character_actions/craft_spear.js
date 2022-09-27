"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.character_to_craft_spear_probability = exports.craft_spear_probability = exports.craft_spear = void 0;
const user_manager_1 = require("../../../client_communication/user_manager");
const materials_manager_1 = require("../../../manager_classes/materials_manager");
exports.craft_spear = {
    duration(char) {
        return 0.5;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            if (tmp > 2) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if (tmp > 2) {
            let skill = char.skills.woodwork;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.change('fatigue', 10);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 4 /* UI_Part.STASH */);
            user_manager_1.UserManagement.add_user_to_update_queue(char.user_id, 1 /* UI_Part.STATUS */);
            // if (dice < check) {
            let dice = Math.random();
            if (dice < craft_spear_probability(skill)) {
                let spear = new Weapon(SPEAR_ARGUMENT);
                char.equip.add_weapon(spear);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'spear is made');
                char.send_stash_update();
                char.send_equip_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.woodwork += 1;
                    char.send_skills_update();
                    char.changed = true;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: function (char, data) {
    },
};
function craft_spear_probability(skill) {
    if (nodb_mode_check())
        return 1;
    return Math.min(skill / 30 + 0.1, 1);
}
exports.craft_spear_probability = craft_spear_probability;
function character_to_craft_spear_probability(character) {
    let skill = character.skills.woodwork;
    return craft_spear_probability(skill);
}
exports.character_to_craft_spear_probability = character_to_craft_spear_probability;
