"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterGenericPart = exports.Status = exports.can_shoot = exports.can_cast_magic_bolt = exports.can_push_back = exports.can_fast_attack = exports.can_dodge = exports.perk_requirement = exports.perk_price = exports.perks_list = void 0;
var common = require("../common.js");
// var {constants} = require("../static_data/constants.js");
const generate_empty_resists = require("./misc/empty_resists.js");
const character_defines = require("./misc/char_related_constants.js");
const equip_1 = require("../base_game_classes/equip");
const stash_1 = require("./stash");
const attack_result_1 = require("./misc/attack_result");
const damage_types_1 = require("./misc/damage_types");
const constants_1 = require("../static_data/constants");
const materials_manager_1 = require("../manager_classes/materials_manager");
const savings_1 = require("./savings");
const generate_loot_1 = require("./races/generate_loot");
const spells_1 = require("../static_data/spells");
const market_items_1 = require("../market/market_items");
let dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
class SkillObject {
    constructor() {
        this.practice = 0;
        this.theory = 0;
    }
}
exports.perks_list = ['meat_master', 'advanced_unarmed', 'advanced_polearm', 'mage_initiation', 'magic_bolt', 'fletcher', 'skin_armour_master'];
function perk_price(tag) {
    switch (tag) {
        case 'meat_master': return 100;
        case 'advanced_unarmed': return 200;
        case 'advanced_polearm': return 200;
        case 'mage_initiation': return 1000;
        case 'magic_bolt': return 100;
        case 'fletcher': return 200;
        case 'skin_armour_master': return 1000;
    }
}
exports.perk_price = perk_price;
function perk_requirement(tag, character) {
    switch (tag) {
        case 'meat_master': {
            if (character.skills.cooking.practice < 15) {
                return 'not_enough_cooking_skill_15';
            }
            return 'ok';
        }
        case 'fletcher': {
            if (character.skills.woodwork.practice < 15) {
                return 'not_enough_woodwork_skill_15';
            }
            return 'ok';
        }
        case 'advanced_unarmed': {
            if (character.skills.noweapon.practice < 15) {
                return 'not_enough_unarmed_skill_15';
            }
            return 'ok';
        }
        case 'advanced_polearm': {
            if (character.skills.polearms.practice < 15) {
                return 'not_enough_polearms_skill_15';
            }
            return 'ok';
        }
        case 'mage_initiation': {
            if (character.skills.magic_mastery.practice < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'magic_bolt': {
            if (!character.skills.perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character.skills.magic_mastery.practice < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'skin_armour_master': {
            if (character.skills.clothier.practice < 15) {
                return 'not_enough_clothier_skill_15';
            }
        }
    }
}
exports.perk_requirement = perk_requirement;
function weapon_type(weapon) {
    if (weapon == undefined) {
        return "noweapon" /* WEAPON_TYPE.NOWEAPON */;
    }
    return weapon.get_weapon_type();
}
function can_dodge(character) {
    if (character.skills.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == "noweapon" /* WEAPON_TYPE.NOWEAPON */) {
            return true;
        }
    }
    return false;
}
exports.can_dodge = can_dodge;
function can_fast_attack(character) {
    if (character.skills.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == "noweapon" /* WEAPON_TYPE.NOWEAPON */) {
            return true;
        }
    }
    return false;
}
exports.can_fast_attack = can_fast_attack;
function can_push_back(character) {
    if (character.skills.perks.advanced_polearm == true) {
        if (weapon_type(character.equip.data.weapon) == "polearms" /* WEAPON_TYPE.POLEARMS */) {
            return true;
        }
    }
    return false;
}
exports.can_push_back = can_push_back;
function can_cast_magic_bolt(character) {
    if (character.skills.perks.magic_bolt) {
        return true;
    }
    if (character.stash.get(materials_manager_1.ZAZ) > 0) {
        return true;
    }
    return false;
}
exports.can_cast_magic_bolt = can_cast_magic_bolt;
function can_shoot(character) {
    if (character.equip.data.weapon == undefined) {
        return false;
    }
    if (character.equip.data.weapon.ranged != true) {
        return false;
    }
    if (character.stash.get(materials_manager_1.ARROW_BONE) >= 1) {
        return true;
    }
    return false;
}
exports.can_shoot = can_shoot;
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
        this.ranged = new SkillObject();
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
        this.savings = new savings_1.Savings();
        this.trade_savings = new savings_1.Savings();
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
            await this.world.entity_manager.remove_orders(pool, this);
            await market_items_1.AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this);
            await this.world.kill(pool, this.id);
        }
        if (this.status.stress >= 100) {
            await this.world.entity_manager.remove_orders(pool, this);
            await market_items_1.AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this);
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
    set_fatigue(x) {
        let tmp = this.status.fatigue;
        this.status.fatigue = Math.max(0, x);
        if (x != tmp) {
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
    unequip_secondary() {
        this.equip.unequip_secondary();
    }
    switch_weapon() {
        // console.log(this.name + ' switch_weapon')
        this.equip.switch_weapon();
        this.send_equip_update();
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
    async buy(pool, tag, amount, price) {
        if (this.savings.get() >= amount * price) {
            console.log('buy ' + tag + ' ' + amount + ' ' + price);
            this.savings.transfer(this.trade_savings, amount * price);
            let order = await this.world.entity_manager.generate_order(pool, 'buy', tag, this, amount, price, this.cell_id);
            return 'ok';
        }
        return 'not_enough_money';
    }
    async sell(pool, tag, amount, price) {
        // console.log(this.stash.get(tag), amount)
        if (this.stash.get(tag) < amount) {
            return 'not_enough_items';
        }
        console.log('sell ' + tag + ' ' + amount + ' ' + price);
        this.stash.transfer(this.trade_stash, tag, amount);
        let order = await this.world.entity_manager.generate_order(pool, 'sell', tag, this, amount, price, this.cell_id);
        return 'ok';
    }
    async clear_orders(pool) {
        await this.world.entity_manager.remove_orders(pool, this);
        await market_items_1.AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this);
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
    send_action_ping(duration, is_move) {
        if (this.is_player()) {
            this.world.socket_manager.send_action_ping_to_character(this, duration, is_move);
        }
    }
    //rgo
    rgo_check(character) {
        (0, generate_loot_1.generate_loot)(character, this.get_tag());
        character.send_stash_update();
        character.send_skills_update();
        character.changed = true;
    }
    //attack calculations
    async attack(pool, target, mod, dodge_flag, distance) {
        let result = new attack_result_1.AttackResult();
        result = this.equip.get_weapon_damage(result, (mod == 'ranged'));
        result = this.mod_attack_damage_with_stats(result, mod);
        result = this.roll_accuracy(result, mod, distance);
        result = this.roll_crit(result);
        result = target.roll_dodge(result, mod, dodge_flag);
        result = target.roll_block(result);
        let dice = Math.random();
        if (dice > this.get_weapon_skill(result.weapon_type) / 50) {
            this.change_weapon_skill(result.weapon_type, 1);
        }
        this.send_skills_update();
        result = await target.take_damage(pool, mod, result);
        this.change_status(result.attacker_status_change);
        if (result.flags.killing_strike) {
            target.transfer_all_inv(this);
            target.rgo_check(this);
        }
        return result;
    }
    async spell_attack(pool, target, tag) {
        let result = new attack_result_1.AttackResult();
        if (tag == 'bolt') {
            let bolt_difficulty = 30;
            let dice = Math.random() * bolt_difficulty;
            let skill = this.skills.magic_mastery.practice;
            if (skill < dice) {
                this.skills.magic_mastery.practice += 1;
            }
        }
        result = spells_1.spells[tag](result);
        result = this.mod_spell_damage_with_stats(result, tag);
        this.change_status(result.attacker_status_change);
        result = await target.take_damage(pool, 'ranged', result);
        return result;
    }
    async take_damage(pool, mod, result) {
        let res = this.get_resists();
        if (!result.flags.evade && !result.flags.miss) {
            for (let i of damage_types_1.damage_types) {
                if (result.damage[i] > 0) {
                    let curr_damage = Math.max(0, result.damage[i] - res[i]);
                    if ((curr_damage > 0) && ((i == 'slice') || (i == 'pierce')) && !(mod == 'ranged')) {
                        result.attacker_status_change.blood += Math.floor(curr_damage / 10);
                        result.defender_status_change.blood += Math.floor(curr_damage / 10);
                    }
                    result.total_damage += curr_damage;
                    this.change_hp(-curr_damage);
                    if (this.get_hp() == 0) {
                        await this.world.entity_manager.remove_orders(pool, this);
                        await market_items_1.AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this);
                        result.flags.killing_strike = true;
                    }
                }
            }
            this.change_status(result.defender_status_change);
        }
        await this.save_to_db(pool);
        return result;
    }
    mod_attack_damage_with_stats(result, mod) {
        let phys_power = this.get_phys_power() / 10;
        switch (mod) {
            case 'usual': {
                phys_power = phys_power * 2;
                break;
            }
            case 'heavy': {
                phys_power = phys_power * 5;
                break;
            }
            case 'ranged': {
                phys_power = phys_power * 2;
                break;
            }
        }
        let magic_power = this.get_magic_power() / 10;
        if (this.skills.perks.claws) {
            if (result.weapon_type == 'noweapon') {
                result.damage.pierce += 10;
            }
        }
        if (this.skills.perks.advanced_unarmed) {
            if (result.weapon_type == 'noweapon') {
                result.damage.blunt += 10;
            }
        }
        if (mod != 'ranged') {
            result.attacker_status_change.rage = 5;
        }
        result.attacker_status_change.fatigue = 1;
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * phys_power));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * phys_power));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * phys_power));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * magic_power));
        return result;
    }
    mod_spell_damage_with_stats(result, tag) {
        let power_mod = this.get_magic_power() / 10;
        let skill_mod = this.skills.magic_mastery.practice / 10;
        let damage_mod = power_mod * (skill_mod + 1);
        if (this.skills.perks.magic_bolt) {
            damage_mod = damage_mod * 1.5;
        }
        if (this.skills.perks.mage_initiation) {
            damage_mod = damage_mod * 1.5;
        }
        damage_mod = Math.floor(damage_mod);
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * damage_mod));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * damage_mod));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * damage_mod));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * damage_mod));
        return result;
    }
    roll_accuracy(result, mod, distance) {
        let dice = Math.random();
        result.chance_to_hit = this.get_accuracy(result, mod, distance);
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
    roll_dodge(result, mod, dodge_flag) {
        let dice = Math.random();
        let base_evade_chance = this.get_evasion_chance();
        let attack_specific_dodge = 0;
        if (dodge_flag)
            switch (mod) {
                case 'fast': {
                    attack_specific_dodge = 0.2;
                    break;
                }
                case 'usual': {
                    attack_specific_dodge = 0.5;
                    break;
                }
                case 'heavy': {
                    attack_specific_dodge = 1;
                    break;
                }
                case 'ranged': {
                    attack_specific_dodge = 0.2;
                    break;
                }
            }
        let evade_chance = base_evade_chance + attack_specific_dodge;
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
    get_weapon_skill(weapon_type) {
        switch (weapon_type) {
            case "noweapon" /* WEAPON_TYPE.NOWEAPON */: return this.skills.noweapon.practice;
            case "onehand" /* WEAPON_TYPE.ONEHAND */: return this.skills.onehand.practice;
            case "polearms" /* WEAPON_TYPE.POLEARMS */: return this.skills.polearms.practice;
            case "twohanded" /* WEAPON_TYPE.TWOHANDED */: return this.skills.twohanded.practice;
            case "ranged" /* WEAPON_TYPE.RANGED */: return this.skills.ranged.practice;
        }
    }
    change_weapon_skill(weapon_type, x) {
        switch (weapon_type) {
            case "noweapon" /* WEAPON_TYPE.NOWEAPON */:
                this.skills.noweapon.practice += x;
                break;
            case "onehand" /* WEAPON_TYPE.ONEHAND */:
                this.skills.onehand.practice += x;
                break;
            case "polearms" /* WEAPON_TYPE.POLEARMS */:
                this.skills.polearms.practice += x;
                break;
            case "twohanded" /* WEAPON_TYPE.TWOHANDED */:
                this.skills.twohanded.practice += x;
                break;
            case "ranged" /* WEAPON_TYPE.RANGED */:
                this.skills.ranged.practice += x;
                break;
        }
    }
    get_accuracy(result, mod, distance) {
        let base_accuracy = character_defines.accuracy + this.get_weapon_skill(result.weapon_type) * character_defines.skill_accuracy_modifier;
        let blood_burden = character_defines.blood_accuracy_burden;
        let rage_burden = character_defines.rage_accuracy_burden;
        let blood_acc_loss = this.status.blood * blood_burden;
        let rage_acc_loss = this.status.rage * rage_burden;
        let final = base_accuracy - blood_acc_loss - rage_acc_loss;
        if ((distance != undefined) && (mod == 'ranged')) {
            if (distance < 2)
                distance = 2;
            distance = Math.sqrt(distance - 2) / 2 + 2;
            final = final / (distance - 1.5);
            return Math.min(1, Math.max(0, final));
        }
        return Math.min(1, Math.max(0.2, final));
    }
    get_attack_chance(mod, distance) {
        let weapon = this.equip.data.weapon;
        let weapon_type = "noweapon" /* WEAPON_TYPE.NOWEAPON */;
        if (weapon != undefined) {
            weapon_type = weapon.get_weapon_type();
        }
        return this.get_accuracy({ weapon_type: weapon_type }, mod, distance);
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
        let base_range = 0.6;
        if (this.misc.tag == 'graci')
            base_range = 1.3;
        return this.equip.get_weapon_range(base_range);
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
    learn_perk(tag) {
        this.skills.perks[tag] = true;
        this.changed = true;
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
        this.savings = new savings_1.Savings();
        this.savings.load_from_json(data.savings);
        this.trade_savings = new savings_1.Savings();
        this.trade_savings.load_from_json(data.trade_savings);
        this.stash = new stash_1.Stash();
        this.stash.load_from_json(data.stash);
        this.trade_stash = new stash_1.Stash();
        this.trade_stash.load_from_json(data.trade_stash);
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
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            // @ts-ignore: Unreachable code error
            global.last_id += 1;
            // @ts-ignore: Unreachable code error
            return global.last_id;
        }
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
            this.trade_savings.get_json(),
            this.stash.get_json(),
            this.trade_stash.get_json(),
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
                this.trade_savings.get_json(),
                this.stash.get_json(),
                this.trade_stash.get_json(),
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
