var constants = require("./constants.js");
var common = require("./common.js");


var Map = require("./map.js");
var Battle = require("./battle.js");
var Character = require("./character.js");
var Pop = require("./agents/pop.js");
var MarketOrder = require("./market_order");

const { OrderItem } = require("./market_items.js");


module.exports = class EntityManager {
    constructor(world) {
        this.world = world;
        this.map = new Map(this.world);
        this.agents = {};
        this.chars = {};
        this.orders = {};
        this.item_orders = {};
        this.battles = {};
    }

    async init(pool) {
        await this.map.init(pool);
    }

    async load(pool) {
        await this.map.load(pool);
        await this.load_agents(pool);
        await this.load_characters(pool);
        await this.load_orders(pool);
        await this.load_item_orders(pool);
        await this.load_battles(pool);
        await this.clear_dead_orders(pool);
    }

    async load_agents(pool) {
        await this.load_pops(pool);
    }

    async load_pops(pool) {
        let res = await common.send_query(pool, constants.load_pops_query);
        for (let i of res.rows) {
            let pop = new Pop(this.world);
            pop.load_from_json(i);
            this.agents[pop.id] = pop;
        }
        console.log('pops loaded')
    }

    async load_characters(pool) {
        let res = await common.send_query(pool, constants.load_chars_query);
        for (let i of res.rows) {
            let char = new Character(this.world);
            char.load_from_json(i);
            this.chars[char.id] = char;
        }
        console.log('characters loaded')
    }

    async load_orders(pool) {
        let res = await common.send_query(pool, constants.load_orders_query);
        for (let i of res.rows) {
            let order = new MarketOrder(this.world);
            order.load_from_json(i);
            this.orders[order.id] = order;
        }
        console.log('orders loaded')
    }

    async load_item_orders(pool) {
        let res = await common.send_query(pool, constants.load_item_orders_query);
        for (let i of res.rows) {
            let order = new OrderItem(this.world);
            order.load_from_json(i);
            this.item_orders[order.id] = order;
        }
        console.log('item orders loaded')
    }

    async load_battles(pool) {
        let res = await common.send_query(pool, constants.load_battles_query);
        for (let i of res.rows) {
            let battle = new Battle(this.world);
            battle.load_from_json(i);
            this.battles[battle.id] = battle;
        }
        console.log('battles loaded')
    }

    async clear_dead_orders(pool) {
        this.map.clear_dead_orders(pool);
    }

    async update_agents(pool) {
        let keys = Object.keys(this.agents);
            keys.sort(function() {return Math.random() - 0.5});
            for (let i of keys) {
                await this.agents[i].update(pool);
            }
            // for (let i of Object.keys(this.agents)) {
            //     let agent = this.agents[i]
            //     console.log(agent.name.padEnd(15) + agent.savings.get().toString().padStart(10) + agent.data.price.toString().padStart(10) + agent.data.sold.toString().padStart(10))
            // }
            // let market = this.map.cells[0][0].market;
            // console.log('meat'.padEnd(10) + market.guess_tag_cost('meat', 1).toString().padStart(10))
            // console.log('leather'.padEnd(10) + market.guess_tag_cost('leather', 1).toString().padStart(10))
            // console.log('clothes'.padEnd(10) + market.guess_tag_cost('clothes', 1).toString().padStart(10))
            // console.log('food'.padEnd(10) + market.guess_tag_cost('food', 1).toString().padStart(10))
    }

    async update_chars(pool) {
        for (let i in this.chars) {
            if (!this.chars[i].data.dead) {
                let char = this.chars[i]
                if (!char.in_battle()) {
                    await char.update(pool);
                }
            }
        }
    }

    async update_map(pool) {
        await this.map.update(pool);
        await this.map.update_info(pool);        
    }   

    async update_battles(pool) {
        for (let i in this.battles) {
            var battle = this.battles[i]
            if (battle == null) {
                continue
            }
            let res = battle.is_over();
            if (res == -1) {
                var log = await battle.update(pool);
                let status = battle.get_team_status(1);
                for (let i = 0; i < battle.unit_amount(); i++) {
                    let character = this.chars[battle.units[i].id];
                    if ((character != undefined) && (character.data.is_player)) {
                        this.world.socket_manager.send_to_character_user(character, 'battle-update', battle.get_data())
                        this.world.socket_manager.send_to_character_user(character, 'enemy-update', status);
                        log.forEach(log_entry => { this.world.socket_manager.send_to_character_user(character, 'battle-action', log_entry)});
                    }
                }
            } else {
                if (res != 2) {
                    var exp_reward = battle.reward(1 - res);
                    // let ilvl = await battle.collect_loot(pool);
                    await battle.reward_team(pool, res, exp_reward);
                }
                else {
                    await battle.reward_team(pool, res, 0, 0);
                }
                for (let i = 0; i < battle.unit_amount(); i++) {
                    let character = this.chars[battle.units[i].id];
                    if (character != undefined) {
                        if (character.data.is_player) {
                            this.world.socket_manager.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
                            this.world.socket_manager.send_updates_to_char(character)
                        }
                    }
                }
                await this.delete_battle(pool, battle.id);
            }
        }
    }

    get_cell(x, y) {
        return this.map.get_cell(x, y);
    }

    get_cell_by_id(id) {
        return this.map.get_cell_by_id(id);
    }

    get_cell_id_by_x_y(x, y) {
        return x * this.world.y + y
    }

    async add_order(pool, order) {
        this.orders[order.id] = order;
    }

    add_item_order(order) {
        this.item_orders[order.id] = order
    }

    get_order (order_id) {
        return this.orders[order_id];
    }

    get_item_order (id) {
        return this.item_orders[id];
    }

    get_from_id_tag(id, tag) {
        if (tag == 'agent') {
            return this.agents[id]
        }
        if (tag == 'chara') {
            return this.chars[id]
        }
        if (tag == 'pop') {
            return this.agents[id]
        }
        if (tag == 'cell') {
            return this.get_cell_by_id(id)
        }
    }

    async kill(pool, char_id) {
        
        let character = this.chars[char_id];
        if (!character.data.dead) {
            await character.clear_orders(pool);
            await character.set(pool, 'dead', true);
            console.log('kill ' + char_id);
            if (character.data.is_player) {
                var user = this.world.user_manager.get_user_from_character(character);
                user.send_death_message()
                var id = await user.get_new_char(pool);
                this.chars[id] = user.character;
            }
            await character.delete_from_db(pool);
        }
        
        // this.chars[character.id] = null;
    }

    async create_monster(pool, monster_class, cell_id) {
        var monster = new monster_class(this.world);
        await monster.init(pool, cell_id);
        this.chars[monster.id] = monster;
        return monster;
    }

    async create_pop(pool, x, y, size, needs, race_tag, name, savings, state) {
        let pop = new Pop(this.world);
        let cell_id = this.get_cell_id_by_x_y(x, y)
        await pop.init(pool, cell_id, size, needs, race_tag, name, state)
        await pop.savings.inc(savings)
        await pop.save_to_db(pool)
        this.agents[pop.id] = pop;
        return pop
    }

    async create_battle(pool, attackers, defenders) {
        var battle = new Battle(this.world);
        await battle.init(pool);
        for (let i = 0; i < attackers.length; i++) {
            await battle.add_fighter(pool, attackers[i], 0);
        }
        for (let i = 0; i < defenders.length; i++) {
            await battle.add_fighter(pool, defenders[i], 1, {x: Math.random() * 5 - 2.5, y: Math.random() * 4 + 5});
        }
        this.battles[battle.id] = battle;
        return battle;
    }

    async create_new_character(pool, name, cell_id, user_id, territory_tag) {
        let char = new Character(this.world);
        if (cell_id == undefined) {
            let tmp = this.world.constants.starting_position[territory_tag]
            cell_id = this.get_cell_id_by_x_y(tmp[0], tmp[1]);
        }
        
        await char.init(pool, name, cell_id, user_id);
        this.chars[char.id] = char
        return char
    }    

    async delete_battle(pool, id) {
        var battle = this.battles[id];
        await battle.delete_from_db(pool);
        this.battles[id] = null;
    }
    
    async load_character_data_from_db(pool, char_id) {
        var res = await common.send_query(pool, constants.select_char_by_id_query, [char_id]);
        if (res.rows.length == 0) {
            return null;
        }
        return res.rows[0];
    }

    async load_character_data_to_memory(pool, data) {
        var character = new Character();
        await character.load_from_json(pool, this, data)
        this.chars[data.id] = character;
        return character;
    }
}