var common = require("./common.js");
var constants = require("./constants.js")
var weapons = require("./weapons.js")

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

    init_base_values(id, name, hp, max_hp, exp, level, cell_id, user_id = -1) {
        this.name = name;
        var is_player = true
        if (user_id == -1) {
            is_player = false;
        }
        this.hp = hp;
        this.max_hp = max_hp;
        this.id = id;        
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
        var id = await this.world.get_new_id(pool, 'char_id');
        this.init_base_values(id, name, 100, 100, 0, 0, cell_id, user_id);
        await this.load_to_db(pool);
        return id;
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
        if (!this.data.in_battle) {
            await this.update2(pool)
        }
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

    async update2(pool) {
        if (this.data.dead) {
            return
        }
        let reg = this.get_regeneration();
        await this.change_hp(pool, reg, false);
        this.change_rage(-1);
        await this.update_status(pool, false);
    }

    async add_skill(pool, skill, save = true) {
        if (this.data.skill_points == 0) {
            return
        }
        let SKILLS = this.world.constants.SKILLS;
        for (let i of SKILLS[skill].req_skills) {
            // console.log(i, this.data.skills[i], SKILLS[i].max_level);
            if (this.data.skills[i] != SKILLS[i].max_level) {
                return
            }
        }
        if (skill in this.data.skills) {
            if (SKILLS[skill].max_level <= this.data.skills[skill]) {
                return
            }
            this.data.skills[skill] += 1;
            this.data.skill_points -= 1;
            await this.update_skill_stats(pool, undefined, false);
        } else {
            this.data.skills[skill] = 1;
            this.data.skill_points -= 1;
            await this.update_skill_stats(pool, undefined, false);
        }
        this.save_to_db(pool, save)
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
            if (!'s' + i in this.data.tactic || this.data.tactic['s' + i] == null) {
                this.data.tactic['s' + i] = this.world.empty_tactic_slot;
            }
        }
        for (let i = tmp.tac + 1; i < constants.MAX_TACTIC_SLOTS; i++) {
            if ('s' + i in this.data.tactic) {
                this.data.tactic['s' + i] = undefined;
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
        result.total_damage = 0;
        result = this.equip.get_weapon_damage(result);
        result = this.mod_damage_with_stats(result);        
        result = this.roll_accuracy(result);
        result = this.roll_crit(result);
        result = target.roll_evasion(result);
        this.change_rage(5)
        result = await target.take_damage(pool, result);        
        return result;
    }

    async take_damage(pool, result) {
        let res = this.get_resists();
        if (!result.evade) {
            for (let i of this.world.constants.damage_types) {
                let curr_damage = Math.max(1, result.damage[i] - res[i]);
                result.total_damage += curr_damage;
                this.update_status_after_damage(pool, i, curr_damage, false);
                await this.change_hp(pool, -curr_damage, false);
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

    async clear_tag_orders(pool, tag, save_market = true) {
        await this.get_local_market().clear_agent_orders(pool, this, tag, save_market)
    }

    async clear_orders(pool, save_market = true) {
        for (var tag of this.world.constants.TAGS) {
            await this.clear_tag_orders(pool, tag, save_market)
        }
    }

    async move(pool, data) {
        this.changed = true;
        this.cell_id = this.world.get_cell_id_by_x_y(data.x, data.y);
        console.log(this.name + ' move ' + data.x + data.y);
    }

    //attack misc

    mod_damage_with_stats(result) {
        result.damage['blunt'] = Math.floor(Math.max(1, result.damage['blunt'] * this.data.stats.musculature / 10));
        result.damage['pierce'] = Math.floor(Math.max(1, result.damage['pierce'] * this.data.stats.musculature / 10));
        result.damage['slice'] = Math.floor(Math.max(1, result.damage['slice'] * this.data.stats.musculature / 10));
        result.damage['fire'] = Math.floor(Math.max(1, result.damage['fire'] * this.get_magic_power()));
        return result
    }

    roll_accuracy(result) {
        let dice = Math.random();
        let acc = this.get_accuracy();
        if (dice > acc) {
            result.evade = true;
        }
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

    //getters

    get_item_lvl() {
        return 1;
    }

    get_magic_power() {
        let power = this.data.stats['pow'];
        if (this.data.skills['blood_battery'] == 1) {
            power = power * (1 + this.data.other.blood_covering / 100);
        }
        return power / 10;
    }

    get_resists() {
        let res = this.data.base_resists;
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
        return this.equip.get_weapon_range();
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
        await this.save_to_db(pool, save);
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
        await common.send_query(pool, constants.new_char_query, [this.id, this.user_id, this.cell_id, this.name, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
    }

    async save_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.update_char_query, [this.id, this.cell_id, this.hp, this.max_hp, this.savings.get_json(), this.stash.get_json(), this.equip.get_json(), this.data]);
        }
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_char_query, [this.id]);
    }
}