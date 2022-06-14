"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterGenericPart = exports.Status = void 0;
var common = require("../common.js");
// var {constants} = require("../static_data/constants.js");
const Savings = require("./savings.js");
const spells = require("../static_data/spells.js");
const generate_empty_resists = require("./misc/empty_resists.js");
const character_defines = require("./misc/char_related_constants.js");
const equip_1 = require("../base_game_classes/equip");
const stash_1 = require("./stash");
const attack_result_1 = require("./misc/attack_result");
const damage_types_1 = require("./misc/damage_types");
const constants_1 = require("../static_data/constants");
let dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
class SkillObject {
    constructor() {
        this.practice = 0;
        this.theory = 0;
    }
}
class SkillList {
    constructor() {
        this.clothier = new SkillObject();
        this.cooking = new SkillObject();
        this.onehand = new SkillObject();
        this.polearms = new SkillObject();
        this.noweapon = new SkillObject();
        this.twohanded = new SkillObject();
        this.skinning = new SkillObject();
        this.magic_mastery = new SkillObject();
        this.blocking = new SkillObject();
        this.evasion = new SkillObject();
        this.woodwork = new SkillObject();
        this.hunt = new SkillObject();
        this.perks = {};
    }
}
class Status {
    constructor() {
        this.hp = 0;
        this.rage = 0;
        this.blood = 0;
        this.stress = 0;
        this.fatigue = 0;
    }
}
exports.Status = Status;
class InnateStats {
    constructor() {
        this.max = new Status();
        this.movement_speed = 0;
        this.phys_power = 0;
        this.magic_power = 0;
        this.base_resists = new damage_types_1.DamageByTypeObject();
    }
}
class Misc {
    constructor() {
        this.model = 'empty';
        this.explored = [];
        this.battle_id = -1;
        this.in_battle_id = -1;
        this.tactic = {};
        this.ai_tag = 'dummy';
        this.tag = 'test';
    }
}
class CharacterFlags {
    constructor() {
        this.player = false;
        this.trainer = false;
        this.dead = false;
        this.in_battle = false;
    }
}
class CharacterGenericPart {
    constructor(world) {
        this.world = world;
        this.equip = new equip_1.Equip();
        this.stash = new stash_1.Stash();
        this.trade_stash = new stash_1.Stash();
        this.savings = new Savings();
        this.trade_savings = new Savings();
        this.status = new Status();
        this.status.hp = 100;
        this.skills = new SkillList();
        this.stats = new InnateStats();
        this.stats.max.hp = 100;
        this.stats.max.rage = 100;
        this.stats.max.blood = 100;
        this.stats.max.stress = 100;
        this.stats.max.fatigue = 100;
        this.stats.movement_speed = 1;
        this.stats.phys_power = 10;
        this.stats.magic_power = 10;
        this.misc = new Misc;
        this.misc.model = 'test';
        this.misc.ai_tag = 'dummy';
        this.misc.tactic = { s0: this.world.constants.default_tactic_slot };
        this.flags = new CharacterFlags();
        this.changed = false;
        this.status_changed = false;
        this.deleted = false;
        this.id = -1;
        this.name = 'unknown';
        this.user_id = -1;
        this.cell_id = -1;
        this.faction_id = -1;
        this.action_started = false;
        this.action_progress = 0;
        this.action_duration = 0;
    }
    async init(pool, name, cell_id, user_id = -1) {
        this.init_base_values(name, cell_id, user_id);
        this.id = await this.load_to_db(pool);
        await this.save_to_db(pool);
        return this.id;
    }
    init_base_values(name, cell_id, user_id = -1) {
        this.name = name;
        if (user_id != -1) {
            this.flags.player = true;
        }
        this.user_id = user_id;
        this.cell_id = cell_id;
        let cell = this.get_cell();
        if (cell != undefined) {
            this.misc.explored[cell.id] = true;
            for (let direction of dp) {
                let x = cell.i + direction[0];
                let y = cell.j + direction[1];
                let border_cell = this.world.get_cell(x, y);
                if (border_cell != undefined) {
                    this.misc.explored[border_cell.id] = true;
                }
            }
        }
        this.faction_id = -1;
    }
    async update(pool, dt) {
        await this.status_check(pool);
        if (this.flags.dead) {
            return;
        }
        if (!this.in_battle()) {
            this.out_of_battle_update(dt);
            this.update_action_progress(dt);
            this.update_visited();
        }
        else {
            this.battle_update();
        }
        let cell = this.get_cell();
        if (cell != undefined) {
            cell.visit();
        }
        this.flags_handling_update();
        await this.save_to_db(pool, this.changed || this.stash.changed || this.savings.changed);
        this.changed = false;
    }
    update_action_progress(dt) {
        if (this.action_started) {
            this.action_progress += dt;
        }
        else {
            return;
        }
        if ((this.current_action != undefined) && (this.action_progress >= this.action_duration)) {
            this.world.action_manager.action(this.current_action, this, this.action_target);
        }
    }
    flags_handling_update() {
        let sm = this.world.socket_manager;
        if (this.status_changed) {
            if (this.is_player()) {
                sm.send_status_update(this);
            }
            this.status_changed = false;
            this.changed = true;
        }
        if (this.savings.changed) {
            if (this.is_player()) {
                sm.send_savings_update(this);
            }
            this.savings.changed = false;
            this.changed = true;
        }
        if (this.stash.changed) {
            if (this.is_player()) {
                sm.send_stash_update_to_character(this);
            }
            this.stash.changed = false;
            this.changed = true;
        }
    }
    //some stuff defined per concrete character class
    async status_check(pool) {
        if (this.status.hp <= 0) {
            this.status.hp = 0;
            await this.world.kill(pool, this.id);
        }
        if (this.status.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }
    out_of_battle_update(dt) {
        this.change_rage(-1);
    }
    battle_update() {
        this.change_stress(1);
    }
    async on_move(pool) {
        return undefined;
    }
    get_user() {
        return this.world.user_manager.get_user(this.user_id);
    }
    get_item_lvl() {
        return 1;
    }
    get_tag() {
        return this.misc.tag;
    }
    get_hp() {
        return this.status.hp;
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
    get_hp_change() {
        return 0;
    }
    get_rage_change() {
        if (!this.flags.in_battle) {
            return -1;
        }
        else {
            return 1;
        }
    }
    get_stress_change() {
        let d_stress = (this.get_stress_target() - this.status.stress);
        if (d_stress != 0) {
            if ((d_stress / 30 > 1) || (d_stress / 30 < -1)) {
                return Math.floor(d_stress / 30);
            }
            else {
                return Math.sign(d_stress);
            }
        }
        return 0;
    }
    get_stress_target() {
        return 0;
    }
    get_max_hp() {
        return this.stats.max.hp;
    }
    get_max_rage() {
        return this.stats.max.rage;
    }
    get_max_stress() {
        return this.stats.max.stress;
    }
    get_max_blood() {
        return this.stats.max.blood;
    }
    get_max_fatigue() {
        return this.stats.max.fatigue;
    }
    get_cell() {
        return this.world.get_cell_by_id(this.cell_id);
    }
    get_faction() {
        // if (this.faction_id != -1) {
        //     return this.world.get_faction_from_id(this.faction_id)
        // }
        return undefined;
    }
    change_hp(x) {
        let tmp = this.status.hp;
        this.status.hp = Math.max(0, Math.min(this.get_max_hp(), this.status.hp + x));
        if (this.status.hp != tmp) {
            this.changed = true;
            this.status_changed = true;
            this.send_status_update();
        }
        if (this.get_hp() == 0) {
            this.flags.dead = true;
        }
    }
    change_rage(x) {
        let tmp = this.status.rage;
        this.status.rage = Math.max(0, Math.min(this.get_max_rage(), this.status.rage + x));
        if (tmp != this.status.rage) {
            this.changed = true;
            this.status_changed = true;
            this.send_status_update();
        }
    }
    change_blood(x) {
        let tmp = this.status.blood;
        this.status.blood = Math.max(0, Math.min(this.get_max_blood(), this.status.blood + x));
        if (tmp != this.status.blood) {
            this.changed = true;
            this.status_changed = true;
            this.send_status_update();
        }
    }
    change_stress(x) {
        let tmp = this.status.stress;
        this.status.stress = Math.max(0, Math.min(this.get_max_stress(), this.status.stress + x));
        if (tmp != this.status.stress) {
            this.changed = true;
            this.status_changed = true;
            this.send_status_update();
        }
    }
    change_fatigue(x) {
        let tmp = this.status.fatigue;
        this.status.fatigue = Math.max(0, Math.min(this.get_max_fatigue(), this.status.fatigue + x));
        if (tmp != this.status.fatigue) {
            this.changed = true;
            this.status_changed = true;
            this.send_status_update();
        }
    }
    change_status(dstatus) {
        this.change_hp(dstatus.hp);
        this.change_rage(dstatus.rage);
        this.change_stress(dstatus.stress);
        this.change_blood(dstatus.blood);
    }
    //equip and stash interactions
    equip_armour(index) {
        this.equip.equip_armour(index);
        this.changed = true;
    }
    equip_weapon(index) {
        this.equip.equip_weapon(index);
        this.changed = true;
    }
    unequip_weapon() {
        this.equip.unequip_weapon();
    }
    unequip_armour(tag) {
        this.equip.unequip_armour(tag);
    }
    transfer(target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
    }
    transfer_all(target) {
        for (var i_tag of this.world.get_stash_tags_list()) {
            var x = this.stash.get(i_tag);
            this.transfer(target, i_tag, x);
        }
    }
    transfer_all_inv(target) {
        this.transfer_all(target);
        this.savings.transfer_all(target.savings);
        this.equip.transfer_all(target);
    }
    //market interactions
    buy(tag, amount, money, max_price = null) {
        // let cell = this.get_cell();
        // // if (cell.has_market()) {            
        //     // cell.market.buy(tag, this, amount, money, max_price);
        // }        
    }
    sell(tag, amount, price) {
        // let cell = this.get_cell();
        // if (cell.has_market()) {
        //     // cell.market.sell(tag, this, amount, price);
        // }        
    }
    sell_item(index, buyout_price, starting_price) {
        // let cell = this.get_cell();
        // if (cell.has_market()) {
        //     // cell.item_market.sell(this, index, buyout_price, starting_price);
        // }        
    }
    clear_tag_orders(tag) {
        // let cell = this.get_cell();
        // if (cell.has_market()) {
        //     // cell.market.clear_agent_orders(this, tag)
        // }
    }
    clear_orders() {
        for (var tag of this.world.get_stash_tags_list()) {
            this.clear_tag_orders(tag);
        }
    }
    // network simplification functions
    send_skills_update() {
        if (this.is_player()) {
            this.world.socket_manager.send_skills_info(this);
        }
    }
    send_status_update() {
        if (this.is_player()) {
            this.world.socket_manager.send_status_update(this);
        }
    }
    send_stash_update() {
        if (this.is_player()) {
            this.world.socket_manager.send_stash_update_to_character(this);
        }
    }
    send_equip_update() {
        if (this.is_player()) {
            this.world.socket_manager.send_equip_update_to_character(this);
        }
    }
    send_action_ping(duration) {
        if (this.is_player()) {
            this.world.socket_manager.send_action_ping_to_character(this, duration);
        }
    }
    //rgo
    rgo_check(character) {
        if (this.get_tag() == 'rat') {
            character.stash.inc(this.world.materials.RAT_MEAT, 1);
            if (this.skills.skinning.practice >= 10) {
                character.stash.inc(this.world.materials.RAT_MEAT, 1);
                character.stash.inc(this.world.materials.RAT_SKIN, 1);
            }
            let dice = Math.random();
            if (dice > 0.05 * this.skills.skinning.practice) {
                character.skills.skinning.practice += 1;
            }
            character.send_stash_update();
            character.send_skills_update();
            character.changed = true;
        }
    }
    //attack calculations
    async attack(pool, target) {
        let result = new attack_result_1.AttackResult();
        result = this.equip.get_weapon_damage(result);
        result = this.mod_attack_damage_with_stats(result);
        result = this.roll_accuracy(result);
        result = this.roll_crit(result);
        result = target.roll_evasion(result);
        result = target.roll_block(result);
        let dice = Math.random();
        if (dice > this.skills[result.weapon_type].practice / 50) {
            this.skills[result.weapon_type].practice += 1;
        }
        this.send_skills_update();
        result = await target.take_damage(pool, result);
        this.change_status(result.attacker_status_change);
        if (result.flags.killing_strike) {
            target.transfer_all_inv(this);
            target.rgo_check(this);
        }
        return result;
    }
    async spell_attack(pool, target, tag) {
        let result = new attack_result_1.AttackResult();
        result = spells[tag](result);
        result = this.mod_spell_damage_with_stats(result);
        this.change_status(result.attacker_status_change);
        result = await target.take_damage(pool, result);
        return result;
    }
    async take_damage(pool, result) {
        let res = this.get_resists();
        if (!result.flags.evade && !result.flags.miss) {
            for (let i of damage_types_1.damage_types) {
                if (result.damage[i] > 0) {
                    let curr_damage = Math.max(0, result.damage[i] - res[i]);
                    if ((curr_damage > 0) && ((i == 'slice') || (i == 'pierce'))) {
                        if (this.get_tag() == 'rat' || this.get_tag() == 'test') {
                            result.attacker_status_change.blood += curr_damage;
                        }
                    }
                    result.total_damage += curr_damage;
                    this.change_hp(-curr_damage);
                    if (this.get_hp() == 0) {
                        result.flags.killing_strike = true;
                    }
                }
            }
            this.change_status(result.defender_status_change);
        }
        await this.save_to_db(pool);
        return result;
    }
    mod_attack_damage_with_stats(result) {
        let phys_power = this.get_phys_power() / 10;
        let magic_power = this.get_magic_power() / 10;
        if (this.skills.perks.claws) {
            if (result.weapon_type == 'noweapon') {
                result.damage.pierce += 10;
            }
        }
        result.attacker_status_change.rage = 5;
        result.attacker_status_change.fatigue = 1;
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * phys_power));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * phys_power));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * phys_power));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * magic_power));
        return result;
    }
    mod_spell_damage_with_stats(result) {
        let power = this.get_magic_power() / 10;
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * power));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * power));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * power));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * power));
        return result;
    }
    roll_accuracy(result) {
        let dice = Math.random();
        result.chance_to_hit = this.get_accuracy(result);
        if (dice > result.chance_to_hit) {
            result.flags.miss = true;
        }
        return result;
    }
    roll_crit(result) {
        let dice = Math.random();
        let crit_chance = this.get_crit_chance("attack");
        let mult = this.get_crit_mult();
        if (dice < crit_chance) {
            result.damage['blunt'] = result.damage['blunt'] * mult;
            result.damage['pierce'] = result.damage['pierce'] * mult;
            result.damage['slice'] = result.damage['slice'] * mult;
            result.flags.crit = true;
        }
        return result;
    }
    roll_evasion(result) {
        let dice = Math.random();
        let evade_chance = this.get_evasion_chance();
        if (dice < evade_chance) {
            result.flags.evade = true;
            result.flags.crit = false;
        }
        return result;
    }
    roll_block(result) {
        let dice = Math.random();
        let block_chance = this.get_block_chance();
        if (dice < block_chance) {
            result.flags.blocked = true;
        }
        return result;
    }
    get_magic_power() {
        let power = this.stats.magic_power * this.equip.get_magic_power_modifier();
        return power;
    }
    get_phys_power() {
        let power = this.stats.phys_power * this.equip.get_phys_power_modifier();
        return power;
    }
    get_resists() {
        let res = new damage_types_1.DamageByTypeObject();
        return res.add_object(this.equip.get_resists());
    }
    get_evasion_chance() {
        return character_defines.evasion + this.skills.evasion.practice * 0.01;
    }
    get_accuracy(result) {
        let base_accuracy = character_defines.accuracy + this.skills[result.weapon_type].practice * character_defines.skill_accuracy_modifier;
        let blood_burden = character_defines.blood_accuracy_burden;
        let rage_burden = character_defines.rage_accuracy_burden;
        let blood_acc_loss = this.status.blood * blood_burden;
        let rage_acc_loss = this.status.rage * rage_burden;
        return Math.min(1, Math.max(0.2, base_accuracy - blood_acc_loss - rage_acc_loss));
    }
    get_block_chance() {
        let tmp = character_defines.block + this.skills.blocking.practice * character_defines.skill_blocking_modifier;
        return tmp;
    }
    get_crit_chance(tag) {
        let base_crit_chance = character_defines.crit_chance;
        if (tag == 'attack') {
            return base_crit_chance;
        }
        if (tag == 'spell') {
            return base_crit_chance;
        }
    }
    get_crit_mult() {
        return character_defines.crit_mult;
    }
    // some getters
    get_actions() {
        let tmp = [];
        return tmp;
    }
    get_range() {
        return this.equip.get_weapon_range(1);
    }
    get_model() {
        return this.misc.model;
    }
    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        // return cell.market;
    }
    get_action_points() {
        return 10;
    }
    get_initiative() {
        return 10;
    }
    get_speed() {
        return 5;
    }
    // craft related
    calculate_gained_failed_craft_stress(tag) {
        let total = 10;
        return total;
    }
    get_craft_food_chance() {
        let chance = 0.0;
        chance += this.skills.cooking.practice * 0.05;
        return chance;
    }
    // flag checking functions
    is_player() {
        return this.flags.player;
    }
    in_battle() {
        return this.flags.in_battle;
    }
    is_dead() {
        return this.flags.dead;
    }
    // factions interactions
    set_faction(faction) {
        this.changed = true;
        this.faction_id = faction.id;
    }
    // exploration
    add_explored(tag) {
        // this.misc.explored[tag] = true;
        // this.changed = true
    }
    update_visited() {
        let cell = this.get_cell();
        if (cell != undefined) {
            let visited = [];
            for (let direction of dp) {
                let x = cell.i + direction[0];
                let y = cell.j + direction[1];
                let border_cell = this.world.get_cell(x, y);
                if ((border_cell != undefined) && border_cell.visited_recently) {
                    visited.push({ x: x, y: y });
                }
                if (border_cell != undefined && this.misc.explored[border_cell.id] != true) {
                    this.misc.explored[border_cell.id] = true;
                    let data = this.world.constants.development;
                    let res1 = {};
                    res1[x + '_' + y] = data[x + '_' + y];
                    if (data[x + '_' + y] != undefined) {
                        this.world.socket_manager.send_to_character_user(this, 'map-data-cells', res1);
                    }
                    if (this.world.constants.terrain[x] != undefined && this.world.constants.terrain[x][y] != undefined) {
                        let res2 = { x: x, y: y, ter: this.world.constants.terrain[x][y] };
                        this.world.socket_manager.send_to_character_user(this, 'map-data-terrain', res2);
                    }
                }
            }
            this.world.socket_manager.send_to_character_user(this, 'cell-visited', visited);
        }
    }
    async on_move_default(pool, data) {
        let tmp = this.world.get_territory(data.x, data.y);
        if (tmp == undefined) {
            return 2;
        }
        this.add_explored(this.world.get_id_from_territory(tmp));
        this.world.socket_manager.send_explored(this);
        this.update_visited();
        let res = await this.on_move(pool);
        if (res != undefined) {
            return 2;
        }
        return 1;
    }
    verify_move(dx, dy) {
        return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1));
    }
    set_flag(flag, value) {
        this.flags[flag] = value;
        this.changed = true;
    }
    set_battle_id(x) {
        this.misc.battle_id = x;
        this.changed = true;
    }
    get_battle_id() {
        return this.misc.battle_id;
    }
    set_in_battle_id(x) {
        this.misc.in_battle_id = x;
        this.changed = true;
    }
    get_in_battle_id() {
        return this.misc.in_battle_id;
    }
    get_tactic() {
        return [this.world.constants.default_tactic_slot];
    }
    //db interactions
    async save_status_to_db(pool, save = true) {
        if (save) {
            // await common.send_query(pool, constants.set_status_query, [this.status, this.id]);
        }
    }
    async load_from_json(data) {
        this.id = data.id;
        this.name = data.name;
        this.user_id = data.user_id;
        this.cell_id = data.cell_id;
        this.faction_id = data.faction_id;
        this.status = data.status;
        this.skills = data.skills;
        this.stats = data.stats;
        this.misc = data.misc;
        this.flags = data.flags;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new stash_1.Stash();
        this.stash.load_from_json(data.stash);
        this.equip = new equip_1.Equip();
        this.equip.load_from_json(data.equip);
    }
    get_json() {
        return {
            name: this.name,
            status: this.status,
            skills: this.skills,
            stats: this.stats,
            misc: this.misc,
            flags: this.flags,
            savings: this.savings.get_json(),
            stash: this.stash.get_json(),
            equip: this.equip.get_json(),
        };
    }
    async load_to_db(pool) {
        let result = await common.send_query(pool, constants_1.constants.new_char_query, [
            this.user_id,
            this.cell_id,
            this.faction_id,
            this.name,
            this.status,
            this.skills,
            this.stats,
            this.misc,
            this.flags,
            this.savings.get_json(),
            this.stash.get_json(),
            this.equip.get_json()
        ]);
        return result.rows[0].id;
    }
    async save_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants_1.constants.update_char_query, [
                this.id,
                this.cell_id,
                this.faction_id,
                this.status,
                this.skills,
                this.stats,
                this.misc,
                this.flags,
                this.savings.get_json(),
                this.stash.get_json(),
                this.equip.get_json()
            ]);
            this.changed = false;
        }
    }
    async delete_from_db(pool) {
        await common.send_query(pool, constants_1.constants.delete_char_query, [this.id]);
    }
}
exports.CharacterGenericPart = CharacterGenericPart;
