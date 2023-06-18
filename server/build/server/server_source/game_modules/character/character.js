"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
const stash_1 = require("../inventories/stash");
// import { PerksTable } from "./Perks";
const equip_1 = require("../inventories/equip");
const savings_1 = require("../inventories/savings");
const types_1 = require("../types");
const SkillList_1 = require("./SkillList");
class Character {
    constructor(id, battle_id, battle_unit_id, user_id, cell_id, name, archetype, stats, max_hp) {
        this.id = id;
        this.battle_id = battle_id;
        this.battle_unit_id = battle_unit_id;
        this.user_id = user_id;
        this.cell_id = cell_id;
        this.next_cell = 0;
        this.name = name;
        this.archetype = Object.assign({}, archetype);
        this.current_building = undefined;
        this.equip = new equip_1.Equip();
        this.stash = new stash_1.Stash();
        this.trade_stash = new stash_1.Stash();
        this.savings = new savings_1.Savings();
        this.trade_savings = new savings_1.Savings();
        this.status = new types_1.Status();
        this.status.blood = 0;
        this.status.fatigue = 0;
        this.status.rage = 0;
        this.status.hp = max_hp;
        this.status.stress = 0;
        this.cleared = false;
        this.action_progress = 0;
        this.action_duration = 0;
        this.ai_state = 0 /* AIstate.Idle */;
        this.ai_price_belief_buy = new Map();
        this.ai_price_belief_sell = new Map();
        this._skills = new SkillList_1.SkillList();
        this.perks = {};
        this.stats = new types_1.InnateStats(stats.movement_speed, stats.phys_power, stats.magic_power, max_hp);
        this.explored = [];
    }
    set_model_variation(data) {
        this.model_variation = data;
    }
    /**
     * Changes the status of a given type by a specified amount and returns a boolean indicating success.
     *
     * @param {status_type} type - the type of status to change
     * @param {number} x - the amount to change the status by
     * @return {boolean} true if the status was successfully changed, false if the new value is the same as the old value
     */
    change(type, x) {
        let tmp = this.status[type];
        let new_status = tmp + x;
        new_status = Math.min(this.stats.max[type], new_status);
        new_status = Math.max(new_status, 0);
        return this.set(type, new_status);
    }
    change_hp(x) {
        return this.change('hp', x);
    }
    change_rage(x) {
        return this.change('rage', x);
    }
    change_blood(x) {
        return this.change('blood', x);
    }
    /**
     * Changes the fatigue level by the given amount.
     *
     * @param {number} x - The amount to change the fatigue level by.
     * @return {boolean} - False if fatigue was not changed, true if it was.
     */
    change_fatigue(x) {
        return this.change('fatigue', x);
    }
    /**
     * Changes the stress level by the given amount.
     *
     * @param {number} x - The amount to change the stress level by.
     * @return {boolean} - False if stress was not changed, true if it was.
     */
    change_stress(x) {
        return this.change('stress', x);
    }
    /**
    * Sets the value of a status type to a given number.
    *
    * @param {status_type} type - The type of status to set.
    * @param {number} x - The value to set the status to.
    * @return {boolean} Returns true if the value was set successfully, false if the value had not changed.
    */
    set(type, x) {
        if (this.status[type] == x)
            return false;
        this.status[type] = x;
        return true;
    }
    set_fatigue(x) {
        return this.set('fatigue', x);
    }
    set_status(dstatus) {
        this.status.blood = dstatus.blood;
        this.status.rage = dstatus.rage;
        this.status.stress = dstatus.stress;
        this.status.hp = dstatus.hp;
        this.status.fatigue = dstatus.fatigue;
    }
    change_status(dstatus) {
        this.change_hp(dstatus.hp);
        this.change_rage(dstatus.rage);
        this.change_stress(dstatus.stress);
        this.change_blood(dstatus.blood);
        this.change_fatigue(dstatus.fatigue);
    }
    get_hp() {
        return this.status.hp;
    }
    get_max_hp() {
        return this.stats.max.hp;
    }
    get_blood() {
        return this.status.blood;
    }
    get_rage() {
        return this.status.rage;
    }
    get_fatigue() {
        return this.status.fatigue;
    }
    get_stress() {
        return this.status.stress;
    }
    range() {
        let result = this.equip.get_weapon_range();
        if (result != undefined) {
            let weapon = this.equip.data.weapon;
            if (weapon?.weapon_tag == 'polearms') {
                if (this.perks.advanced_polearm) {
                    result += 0.5;
                }
            }
            return result;
        }
        if (this.archetype.race == 'graci')
            return 2;
        if (this.archetype.model == 'bigrat')
            return 1;
        if (this.archetype.model == 'elo')
            return 1;
        return 0.5;
    }
    model() { return this.archetype.model; }
    race() { return this.archetype.race; }
    ai_map() { return this.archetype.ai_map; }
    is_player() { return this.user_id != '#'; }
    dead() { return this.get_hp() == 0; }
    in_battle() { return (this.battle_id != undefined); }
}
exports.Character = Character;
