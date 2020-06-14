var common = require("./common.js");
var constants = require("./constants.js")

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
        this.equip.data.right_hand = 'fist';        
        this.user_id = user_id;
        this.cell_id = cell_id;
        this.data = {
            model: 'test',
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

    change_rage(x) {
        this.data.other.rage = Math.max(0, Math.min(100, this.data.other.rage + x))
    }

    async update(pool) {
        if (this.data.dead) {
            return
        }
        if (!this.data.in_battle) {
            await this.update2(pool)
        }
        var socket = undefined;
        if (this.data.is_player) {
            let user = this.world.user_manager.users[this.user_id]
            if (user != undefined) {
                socket = this.world.user_manager.users[this.user_id].socket;
            }
        }
        if (socket != undefined) {
            socket.emit('char-info', this.get_json());
        }
    }

    async update2(pool) {
        if (this.data.dead) {
            return
        }
        let reg = this.get_regeneration();
        await this.change_hp(pool, reg, false);
        this.change_rage(-1);
        await this.update_status(pool, false);
        await this.save_to_db(pool)
    }

    get_exp_reward() {
        return this.data.exp_reward;
    }

    get_range() {
        return this.equip.get_weapon_range();
    }

    async set(pool, nani, value, save = true) {
        this.data[nani] = value;
        await this.save_to_db(pool, save);
    }

    async add_skill(pool, skill, save = true) {
        if (this.data.skill_points == 0) {
            return
        }
        if (skill in this.data.skills) {
            if (this.world.constants.SKILLS[skill].max_level <= this.data.skills[skill]) {
                return
            }
            this.data.skills[skill] += 1;
            this.data.skill_points -= 1;
            await this.update_stats(pool, undefined, false);
        } else {
            this.data.skills[skill] = 1;
            this.data.skill_points -= 1;
            await this.update_skill_stats(pool, undefined, false);
        }
        this.save_to_db(pool, save)
    }

    get_accuracy() {
        let blood_acc_loss = this.data.other.blood_covering * this.data.base_battle_stats.blood_burden;
        let rage_acc_loss = this.data.other.rage * this.data.base_battle_stats.rage_burden;
        return Math.min(1, Math.max(0.2, this.data.base_battle_stats.accuracy - blood_acc_loss - rage_acc_loss))
    }

    get_crit_chance(tag) {
        if (tag == 'attack') {
            let increase = 1 + this.data.base_battle_stats.attack_crit_add;
            return this.data.base_battle_stats.crit_chance * increase
        }
        if (tag == 'spell') {
            let increase = 1 + this.data.base_battle_stats.spell_crit_add;
            return this.data.base_battle_stats.crit_chance * increase
        }
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

    async attack(pool, target) {
        let result = {}
        result.crit = false
        result.evade = false
        result.damage = this.equip.get_weapon_damage(this.data.stats.musculature);
        result.total_damage = 0;
        result = this.roll_accuracy(result);
        result = this.roll_crit(result);
        result = target.roll_evasion(result);
        result = await target.take_damage(pool, result);
        this.data.other.rage = Math.min(this.data.other.rage + 10, 100)
        return result;
    }

    roll_accuracy(result) {
        let dice = Math.random();
        let acc = this.get_accuracy();
        console.log(dice, acc);
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

    async take_damage(pool, result) {
        let res = this.get_resists();
        if (!result.evade) {
            for (let i of this.world.constants.damage_types) {
                let curr_damage = Math.max(1, result.damage[i] - res[i]);
                result.total_damage += curr_damage;
                this.update_status_after_damage(pool, i, curr_damage, false);
                await this.change_hp(pool, -curr_damage, false);
            }
            this.data.other.blood_covering = Math.min(this.data.other.blood_covering + 2, 100)
            this.data.other.rage = Math.min(this.data.other.rage + 2, 100)
        }
        await this.save_to_db(pool)
        return result;
    }

    async stun(pool) {
        this.data.status.stunned = 2
        this.save_to_db(pool)
    }

    async update_status() {
        for (let i of Object.keys(this.data.status)) {
            let x = this.data.status[i];
            this.data.status[i] = Math.max(x - 1, 0);
        }
    }

    async update_status_after_damage(pool, type, x) {
        if (type == 'blunt') {
            if (x > 5) {
                let d = Math.random();
                if (d > 0.5) {
                    await this.stun(pool)
                }
            }
        }
    }

    get_resists() {
        let res = this.data.base_resists;
        let res_e = this.equip.get_resists();
        for (let i of this.world.constants.damage_types) {
            res[i] += res_e[i];
        }
        return res
    }

    async change_hp(pool, x, save = true) {
        this.hp += x;
        if (this.hp > this.max_hp) {
            this.hp = this.max_hp;
        }
        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this);
        }
        await this.save_to_db(pool, save);
    }

    async save_hp_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.set_hp_query, [this.hp, this.id]);
        }
    }

    async give_exp(pool, x, save = true) {
        await this.set_exp(pool, this.data.exp + x, save);
    }

    async set_exp(pool, x, save = true) {
        this.data.exp = x;
        if (this.data.exp >= common.get_next_nevel_req(this.data.level)) {
            await this.level_up(pool, false);
        }
        if (save) {
            await this.save_to_db(pool);
        }
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

    get_hp() {
        return this.hp
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