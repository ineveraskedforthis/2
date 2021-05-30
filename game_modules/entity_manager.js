var {constants} = require("./static_data/constants.js");
var common = require("./common.js");


var Map = require("./map.js");
var {BattleReworked2} = require("./battle.js");
const Battle = BattleReworked2
var Character = require("./base_game_classes/character.js");
// var Pop = require("./agents/pop.js");
var MarketOrder = require("./market/market_order");

const { OrderItem } = require("./market/market_items.js");
const Area = require("./base_game_classes/area.js");
const Faction = require("./base_game_classes/faction.js");
const Quest = require("./base_game_classes/quest.js");


module.exports = class EntityManager {
    constructor(world) {
        this.world = world;
        this.map = new Map(this.world);
        this.agents = {};
        this.chars = {};
        this.orders = {};
        this.item_orders = {};
        this.battles = {};
        this.areas = {}
        this.factions = {}
        this.quests = {}
    }

    async init(pool) {
        await this.map.init(pool);
    }

    async load(pool) {
        await this.map.load(pool);
        // await this.load_agents(pool);
        await this.load_characters(pool);
        await this.load_orders(pool);
        await this.load_item_orders(pool);
        await this.load_battles(pool);
        await this.load_areas(pool);
        await this.load_factions(pool);
        await this.load_quests(pool);
        await this.clear_dead_orders(pool);
    }

    // async load_agents(pool) {
    //     await this.load_pops(pool);
    // }

    // async load_pops(pool) {
    //     let res = await common.send_query(pool, constants.load_pops_query);
    //     for (let i of res.rows) {
    //         let pop = new Pop(this.world);
    //         pop.load_from_json(i);
    //         this.agents[pop.id] = pop;
    //     }
    //     console.log('pops loaded')
    // }

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

    async load_areas(pool) {
        let res = await common.send_query(pool, constants.load_areas_query);
        for (let i of res.rows) {
            let obj = new Area(this.world);
            obj.load_from_json(i);
            this.areas[obj.id] = obj;
        }
        console.log('areas loaded')
    }

    async load_factions(pool) {
        let res = await common.send_query(pool, constants.load_factions_query);
        for (let i of res.rows) {
            let faction = new Faction(this.world);
            faction.load_from_json(i);
            this.factions[faction.id] = faction;
        }
        console.log('factions loaded')
    }

    async load_quests(pool) {
        let res = await common.send_query(pool, constants.load_quests_query);
        for (let i of res.rows) {
            let quest = new Quest(this.world);
            quest.load_from_json(i);
            this.quests[quest.id] = quest;
        }
        console.log('quests loaded')
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
    }

    async update_chars(pool) {
        for (let i in this.chars) {
            if (!this.chars[i].is_dead()) {
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
                await battle.update(pool)
            } else {

                
                battle.clean_up_battle()
                await this.delete_battle(pool, battle.id);
            }
        }
    }

    async update_factions(pool) {
    }

    set_faction_leader(faction, leader) {
        faction.set_leader(leader)
        leader.set_faction(faction)
    }

    async update_areas(pool) {
        for (let i in this.areas) {
            let area = this.areas[i]
            for (let faction_id in area.faction_influence) {
                let faction = this.factions[faction_id]
                let leader = this.chars[faction.leader_id]
                if ((faction.tag != 'steppe_rats') & (area.get_influence('steppe_rats') >= 10)) {
                    let quest_money_reward = Math.floor(area.get_influence('steppe_rats') / 10)
                    let quest_reputation_reward = Math.floor(area.get_influence('steppe_rats') / 5)
                    await this.new_quest(pool, leader, 'meat', quest_money_reward, quest_reputation_reward)
                }
            }
        }
    }
    
    async new_quest(pool, leader, item_tag, money_reward, reputation_reward, tag) {
        let quest = await this.create_quest(pool, item_tag, money_reward, reputation_reward);
        leader.add_quest(quest, tag)
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
        if (!character.is_dead()) {
            await character.clear_orders(pool);
            await character.set_flag('dead', true);
            console.log('kill ' + char_id);
            if (character.is_player()) {
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
            battle.add_fighter(attackers[i], 0, {x: 0, y:0});
        }
        for (let i = 0; i < defenders.length; i++) {
            battle.add_fighter(defenders[i], 1, {x: Math.random() * 5 - 2.5, y: Math.random() * 4 + 5});
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

    async create_area(pool, tag) {
        let area = new Area(this.world)
        let id = await area.init(pool, tag, {}, {});
        this.areas[id] = area;
        return area
    }

    async create_faction(pool, tag) {
        let faction = new Faction(this.world)
        let id = await faction.init(pool, tag)
        this.factions[id] = faction;
        return faction
    }

    async create_quest(pool, item, reward_money, reward_reputation) {
        let quest = new Quest(this.world)
        let id = await quest.init(pool, item, reward_money, reward_reputation)
        this.quests[id] = quest;
        return quest;
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