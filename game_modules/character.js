var common = require("./common.js");
var constants = require("./constants.js")
var weapons = require("./weapons.js")
const spells = require("./spells.js")

var Equip = require("./equip.js");
var Stash = require("./stash.js");
var Savings = require("./savings.js")



module.exports = class Character {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara';

        this.changed = false;
    }

    init_base_values(name, hp, max_hp, exp, level, cell_id, user_id = -1) {
        this.name = name;
        var is_player = true
        if (user_id == -1) {
            is_player = false;
        }
        this.hp = hp;
        this.max_hp = max_hp;
                
        this.equip.data.right_hand = weapons.fist;        
        this.user_id = user_id;
        this.cell_id = cell_id;
        this.data = {
            model: 'test',
            movement_speed: 1,
            stats: this.world.constants.base_stats.apu,
            base_battle_stats: this.world.constants.base_battle_stats,
            base_resists: this.world.constants.base_resists.pepe,
            is_player: is_player,
            is_trainer: false,
            explored: {},
            exp: exp,
            level: level,
            skill_points: 0,
            exp_reward: 100,
            dead: false,
            in_battle: false,
            battle_id: null,
            tactic: {s0: this.world.constants.default_tactic_slot},
            status: {
                stunned: 0
            },
            stress_target: 0,
            skills: {},
            other: {
                rage: 0,
                blood_covering: 0,
                stress: 0
            }
        }
    }

    get_tag() {
        return 'test'
    }

    async init(pool, name, cell_id, user_id = -1) {
        this.init_base_values(name, 100, 100, 0, 0, cell_id, user_id);
        this.id = await this.load_to_db(pool);
        await this.save_to_db(pool);
        return this.id;
    }
    
    async set_tactic(pool, tactic, save = true) {
        for (var i = 0; i <= this.data.stats.tac; i++) {
            this.data.tactic['s' + i] = tactic['s' + i];
        }
        await this.save_to_db(pool, save);
    }

    get_regeneration() {
        let tmp = this.data.base_battle_stats.regeneration;
        tmp = Math.floor(this.data.stats.tou / 20) + tmp;
        return tmp
    }



    //updaters

    async update(pool) {
        if (this.data.dead) {
            return
        }
        
        if (!this.in_battle()) {
            await this.update2(pool)
        } else {
            let dice = Math.random()
            if (dice < this.data.base_battle_stats.stress_battle_generation) {
                this.change_stress(1)
            }            
            this.equip.update(pool, this);
        }
        await this.stress_check(pool);
        let sm = this.world.socket_manager;
        if (this.hp_changed) {
            sm.send_hp_update(this);
            this.hp_changed = false;
        }
        if (this.exp_changed) {
            sm.send_exp_update(this);
            this.exp_changed = false;
        }
        if (this.status_changed) {
            sm.send_status_update(this);
            this.status_changed = false;
        }
        if (this.savings_changed) {
            sm.send_savings_update(this);
            this.savings_changed = false;
        }
        await this.save_to_db(pool, this.changed);
        this.changed = false;
    }

    async stress_check(pool) {
        if (this.data.other.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }
        

    async update2(pool) {
        if (this.data.dead) {
            return
        }
        let reg = this.get_regeneration();
        await this.change_hp(pool, reg, false);
        this.change_rage(-1);
        let d_stress = (this.data.stress_target - this.data.other.stress);
        if (d_stress != 0) {
            if ((d_stress / 30 > 1)||(d_stress / 30 < -1)) {
                this.change_stress(Math.floor(d_stress/30))
            } else {
                this.change_stress(Math.sign(d_stress))
            }
        }
        await this.update_status(pool, false);
    }

    async add_skill(pool, skill, save = true) {

        if (this.data.skill_points == 0) {
            return undefined
        }

        let SKILLS = this.world.constants.SKILLS;
        if (!(skill in SKILLS)) {
            return undefined
        }
        let cell = this.world.get_cell_by_id(this.cell_id);
        console.log(cell.i, cell.j)
        let skill_group = this.world.get_cell_teacher(cell.i, cell.j)

        if (!(skill_group.includes(skill))) {
            return undefined
        }

        for (let i of SKILLS[skill].req_skills) {
            // console.log(i, this.data.skills[i], SKILLS[i].max_level);
            if (this.data.skills[i] != SKILLS[i].max_level) {
                return undefined
            }
        }

        if (skill in this.data.skills) {
            if (SKILLS[skill].max_level <= this.data.skills[skill]) {
                return undefined
            }
            this.data.skills[skill] += 1;
            this.data.skill_points -= 1;
            await this.update_skill_stats(pool, undefined, false);
        } else {
            this.data.skills[skill] = 1;
            this.data.skill_points -= 1;
            await this.update_skill_stats(pool, undefined, false);
        }
        this.save_to_db(pool, save);
        let new_action = SKILLS[skill].action;
        return new_action;
    }

    async update_skill_stats(pool, race = 'apu', save = true) {
        var tmp = {};
        var base = this.world.constants.base_stats[race];

        tmp.musculature = base.musculature;
        if ('warrior_training' in this.data.skills) {
            tmp.musculature += this.data.skills['warrior_training'];
        }
        tmp.breathing = base.breathing;

        tmp.coordination = base.coordination;
        if ('warrior_training' in this.data.skills) {
            if (this.data.skills['warrior_training'] > 2) {
                tmp.coordination += 1;
            }
        }

        tmp.vis = base.vis;

        tmp.int = base.int;

        tmp.tac = base.tac;
        var flag_tier0_tactic = false
        if ('warrior_training' in this.data.skills) {
            if (this.data.skills['warrior_training'] >= 3) {
                tmp.tac += 1;
                flag_tier0_tactic = true
            }
        }
        if ('mage_training' in this.data.skills && !flag_tier0_tactic) {
            if (this.data.skills['mage_training'] >= 3) {
                tmp.tac += 1;
                flag_tier0_tactic = true
            }
        }
        for (let i = 0; i <= tmp.tac; i++) {
            if (!(('s' + i) in this.data.tactic) || this.data.tactic['s' + i] == 'undefined') {
                this.data.tactic['s' + i] = this.world.constants.empty_tactic_slot;
            }
        }
        for (let i = tmp.tac + 1; i < constants.MAX_TACTIC_SLOTS; i++) {
            if (('s' + i) in this.data.tactic) {
                this.data.tactic['s' + i] = 'undefined';
            }
        }

        tmp.mem = base.mem;

        tmp.pow = base.pow;
        if ('mage_training' in this.data.skills) {
            tmp.pow += this.data.skills['mage_training']
        }

        tmp.tou = base.tou;

        this.data.stats = tmp;

        this.save_to_db(pool, save);
    }

    //actions

    async attack(pool, target) {
        let result = {}
        result.crit = false;
        result.evade = false;
        result.poison = false;
        result.blocked = false;
        result.rage_gain = 5;
        result.stress_gain = 1;
        result.blood_gain = 0;
        result.chance_to_hit = 0;
        result.total_damage = 0;
        result = this.equip.get_weapon_damage(result);
        result = this.mod_damage_with_stats(result);        
        result = this.roll_accuracy(result);
        result = this.roll_crit(result);
        result = target.roll_evasion(result);
        result = target.roll_block(result);
        this.change_rage(result.rage_gain);
        this.change_stress(result.stress_gain);
        this.change_blood(result.blood_gain);
        let dice = Math.random();
        if (dice > result.chance_to_hit) {
            result.evade = true;
        }
        result = await target.take_damage(pool, result);        
        return result;
    }

    async spell_attack(pool, target, tag) {
        let result = {};
        result.crit = false;
        result.evade = false;
        result.poison = false;
        result.blocked = false;
        result.total_damage = 0;
        result = spells[tag](result);
        result = this.mod_spell_damage_with_stats(result);
        result = await target.take_damage(pool, result);
        if ('rage' in result) {
            this.change_rage(result.rage);
        }
        return result;
    }

    async take_damage(pool, result) {
        let res = this.get_resists();
        if (!result.evade) {
            for (let i of this.world.constants.damage_types) {
                if (result.damage[i] > 0) {
                    let curr_damage = Math.max(0, result.damage[i] - res[i]);
                    result.total_damage += curr_damage;
                    this.update_status_after_damage(pool, i, curr_damage, false);
                    await this.change_hp(pool, -curr_damage, false);
                }                
            }
            this.change_blood(2);
            this.change_rage(2);
        }
        await this.save_to_db(pool)
        return result;
    }

    async equip_item(pool, index) {
        this.equip.equip(index);
        this.save_to_db(pool);
    }

    async unequip_tag(pool, tag) {
        this.equip.unequip(tag);
        this.save_to_db(pool)
    }

    async level_up(pool, save) {
        while (this.data.exp >= common.get_next_nevel_req(this.data.level)) {
            this.data.exp -= common.get_next_nevel_req(this.data.level);
            this.data.level += 1;
            this.data.skill_points += 1;
        }
        if (save) {
            await this.save_to_db(pool);
        }
    }
    
    eat(pool) {
        if (!this.data.in_battle) {
            let tmp = this.stash.get('food');
            if (tmp > 0) {
                this.change_hp(pool, 10);
                this.stash.inc('food', -1);
            }
        }
        this.changed = true;
    }

    clean(pool) {
        if (!this.data.in_battle) {
            let tmp = this.stash.get('water');
            if (tmp > 0) {
                this.change_blood(-20);
                this.stash.inc('water', -1);
            }
        }
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        await this.save_to_db(pool);
        await target.save_to_db(pool);
    }

    async transfer_all(pool, target) {
        for (var tag of this.world.constants.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, target, tag, x);
        }
        await this.save_to_db(pool);
    }
    
    async buy(pool, tag, amount, money, max_price = null) {
        var cell = this.world.get_cell_by_id(this.cell_id);
        await cell.market.buy(pool, tag, this, amount, money, max_price);
    }

    async sell(pool, tag, amount, price) {
        if (constants.logging.character.sell) {
            console.log('character sell', tag, amount, price);
        }
        var cell = this.world.get_cell_by_id(this.cell_id);
        await cell.market.sell(pool, tag, this, amount, price);
    }

    async sell_item(pool, index, buyout_price, starting_price) {
        let cell = this.world.get_cell_by_id(this.cell_id);
        await cell.item_market.sell(pool, this, index, buyout_price, starting_price);
    }

    async clear_tag_orders(pool, tag, save_market = true) {
        await this.get_local_market().clear_agent_orders(pool, this, tag, save_market)
    }

    async clear_orders(pool, save_market = true) {
        for (var tag of this.world.constants.TAGS) {
            await this.clear_tag_orders(pool, tag, save_market)
        }
    }

    async move(pool, data) {
        if (this.world.can_move(data.x, data.y)) {
            let {x, y} = this.world.get_cell_x_y_by_id(this.cell_id)
            let dx = data.x - x;
            let dy = data.y - y;
            if ((dx == 0 & dy == 1) || (dx == 0 & dy == -1) || (dx == 1 & dy == 0) || (dx == -1 & dy == 0) || (dx == 1 & dy == 1) || (dx == -1 & dy == -1)) {
                this.changed = true;
                this.cell_id = this.world.get_cell_id_by_x_y(data.x, data.y);
                console.log(this.name + ' move ' + data.x + data.y);
                this.change_stress(3);
                let tmp = this.world.get_territory(data.x, data.y)
                this.add_explored(this.world.get_id_from_territory(tmp));
                let danger = this.world.constants.ter_danger[tmp];
                let res = await this.attack_local_monster(pool, danger)
                this.world.socket_manager.send_explored(this);
                if (res != undefined) {
                    return 2
                } 
                return 1
            }
            return 0
        }
        return 0
    }

    async attack_local_monster(pool, enemies) {
        let battle = await this.world.attack_local_monster(pool, this, enemies);
        return battle
    }

    async attack_local_outpost(pool) {
        let battle = await this.world.attack_local_outpost(pool, this);
        return battle
    }

    //craft actions

    async craft_food(pool) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('cook' in this.data.skills)) {
            let tmp = this.stash.get('meat');
            if (tmp > 0) {
                this.stash.inc('meat', -1);
                let chance = this.get_craft_food_chance();
                let dice = Math.random()
                let stress_gained = this.calculate_gained_failed_craft_stress('food');
                if (dice < chance) {
                    this.stash.inc('food', +1);
                    this.change_stress(Math.floor(stress_gained / 2));
                } else {
                    this.change_stress(stress_gained);
                }     
                this.changed = true;       
            } 
            else {
                res = 'not_enough_meat'
            }
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('cook' in this.data.skills)) {
            res = 'skill_cook_is_not_learnt'
        }
        return res
    }

    get_craft_food_chance() {
        let chance = 0.0;
        if ('cook' in this.data.skills) {
            chance += this.data.skills['cook'] * 0.2
        }
        return chance
    }

    async craft_clothes(pool) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('sewing' in this.data.skills)) {
            let tmp = this.stash.get('leather');
            if (tmp > 0) {
                this.stash.inc('leather', -1);
                this.stash.inc('clothes', +1);
                let stress_gained = this.calculate_gained_failed_craft_stress('clothes');
                this.change_stress(stress_gained);
                this.changed = true;
            } else {
                res = 'not_enough_leather'
            }
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('sewing' in this.data.skills)) {
            res = 'skill_sewing_is_not_learnt'
        }
        return res
    }

    async enchant(pool, index) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('enchanting' in this.data.skills)) {
            let item = this.equip.data.backpack[index]
            if (item == undefined) {
                res = 'no_selected_item'
                return res
            }
            let tmp = this.stash.get('zaz');
            if (tmp > 0) {
                this.stash.inc('zaz', -1);
                this.world.roll_affixes(this.equip.data.backpack[index], 5);
                let stress_gained = this.calculate_gained_failed_craft_stress('enchanting');
                this.change_stress(stress_gained);
            } else {
                res = 'not_enough_zaz'
            }
            this.changed = true;
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('enchanting' in this.data.skills)) {
            res = 'skill_enchanting_is_not_learnt'
        }
        return res
    }

    async disenchant(pool, index) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('disenchanting' in this.data.skills)) {
            let item = this.equip.data.backpack[index]
            if (item == undefined) {
                res = 'no_selected_item'
                return res
            }
            this.equip.data.backpack[index] = undefined;
            let dice = Math.random();
            if (dice > 0.9) {
                this.stash.inc('zaz', +1);
            }
            let stress_gained = this.calculate_gained_failed_craft_stress('disenchanting');
            this.change_stress(stress_gained);
            this.changed = true;   
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('disenchanting' in this.data.skills)) {
            res = 'skill_disenchanting_is_not_learnt'
        }
        return res
    }

    //craft misc
    calculate_gained_failed_craft_stress(tag) {
        let total = 15;
        if ('less_stress_from_crafting' in this.data.skills) {
            total -= this.data.skills['less_stress_from_crafting'] * 3;
        }
        if (tag == 'food') {
            if ('less_stress_from_making_food' in this.data.skills) {
                total -= this.data.skills['less_stress_from_making_food'] * 5
            }
        }
        if (tag == 'enchanting') {
            if ('less_stress_from_enchanting' in this.data.skills) {
                total -= this.data.skills['less_stress_from_enchanting'] * 5
            }
        }
        if (tag == 'disenchanting') {
            if ('less_stress_from_disenchanting' in this.data.skills) {
                total -= this.data.skills['less_stress_from_disenchanting'] * 5
            }
        }
        total = Math.max(0, total)
        return total;
    }

    //attack misc

    mod_damage_with_stats(result) {
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * this.data.stats.musculature / 10));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * this.data.stats.musculature / 10));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * this.data.stats.musculature / 10));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * this.get_magic_power() / 10));
        return result
    }

    mod_spell_damage_with_stats(result) {
        let power = this.get_magic_power() / 10
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * power));
        result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce'] * power));
        result.damage['slice'] = Math.floor(Math.max(0, result.damage['slice'] * power));
        result.damage['fire'] = Math.floor(Math.max(0, result.damage['fire'] * power));
        return result
    }

    roll_accuracy(result) {
        result.chance_to_hit += this.get_accuracy()
        return result
    }

    roll_crit(result) {
        let dice = Math.random()
        let crit_chance = this.get_crit_chance;
        let mult = this.data.base_battle_stats.crit_mult;
        if (dice < crit_chance) {
            result.damage['blunt'] = result.damage['blunt'] * mult;
            result.damage['pierce'] = result.damage['pierce'] * mult;
            result.damage['slice'] = result.damage['slice'] * mult;
            result.crit = true;
        }
        return result
    }

    roll_evasion(result) {
        if (result.crit) {
            return result;
        }
        let dice = Math.random()
        let evade_chance = this.data.base_battle_stats.evasion;
        if (dice < evade_chance) {
            result.evade = true
        }
        return result
    }

    roll_block(result) {
        let dice = Math.random()
        let block_chance = this.get_block_chance();
        if (dice < block_chance) {
            result.blocked = true;
        }
        return result;
    }

    //getters

    get_item_lvl() {
        return 1;
    }

    get_magic_power() {
        let power = this.data.stats['pow'] + this.equip.get_magic_power();
        if (this.data.skills['blood_battery'] == 1) {
            power = power * (1 + this.data.other.blood_covering / 100);
        }
        return power;
    }

    get_resists() {
        let res = {}
        Object.assign(res, this.data.base_resists)
        let res_e = this.equip.get_resists();
        for (let i of this.world.constants.damage_types) {
            res[i] += res_e[i];
        }
        return res
    }

    get_hp() {
        return this.hp
    }

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id);
    }

    get_actions() {
        let tmp = []
        for (let i in this.data.skills) {
            let action = this.world.constants.SKILLS[i].action
            if (action != undefined) {
                tmp.push(action)
            }
        }
        return tmp
    }

    get_accuracy() {
        let blood_burden = this.data.base_battle_stats.blood_burden;
        let rage_burden = this.data.base_battle_stats.rage_burden
        if (this.data.skills['rage_control'] == 1) {
            rage_burden -= 0.002;
        }
        if (this.data.skills['cold_rage'] == 1) {
            rage_burden -= 0.002;
        }
        if (this.data.skills['the_way_of_rage'] == 1) {
            rage_burden -= 0.002;
        }
        let blood_acc_loss = this.data.other.blood_covering * blood_burden;
        let rage_acc_loss = this.data.other.rage * rage_burden;
        return Math.min(1, Math.max(0.2, this.data.base_battle_stats.accuracy - blood_acc_loss - rage_acc_loss))
    }

    get_block_chance() {
        let tmp = this.data.base_battle_stats.block;
        if (this.data.skills['blocking_movements'] == 1) {
            tmp += 0.06;
        }
        return tmp;
    }

    get_crit_chance(tag) {
        if (tag == 'attack') {
            let increase = 1 + this.data.base_battle_stats.attack_crit_add + this.data.stats.int / 100;
            return this.data.base_battle_stats.crit_chance * increase;
        }
        if (tag == 'spell') {
            let increase = 1 + this.data.base_battle_stats.spell_crit_add + this.data.stats.int / 100;
            return this.data.base_battle_stats.crit_chance * increase
        }
    }
    
    get_exp_reward() {
        return this.data.exp_reward;
    }

    get_range() {
        return this.equip.get_weapon_range(1);
    }

    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        return cell.market;
    }

    //setters

    async set(pool, nani, value, save = true) {
        if (this.data[nani] != value) {
            this.changed = true;
            this.data[nani] = value
        }
        this.save_to_db(pool, save);
    }

    change_rage(x) {
        let tmp = this.data.other.rage;
        this.data.other.rage = Math.max(0, Math.min(100, this.data.other.rage + x));
        if (tmp != this.data.other.rage) {
            this.changed = true;
            this.status_changed = true;
        }
    }

    change_blood(x) {
        let tmp = this.data.other.blood_covering;
        this.data.other.blood_covering = Math.max(0, Math.min(100, this.data.other.blood_covering + x));
        if (tmp != this.data.other.blood_covering) {
            this.changed = true
            this.status_changed = true;
        }
    }

    change_stress(x) {
        let tmp = this.data.other.stress;
        this.data.other.stress = Math.max(0, this.data.other.stress + x);
        if (tmp != this.data.other.stress) {
            this.changed = true
            this.status_changed = true;
        }
    }

    async change_hp(pool, x, save = true) {
        let tmp = this.hp;
        this.hp += x;
        if (this.hp > this.max_hp) {
            this.hp = this.max_hp;
        }
        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this.id);
        }
        if (this.hp != tmp) {
            this.hp_changed = true;
            this.changed = true;
        }
    }

    async update_status_after_damage(pool, type, x) {
        if (type == 'blunt') {
            if (x > 5) {
                let d = Math.random();
                if (d > 0.5) {
                    this.stun()
                }
            }
        }
    }

    async stun() {
        this.data.status.stunned = 2;
        this.changed = true;
    }

    async update_status() {
        for (let i of Object.keys(this.data.status)) {
            let x = this.data.status[i];
            if (x > 1) {
                this.changed = true;
            }
            this.data.status[i] = Math.max(x - 1, 0);
        }
    }

    async give_exp(pool, x, save = true) {
        await this.set_exp(pool, this.data.exp + x, save);
    }

    async set_exp(pool, x, save = true) {
        this.exp_changed = true;
        this.data.exp = x;
        if (this.data.exp >= common.get_next_nevel_req(this.data.level)) {
            await this.level_up(pool, false);
        }
        if (save) {
            await this.save_to_db(pool);
        }
    }

    //misc

    async save_hp_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.set_hp_query, [this.hp, this.id]);
        }
    }

    async load_from_json(data) {
        this.id = data.id;
        this.name = data.name;
        this.hp = data.hp;
        this.max_hp = data.max_hp;
        this.user_id = data.user_id;
        this.savings = new Savings();        
        this.savings.load_from_json(data.savings);        
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
        this.cell_id = data.cell_id;
        this.equip = new Equip();
        this.equip.load_from_json(data.equip);
        this.data = data.data;
    }

    get_json() {
        return {
            name: this.name,
            hp: this.hp,
            max_hp: this.max_hp,
            savings: this.savings.get_json(),
            stash: this.stash.get_json(),
            equip: this.equip.get_json(),
            data: this.data
        };
    }

    async load_to_db(pool) {
        let result = await common.send_query(pool, constants.new_char_query, [this.user_id, this.cell_id, this.name, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
        return result.rows[0].id;
    }

    async save_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.update_char_query, [this.id, this.cell_id, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
        }
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_char_query, [this.id]);
    }

    add_explored(tag) {
        this.data.explored[tag] = true;
    }

    is_player() {
        return this.data.is_player;
    }

    in_battle() {
        return this.data.in_battle;
    }
}