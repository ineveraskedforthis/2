"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.character_to_craft_spear_probability = exports.craft_spear_probability = exports.craft_spear = void 0;
const item_tags_1 = require("../../static_data/item_tags");
const market_items_1 = require("../../market/market_items");
const materials_manager_1 = require("../../manager_classes/materials_manager");
exports.craft_spear = {
    duration(char) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.woodwork.practice) / 20;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.WOOD);
            if (tmp > 2) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let tmp = char.stash.get(materials_manager_1.WOOD);
        if (tmp > 2) {
            char.changed = true;
            let skill = char.skills.woodwork.practice;
            char.stash.inc(materials_manager_1.WOOD, -3);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let dice = Math.random();
            if (dice < craft_spear_probability(skill)) {
                let spear = new item_tags_1.Weapon(char.world.spear_argument);
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
                    char.skills.woodwork.practice += 1;
                    char.send_skills_update();
                    char.changed = true;
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed');
                return 4 /* CharacterActionResponce.FAILED */;
            }
        }
    },
    start: async function (pool, char, data) {
    },
};
function craft_spear_probability(skill) {
    if ((0, market_items_1.nodb_mode_check)())
        return 1;
    return Math.min(skill / 30, 1);
}
exports.craft_spear_probability = craft_spear_probability;
function character_to_craft_spear_probability(character) {
    let skill = character.skills.woodwork.practice;
    return craft_spear_probability(skill);
}
exports.character_to_craft_spear_probability = character_to_craft_spear_probability;
