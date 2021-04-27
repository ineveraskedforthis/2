module.exports = class CharacterGenericPart {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara'

        this.status = {
            hp: 100,
            rage: 0,
            blood: 0,
            stress: 0
        };

        this.data = {
            skills = {
                clothier = [0, 0],
                cook = [0, 0],
                onehand = [0, 0],
                polearms = [0, 0],
                noweapon = [0, 0],
                skinning = [0, 0],
                enchanting = [0, 0],
                magic_mastery = [0, 0],
                blocking = [0, 0],
                evasion = [0, 0],
            },

            perks = {},

            innate_stats = {
                max_hp = 100,
                max_rage = 100,
                max_blood = 100,
                max_stress = 100,
                movement_speed: 1,
                base_resists: this.world.constants.base_resists.zero
            },

            misc = {
                model: 'test',
                explored: {},
                battle_id: null,
                tactic: {s0: this.world.constants.default_tactic_slot},
            },

            faction = -1
        }

        this.flags = {
            player = false,
            trainer = false,
            dead = false,
            in_battle: false,
        }

        this.changed = false;
        this.status_changed = false;
    }

    init_base_values(name, cell_id, user_id = -1) {
        this.name = name;
        if (user_id != -1) {
            this.flags.is_player = true;
        }   
        this.user_id = user_id;
        this.cell_id = cell_id;
    }

    async update(pool) {
        await this.status_check(pool);

        if (this.data.dead) {
            return
        }
        
        if (!this.in_battle()) {
            this.out_of_battle_update()
        } else {
            this.battle_update()
        }

        this.flags_handling_update();        
        await this.save_to_db(pool, this.changed);
        this.changed = false;
    }

    //some stuff defined per concrete character class

    async status_check(pool) {

    }

    out_of_battle_update() {

    }

    battle_update() {

    }

    on_move() {

    }

    get_item_lvl() {
        return 1;
    }


    flags_handling_update() {
        let sm = this.world.socket_manager;
        if (this.status_changed) {
            sm.send_status_update(this);
            this.status_changed = false;
        }
        if (this.savings.changed) {
            sm.send_savings_update(this);
            this.savings.changed = false;
        }
        if (this.stash.changed) {
            sm.send_stash_update(this);
            this.stash.changed = false;
        }
    }

    get_tag() {
        return this.tag
    }

    get_hp() {
        return this.hp
    }

    get_hp_change() {
        return 0
    }

    get_rage_change() {
        if (!this.flags.in_battle) {
            return -1
        } else {
            return 1
        }
    }

    get_stress_change() {
        let d_stress = (this.get_stress_target() - this.data.other.stress);
        if (d_stress != 0) {
            if ((d_stress / 30 > 1)||(d_stress / 30 < -1)) {
                return Math.floor(d_stress/30)
            } else {
                return Math.sign(d_stress)
            }
        }
    }

    get_max_hp() {
        return this.data.innate_stats.max_hp
    }

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id);
    }

    change_hp(x) {
        let tmp = this.hp;
        this.status.hp = Math.max(0, Math.min(this.get_max_hp(), this.status.hp + x));
        if (this.status.hp != tmp) {
            this.changed = true;
            this.status_changed = true;
        }
    }

    change_rage(x) {
        let tmp = this.status.rage;
        this.status.rage = Math.max(0, Math.min(this.get_max_rage(), this.status.rage + x));
        if (tmp != this.data.other.rage) {
            this.changed = true;
            this.status_changed = true;
        }
    }

    change_blood(x) {
        let tmp = this.data.other.blood;
        this.status.blood = Math.max(0, Math.min(this.get_max_blood(), this.status.blood + x));
        if (tmp != this.status.blood) {
            this.changed = true
            this.status_changed = true;
        }
    }

    change_stress(x) {
        let tmp = this.status.stress;
        this.status.stress = Math.max(0, this.status.stress + x);
        if (tmp != this.status.stress) {
            this.changed = true
            this.status_changed = true;
        }
    }

    


    //equip and stash interactions

    equip_item(index) {
        this.equip.equip(index);
        this.changed = true;
    }

    unequip_tag(tag) {
        this.equip.unequip(tag);
        this.changed = true;
    }

    transfer(target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
    }

    transfer_all(target) {
        for (var tag of this.world.constants.TAGS) {
            var x = this.stash.get(tag);
            this.transfer(target, tag, x);
        }
    }





    //market interactions


    buy(tag, amount, money, max_price = null) {
        let cell = this.get_cell();
        if (cell.has_market()) {            
            cell.market.buy(tag, this, amount, money, max_price);
        }        
    }

    sell(tag, amount, price) {
        let cell = this.get_cell();
        if (cell.has_market()) {
            cell.market.sell(tag, this, amount, price);
        }        
    }

    sell_item(index, buyout_price, starting_price) {
        let cell = this.get_cell();
        if (cell.has_market()) {
            cell.item_market.sell(this, index, buyout_price, starting_price);
        }        
    }

    clear_tag_orders(tag) {
        let cell = this.get_cell();
        if (cell.has_market()) {
            cell.market.clear_agent_orders(this, tag)
        }
    }

    clear_orders() {
        for (var tag of this.world.constants.TAGS) {
            this.clear_tag_orders(tag, save_market)
        }
    }





    //attack calculations

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
                    this.change_hp(-curr_damage);
                }                
            }
            this.change_blood(2);
            this.change_rage(2);
        }
        await this.save_to_db(pool)
        return result;
    }


    add_explored(tag) {
        this.data.explored[tag] = true;
    }
    

    async on_move_default(pool, data) {
        this.on_move()

        let tmp = this.world.get_territory(data.x, data.y)
        this.add_explored(this.world.get_id_from_territory(tmp));
        this.world.socket_manager.send_explored(this);

        let danger = this.world.constants.ter_danger[tmp];
        let res = await this.attack_local_monster(pool, danger)                
        if (res != undefined) {
            return 2
        } 
        return 1
    }

    verify_move(dx, dy) {
        return ((dx == 0 & dy == 1) || (dx == 0 & dy == -1) || (dx == 1 & dy == 0) || (dx == -1 & dy == 0) || (dx == 1 & dy == 1) || (dx == -1 & dy == -1))
    }

    async move(pool, data) {
        if (this.in_battle()) {
            return 0
        }
        if (this.world.can_move(data.x, data.y)) {
            let {x, y} = this.world.get_cell_x_y_by_id(this.cell_id)
            let dx = data.x - x;
            let dy = data.y - y;
            if (this.verify_move(dx, dy)) {
                this.changed = true;
                this.cell_id = this.world.get_cell_id_by_x_y(data.x, data.y);
                return await this.on_move_default(pool, data)                
            }
            return 0
        }
        return 0
    }

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




    // some getters

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
    
    get_range() {
        return this.equip.get_weapon_range(1);
    }

    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        return cell.market;
    }

    
    
    // flag checking functions

    is_player() {
        return this.flags.is_player;
    }

    in_battle() {
        return this.flags.in_battle;
    }



    // factions interactions

    set_faction(faction) {
        this.changed = true
        this.data.faction = faction.id
    }




    //db interactions

    async save_status_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.set_status_query, [this.status, this.id]);
        }
    }

    async load_from_json(data) {
        this.id = data.id;
        this.name = data.name;
        this.user_id = data.user_id;

        this.status = data.status;
        this.data = data.data;
        this.flags = data.flags;

        this.savings = new Savings();        
        this.savings.load_from_json(data.savings);        
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
        this.cell_id = data.cell_id;
        this.equip = new Equip();
        this.equip.load_from_json(data.equip);
        
    }

    get_json() {
        return {
            name: this.name,
            status: this.status,
            flags: this.flags,
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
}