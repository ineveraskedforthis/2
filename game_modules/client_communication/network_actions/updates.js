"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUpdate = void 0;
const battle_calcs_1 = require("../../base_game_classes/battle/battle_calcs");
const craft_1 = require("../../base_game_classes/character/craft");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
var SendUpdate;
(function (SendUpdate) {
    function all(user) {
        savings(user);
        status(user);
        stash(user);
        equip(user);
        all_skills(user);
        all_craft(user);
    }
    SendUpdate.all = all;
    function savings(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'savings', character.savings.get());
        alerts_1.Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get());
    }
    SendUpdate.savings = savings;
    function status(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'status', { c: character.status, m: character.stats.max });
    }
    SendUpdate.status = status;
    function stash(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'stash-update', character.stash.data);
    }
    SendUpdate.stash = stash;
    function equip(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'equip-update', character.equip.get_data());
    }
    SendUpdate.equip = equip;
    function skill_clothier(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'clothier', character.skills.clothier);
        let value = craft_1.CraftProbability.from_rat_skin(character);
        alerts_1.Alerts.craft(user, 'craft_rat_pants', value);
        alerts_1.Alerts.craft(user, 'craft_rat_armour', value);
        alerts_1.Alerts.craft(user, 'craft_rat_gloves', value);
        alerts_1.Alerts.craft(user, 'craft_rat_helmet', value);
        alerts_1.Alerts.craft(user, 'craft_rat_boots', value);
    }
    SendUpdate.skill_clothier = skill_clothier;
    function skill_cooking(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'cooking', character.skills.cooking);
    }
    SendUpdate.skill_cooking = skill_cooking;
    function skill_woodwork(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'woodwork', character.skills.woodwork);
    }
    SendUpdate.skill_woodwork = skill_woodwork;
    function all_skills(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let i in character.skills) {
            alerts_1.Alerts.skill(user, i, character.skills[i]);
        }
    }
    SendUpdate.all_skills = all_skills;
    function all_craft(user) {
        cooking_craft(user);
        woodwork_craft(user);
    }
    SendUpdate.all_craft = all_craft;
    function cooking_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.craft(user, 'cook_elodin', craft_1.CraftProbability.elo_to_food(character));
        alerts_1.Alerts.craft(user, 'cook_meat', craft_1.CraftProbability.meat_to_food(character));
    }
    SendUpdate.cooking_craft = cooking_craft;
    function woodwork_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let value = craft_1.CraftProbability.basic_wood(character);
        alerts_1.Alerts.craft(user, 'craft_spear', value);
        alerts_1.Alerts.craft(user, 'craft_bone_spear', value);
        alerts_1.Alerts.craft(user, 'craft_wood_bow', value);
        alerts_1.Alerts.craft(user, 'craft_bone_arrow', craft_1.CraftProbability.arrow(character));
    }
    SendUpdate.woodwork_craft = woodwork_craft;
    function ranged(user, distance) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        if (isNaN(distance)) {
            return;
        }
        alerts_1.Alerts.battle_action(user, 'shoot', battle_calcs_1.Accuracy.ranged(character, distance));
    }
    SendUpdate.ranged = ranged;
    function hp(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'hp', { c: character.status.hp, m: character.stats.max.hp });
    }
    SendUpdate.hp = hp;
})(SendUpdate = exports.SendUpdate || (exports.SendUpdate = {}));
// send_map_pos_info(character: Character, teleport_flag:boolean) {
//     let cell_id = character.cell_id;
//     let pos = this.world.get_cell_x_y_by_id(cell_id);
//     let data = {x:pos.x,y:pos.y,teleport_flag:teleport_flag}
//     this.send_to_character_user(character, 'map-pos', data)
// }
// send_skills_info(character: Character) {
//     
//     this.send_to_character_user(character, 'cell-action-chance', {tag: 'hunt', value: character_to_hunt_probability(character)})
//     this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
//     this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
//     this.send_perk_related_skills_update(character)
// }
//     send_perk_related_skills_update(character: Character) {
//     this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
//     this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
//     this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})
//     this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
//     this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
//     this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
//     this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
// }
