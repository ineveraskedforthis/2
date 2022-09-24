"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_rat_boots = exports.craft_rat_helmet = exports.craft_rat_pants = exports.craft_rat_gloves = exports.craft_rat_armour = exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = void 0;
const item_tags_1 = require("../../static_data/item_tags");
const materials_manager_1 = require("../../manager_classes/materials_manager");
const items_set_up_1 = require("../items/items_set_up");
function generate_rat_skin_craft(arg, cost) {
    return {
        duration(char) {
            return 0.5;
            return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier.practice) / 20;
        },
        check: async function (pool, char, data) {
            if (!char.in_battle()) {
                let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
                if (tmp >= cost) {
                    return 1 /* CharacterActionResponce.OK */;
                }
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        },
        result: async function (pool, char, data) {
            let tmp = char.stash.get(materials_manager_1.RAT_SKIN);
            if (tmp >= cost) {
                char.changed = true;
                let skill = char.skills.clothier.practice;
                char.stash.inc(materials_manager_1.RAT_SKIN, -cost);
                char.send_stash_update();
                char.change_fatigue(10);
                // if (dice < check) {
                let dice = Math.random();
                if (dice < craft_rat_armour_probability(skill, char.skills.perks.skin_armour_master == true)) {
                    let armour = new item_tags_1.Armour(arg);
                    char.equip.add_armour(armour);
                    char.world.socket_manager.send_to_character_user(char, 'alert', 'finished');
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
}
exports.RAT_SKIN_ARMOUR_SKIN_NEEDED = 10;
exports.craft_rat_armour = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT, exports.RAT_SKIN_ARMOUR_SKIN_NEEDED);
exports.craft_rat_gloves = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_GLOVES_ARGUMENT, 5);
exports.craft_rat_pants = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT, 8);
exports.craft_rat_helmet = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_HELMET_ARGUMENT, 5);
exports.craft_rat_boots = generate_rat_skin_craft(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT, 5);
