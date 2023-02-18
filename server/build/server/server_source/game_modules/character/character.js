"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
const stash_1 = require("../inventories/stash");
const character_parts_1 = require("./character_parts");
const skills_1 = require("./skills");
const equip_1 = require("../inventories/equip");
const savings_1 = require("../inventories/savings");
class Character {
    constructor(id, battle_id, battle_unit_id, user_id, cell_id, name, archetype, stats, max_hp) {
        this.id = id;
        this.battle_id = battle_id;
        this.battle_unit_id = battle_unit_id;
        this.user_id = user_id;
        this.cell_id = cell_id;
        this.next_cell = [0, 0];
        this.name = name;
        this.archetype = archetype;
        this.equip = new equip_1.Equip();
        this.stash = new stash_1.Stash();
        this.trade_stash = new stash_1.Stash();
        this.savings = new savings_1.Savings();
        this.trade_savings = new savings_1.Savings();
        this.status = new character_parts_1.Status();
        this.status.blood = 0;
        this.status.fatigue = 0;
        this.status.rage = 0;
        this.status.hp = max_hp;
        this.status.stress = 0;
        this.cleared = false;
        this.action_progress = 0;
        this.action_duration = 0;
        this.skills = new skills_1.SkillList();
        this.perks = {};
        this.stats = new character_parts_1.InnateStats(stats.movement_speed, stats.phys_power, stats.magic_power, max_hp);
        this.explored = [];
    }
    set_model_variation(data) {
        this.model_variation = data;
    }
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
    change_fatigue(x) {
        return this.change('fatigue', x);
    }
    change_stress(x) {
        return this.change('stress', x);
    }
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
    in_battle() { return (this.battle_id != -1); }
}
exports.Character = Character;
