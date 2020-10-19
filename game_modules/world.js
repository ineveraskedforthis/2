var basic_characters = require("./basic_characters.js");
var constants = require("./constants.js");
var common = require("./common.js");
var {loot_chance_weight, loot_affixes_weight} = require("./item_tags");

var Map = require("./map.js");
var Battle = require("./battle.js");
var Character = require("./character.js");
var UserManager = require("./user_manager.js");
var SocketManager = require("./socket_manager.js");
var Pop = require("./agents/pop.js");
var MarketOrder = require("./market_order");
const StateMachines = require("./StateMachines.js");
const { OrderItem } = require("./market_items.js");


const total_loot_chance_weight = {}
for (let i in  loot_chance_weight) {
    total_loot_chance_weight[i] = 0
    for (let j in loot_chance_weight[i]) {
        total_loot_chance_weight[i] += loot_chance_weight[i][j]
    }
}

var total_affixes_weight = {}
for (let tag in loot_affixes_weight) {
    total_affixes_weight[tag] = 0
    for (let i in loot_affixes_weight[tag]) {
        total_affixes_weight[tag] += loot_affixes_weight[tag][i]
    }
}


module.exports = class World {
    constructor(io, x, y) {
        this.io = io
        this.user_manager = new UserManager(this);
        this.x = x;
        this.y = y;
        this.map = new Map(this);
        this.constants = require("./world_constants_1.js");
        this.agents = {};
        this.chars = {};
        this.orders = {};
        this.item_orders = {};
        this.battles = {};
        this.BASE_BATTLE_RANGE = 10;
        this.HISTORY_PRICE = {};
        this.HISTORY_PRICE['food'] = 50;
        this.HISTORY_PRICE['clothes'] = 50;
        this.HISTORY_PRICE['leather'] = 50;
        this.HISTORY_PRICE['meat'] = 50;
        this.HISTORY_PRICE['tools'] = 0;
        this.vacuum_stage = 0;
        this.battle_tick = 0;
        this.pops_tick = 1000;
        this.map_tick = 0;
    }

    async init(pool) {
        this.socket_manager = new SocketManager(pool, this.io, this);
        await this.map.init(pool);
        await common.send_query(pool, constants.save_world_size_query, [this.x, this.y])
        await this.add_starting_agents(pool);
    }


    async add_starting_agents(pool) {
        let pop = await this.create_pop(pool, 0, 0, 1, {'food': 0, 'clothes': 0, 'meat': 0}, 'pepe', 'water', 1000, StateMachines.AIs['water']);
        this.agents[pop.id] = pop;
        pop.stash.inc('water', 10000);

        for (let i = 1; i <= 3; i++) {
            pop = await this.create_pop(pool, 0, 0, 1, {'food': 0, 'clothes': 0, 'meat': 0}, 'pepe', 'cook ' + i, 10000, StateMachines.AIs['meat_to_heal']);
            this.agents[pop.id] = pop;
        }

        for (let i = 1; i <= 13; i++) {
            pop = await this.create_pop(pool, 0, 0, 1, {'food': 0, 'clothes': 0, 'meat': 0}, 'pepe', 'meat ' + i, Math.floor(100 * i * i / 10), StateMachines.AIs['hunters']);
            this.agents[pop.id] = pop;
        }

        for (let i = 1; i <= 3; i++) {
            pop = await this.create_pop(pool, 0, 0, 1, {'food': 0, 'clothes': 0, 'meat': 0}, 'pepe', 'clothiers ' + i, 10000, StateMachines.AIs['clothiers']);
            this.agents[pop.id] = pop;
        }
    }


    async load(pool) {
        this.socket_manager = new SocketManager(pool, this.io, this);
        await this.load_size(pool);
        await this.map.load(pool);
        await this.load_agents(pool);
        await this.load_characters(pool);
        await this.load_orders(pool);
        await this.load_item_orders(pool);
        await this.load_battles(pool);
        await this.clear_dead_orders(pool);
    }

    async load_size(pool) {
        let size = await common.send_query(pool, constants.load_world_size_query);
        this.x = size.rows[0].x;
        this.y = size.rows[0].y;
    }

    async load_agents(pool) {
        await this.load_pops(pool);
    }

    async load_pops(pool) {
        let res = await common.send_query(pool, constants.load_pops_query);
        for (let i of res.rows) {
            let pop = new Pop(this);
            pop.load_from_json(i);
            this.agents[pop.id] = pop;
        }
        console.log('pops loaded')
    }

    async load_characters(pool) {
        let res = await common.send_query(pool, constants.load_chars_query);
        for (let i of res.rows) {
            let char = new Character(this);
            char.load_from_json(i);
            this.chars[char.id] = char;
        }
        console.log('characters loaded')
    }

    async load_orders(pool) {
        let res = await common.send_query(pool, constants.load_orders_query);
        for (let i of res.rows) {
            let order = new MarketOrder(this);
            order.load_from_json(i);
            this.orders[order.id] = order;
        }
        console.log('orders loaded')
    }

    async load_item_orders(pool) {
        let res = await common.send_query(pool, constants.load_item_orders_query);
        for (let i of res.rows) {
            let order = new OrderItem(this);
            order.load_from_json(i);
            this.item_orders[order.id] = order;
        }
        console.log('item orders loaded')
    }

    async load_battles(pool) {
        let res = await common.send_query(pool, constants.load_battles_query);
        for (let i of res.rows) {
            let battle = new Battle(this);
            battle.load_from_json(i);
            this.battles[battle.id] = battle;
        }
        console.log('battles loaded')
    }

    async clear_dead_orders(pool) {
        this.map.clear_dead_orders(pool);
    }

    async update(pool) {
        this.battle_tick += 1;
        if (this.battle_tick >= 2) {
            this.battle_tick = 0;

            for (let i = 0; i < this.x; i++) {
                for (let j = 0; j < this.y; j++) {
                    this.socket_manager.send_market_info(this.map.cells[i][j]);
                }
            }
        }

        this.pops_tick += 1;
        if (this.pops_tick >= 180) {
            this.pops_tick = 0;
            let keys = Object.keys(this.agents);
            keys.sort(function() {return Math.random() - 0.5});
            for (let i of keys) {
                await this.agents[i].update(pool);
            }
            // for (let i of Object.keys(this.agents)) {
            //     let agent = this.agents[i]
            //     console.log(agent.name.padEnd(15) + agent.savings.get().toString().padStart(10) + agent.data.price.toString().padStart(10) + agent.data.sold.toString().padStart(10))
            // }
            let market = this.map.cells[0][0].market;
            // console.log('meat'.padEnd(10) + market.guess_tag_cost('meat', 1).toString().padStart(10))
            // console.log('leather'.padEnd(10) + market.guess_tag_cost('leather', 1).toString().padStart(10))
            // console.log('clothes'.padEnd(10) + market.guess_tag_cost('clothes', 1).toString().padStart(10))
            // console.log('food'.padEnd(10) + market.guess_tag_cost('food', 1).toString().padStart(10))
        }
        
        
        for (let i in this.chars) {
            if (!this.chars[i].data.dead) {
                await this.chars[i].update(pool);
            }
        }
        if (this.battle_tick == 0){
            this.update_battles(pool)
        }

        if (this.map_tick >= 1) {
            await this.map.update_info(pool);
            this.map_tick = 0;
        } 
        this.map_tick += 1;
        await this.map.update(pool);

        
        this.socket_manager.update_user_list();

        if (this.vacuum_stage++ > 100) {
            common.send_query(pool, 'VACUUM market_orders');
            // console.log('vacuum');
            this.vacuum_stage = 0;
        }
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
                for (let i = 0; i < battle.ids.length; i++) {
                    let character = this.chars[battle.ids[i]];
                    if (character.data.is_player) {
                        this.socket_manager.send_to_character_user(character, 'battle-update', battle.get_data())
                        this.socket_manager.send_to_character_user(character, 'enemy-update', status);
                        log.forEach(log_entry => { this.socket_manager.send_to_character_user(character, 'battle-action', log_entry)});
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
                for (let i = 0; i < battle.ids.length; i++) {
                    let character = this.chars[battle.ids[i]];
                    if (character != undefined) {
                        if (character.data.is_player) {
                            this.socket_manager.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
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
        return x * this.y + y
    }

    // get_pops(pool) {
    //     var tmp = [];
    //     for (var i in this.agents) {
    //         if (i.is_pop) {
    //             tmp.push(i);
    //         }
    //     }
    //     return tmp;
    // }

    // async get_total_money() {
    //     var tmp = 0;
    //     for (var i in this.agents) {
    //         tmp += i.savings.get('money');
    //     }
    //     return tmp;
    // }

    async get_new_id(pool, str) {
        // console.log(str);
        var x = await common.send_query(pool, constants.get_id_query, [str]);
        x = x.rows[0];
        // console.log(x);
        x = x.last_id;
        x += 1;
        await common.send_query(pool, constants.set_id_query, [str, x]);
        return x;
    }

    async add_order(pool, order) {
        this.orders[order.id] = order;
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
                var user = this.user_manager.get_user_from_character(character);
                user.send_death_message()
                var id = await user.get_new_char(pool);
                this.chars[id] = user.character;
            }
            await character.delete_from_db(pool);
        }
        
        // this.chars[character.id] = null;
    }

    async create_monster(pool, monster_class, cell_id) {
        var monster = new monster_class(this);
        var id = await monster.init(pool, cell_id);
        this.chars[id] = monster;
        return monster;
    }

    async create_pop(pool, x, y, size, needs, race_tag, name, savings, state) {
        let pop = new Pop(this);
        let cell_id = this.get_cell_id_by_x_y(x, y)
        await pop.init(pool, cell_id, size, needs, race_tag, name, state)
        await pop.savings.inc(savings)
        await pop.save_to_db(pool)
        return pop
    }

    async create_battle(pool, attackers, defenders) {
        var battle = new Battle(this);
        var id = await battle.init(pool);
        for (let i = 0; i < attackers.length; i++) {
            await battle.add_fighter(pool, attackers[i], 0);
        }
        for (let i = 0; i < defenders.length; i++) {
            await battle.add_fighter(pool, defenders[i], 1);
        }
        this.battles[id] = battle;
        return battle;
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

    get_loot_tag(dice, dead_tag) {
        let tmp = 0
        // console.log(dead_tag)
        // console.log(loot_chance_weight[dead_tag])
        // console.log(total_loot_chance_weight[dead_tag] * dice)
        for (let i in loot_chance_weight[dead_tag]) {
            // console.log(i)
            tmp += loot_chance_weight[dead_tag][i];
            if (total_loot_chance_weight[dead_tag] * dice <= tmp) {
                return i
            }
        }
    }

    get_affix_tag(item_tag, dice) {
        let tmp = 0
        for (let i in loot_affixes_weight[item_tag]) {
            tmp += loot_affixes_weight[item_tag][i];
            if (total_affixes_weight[item_tag] * dice <= tmp) {
                return i
            }
        }
    }

    roll_affix(item_tag, level) {
        let dice = Math.random();
        let affix = {}
        affix.tag = this.get_affix_tag(item_tag, dice)
        let dice2 = Math.random();
        affix.tier = 1
        affix.tier += Math.floor(level * dice2 / 2)
        return affix;
    }

    roll_affixes(item, level) {
        if (item.affixes != undefined) {
            for (let i = 0; i < item.affixes; i++) {
                item['a' + i] = undefined
            }
            item.affixes = undefined;
        }
        let dice = Math.random()
        let num_of_affixes = 0
        if (dice * (1 + level / 10) > 0.5 ) {
            num_of_affixes += 1
        }
        if (dice * (1 + level / 100) > 0.9) {
            num_of_affixes += 1
        }
        item.affixes = num_of_affixes;
        for (let i = 0; i < num_of_affixes; i++) {
            item['a' + i] = this.roll_affix(item.tag, level)
        }
        return item
    }

    generate_loot(level, dead_tag) {
        let loot_dice = Math.random();
        if (loot_dice < 0.3) {
            return undefined;
        }
        let item = {};
        let tag_dice = Math.random();
        
        item.tag = this.get_loot_tag(tag_dice, dead_tag)  
        item = this.roll_affixes(item, level)
        // console.log(item, dead_tag)      
        return item;
    }    
    
    // eslint-disable-next-line no-unused-vars
    get_tick_death_rate(race) {
        return 0.001
    }

    // eslint-disable-next-line no-unused-vars
    get_tick_max_growth(race) {
        return 0.001
    }

    get_cell_x_y_by_id(id) {
        return {x: Math.floor(id / this.y), y: id % this.y}
    }

}