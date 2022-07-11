"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.character_to_craft_rat_pants_probability = exports.craft_rat_pants_probability = exports.craft_rat_pants = void 0;
const item_tags_1 = require("../../static_data/item_tags");
const market_items_1 = require("../../market/market_items");
const materials_manager_1 = require("../../manager_classes/materials_manager");
const items_set_up_1 = require("../../static_data/items_set_up");
exports.craft_rat_pants = {
    duration(char) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier.practice) / 20;
    },
    check: async function (pool, char, data) {
        if (!char.in_battle()) {
            let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
            if (tmp >= 4) {
                return 1 /* CharacterActionResponce.OK */;
            }
            return 3 /* CharacterActionResponce.NO_RESOURCE */;
        }
        return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: async function (pool, char, data) {
        let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
        if (tmp >= 4) {
            char.changed = true;
            let skill = char.skills.clothier.practice;
            char.stash.inc(materials_manager_1.RAT_SKIN, -4);
            char.send_stash_update();
            char.change_fatigue(10);
            // if (dice < check) {
            let dice = Math.random();
            if (dice < craft_rat_pants_probability(skill)) {
                let armour = new item_tags_1.Armour(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT);
                char.equip.add_armour(armour);
                char.world.socket_manager.send_to_character_user(char, 'alert', 'pants are made');
                char.send_stash_update();
                char.send_equip_update();
                char.send_status_update();
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                char.change_stress(1);
                if (skill < 20) {
                    char.skills.clothier.practice += 1;
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
function craft_rat_pants_probability(skill) {
    if ((0, market_items_1.nodb_mode_check)())
        return 1;
    return Math.min(skill / 30, 1);
}
exports.craft_rat_pants_probability = craft_rat_pants_probability;
function character_to_craft_rat_pants_probability(character) {
    let skill = character.skills.clothier.practice;
    return craft_rat_pants_probability(skill);
}
exports.character_to_craft_rat_pants_probability = character_to_craft_rat_pants_probability;
