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
            }
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

    async status_check(pool) {

    }

    out_of_battle_update() {

    }

    battle_update() {

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