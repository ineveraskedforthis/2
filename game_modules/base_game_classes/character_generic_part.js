module.exports = class CharacterGenericPart {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara';

        this.status = {
            hp: 100,
            rage: 0,
            blood: 0,
            stress: 0
        };

        this.data = {
            skills = {},

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
        if (this.data.flags.hp_changed) {
            sm.send_hp_update(this);
            this.flags.hp_changed = false;
        }
        if (this.exp_changed) {
            sm.send_exp_update(this);
            this.exp_changed = false;
        }
        if (this.status.changed) {
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

    async change_hp(x) {
        let tmp = this.hp;
        this.hp += x;
        if (this.hp > this.max_hp) {
            this.hp = this.max_hp;
        }
        if (this.hp != tmp) {
            this.hp_changed = true;
            this.changed = true;
        }
    }

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id);
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

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id);
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
}