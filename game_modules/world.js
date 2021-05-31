"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
var basic_characters = require("./basic_characters.js");
var { constants } = require("./static_data/constants.js");
var common = require("./common.js");
var EntityManager = require("./entity_manager.js");
const world_constants_1_1 = require("./static_data/world_constants_1");
const action_manager_1 = require("./manager_classes/action_manager");
const socket_manager_1 = require("./socket_manager");
const user_manager_1 = require("./user_manager");
// const total_loot_chance_weight: {[index: tmp]: number} = {}
// for (let i in loot_chance_weight) {
//     total_loot_chance_weight[i] = 0
//     for (let j in loot_chance_weight[i]) {
//         total_loot_chance_weight[i] += loot_chance_weight[i][j]
//     }
// }
// var total_affixes_weight = {}
// for (let tag in loot_affixes_weight) {
//     total_affixes_weight[tag] = 0
//     for (let i in loot_affixes_weight[tag]) {
//         total_affixes_weight[tag] += loot_affixes_weight[tag][i]
//     }
// }
class World {
    constructor(io, x, y) {
        this.io = io;
        this.x = x;
        this.y = y;
        this.constants = world_constants_1_1.CONSTS;
        this.user_manager = new user_manager_1.UserManager(this);
        this.action_manager = new action_manager_1.ActionManager(this, undefined);
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
        this.socket_manager = new socket_manager_1.SocketManager(undefined, io, this);
        this.entity_manager = undefined;
        this.territories = {};
    }
    async init(pool) {
        this.socket_manager = new socket_manager_1.SocketManager(pool, this.io, this);
        this.action_manager = new action_manager_1.ActionManager(this, pool);
        this.entity_manager = new EntityManager(this);
        await this.entity_manager.init(pool);
        await common.send_query(pool, constants.save_world_size_query, [this.x, this.y]);
        // await this.generate_territories()
        await this.add_starting_agents(pool);
    }
    async add_starting_agents(pool) {
        let port_chunk = await this.entity_manager.create_area(pool, 'port');
        let living_area = await this.entity_manager.create_area(pool, 'living_area');
        let ith_colony = await this.entity_manager.create_faction(pool, 'ith_colony');
        let steppe_rats = await this.entity_manager.create_faction(pool, 'steppe_rats');
        // let ith_mages = await this.entity_manager.create_faction(pool, 'Mages of Ith')
        let mayor = await this.entity_manager.create_new_character(pool, 'G\'Ith\'Ub', this.get_cell_id_by_x_y(0, 3), -1, undefined);
        mayor.savings.inc(10000);
        this.entity_manager.set_faction_leader(ith_colony, mayor);
        port_chunk.set_influence(ith_colony, 100);
        living_area.set_influence(ith_colony, 50);
        living_area.set_influence(steppe_rats, 50);
    }
    async load(pool) {
        this.socket_manager = new socket_manager_1.SocketManager(pool, this.io, this);
        this.entity_manager = new EntityManager(this);
        await this.entity_manager.load(pool);
        await this.load_size(pool);
    }
    async load_size(pool) {
        let size = await common.send_query(pool, constants.load_world_size_query);
        this.x = size.rows[0].x;
        this.y = size.rows[0].y;
    }
    async update(pool, dt) {
        await this.entity_manager.update_battles(pool, dt);
        // don't ask any questions about variable names
        this.battle_tick += 1;
        if (this.battle_tick >= 2) {
            this.battle_tick = 0;
        }
        if (this.battle_tick == 0) {
            // this.socket_manager.send_all_market_info()
        }
        this.pops_tick += 1;
        if (this.pops_tick >= 180) {
            this.pops_tick = 0;
            await this.entity_manager.update_agents(pool, dt);
            await this.entity_manager.update_factions(pool, dt);
            await this.entity_manager.update_areas(pool, dt);
        }
        await this.entity_manager.update_chars(pool, dt);
        if (this.map_tick >= 1) {
            await this.entity_manager.update_map(pool);
            this.map_tick = 0;
        }
        this.map_tick += 1;
        this.socket_manager.update_user_list();
    }
    get_stash_tags_list() {
        let data = world_constants_1_1.TAGS;
        return data;
    }
    get_cell_teacher(x, y) {
        return undefined;
    }
    get_char_from_id(id) {
        return this.entity_manager.chars[id];
    }
    get_character_by_id(id) {
        return this.entity_manager.chars[id];
    }
    get_battle_from_id(id) {
        return this.entity_manager.battles[id];
    }
    get_cell(x, y) {
        return this.entity_manager.get_cell(x, y);
    }
    get_cell_by_id(id) {
        return this.entity_manager.get_cell_by_id(id);
    }
    get_cell_id_by_x_y(x, y) {
        return this.entity_manager.get_cell_id_by_x_y(x, y);
    }
    get_cell_x_y_by_id(id) {
        return { x: Math.floor(id / this.y), y: id % this.y };
    }
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
        this.entity_manager.add_order(pool, order);
    }
    add_item_order(order) {
        this.entity_manager.add_item_order(order);
    }
    get_order(order_id) {
        return this.entity_manager.get_order(order_id);
    }
    get_item_order(id) {
        return this.entity_manager.get_item_order(id);
    }
    get_from_id_tag(id, tag) {
        return this.entity_manager.get_from_id_tag(id, tag);
    }
    async kill(pool, char_id) {
        await this.entity_manager.kill(pool, char_id);
    }
    async create_monster(pool, monster_class, cell_id) {
        return await this.entity_manager.create_monster(pool, monster_class, cell_id);
    }
    async create_battle(pool, attackers, defenders) {
        return await this.entity_manager.create_battle(pool, attackers, defenders);
    }
    async load_character_data_from_db(pool, char_id) {
        return await this.entity_manager.load_character_data_from_db(pool, char_id);
    }
    async load_character_data_to_memory(pool, data) {
        return await this.entity_manager.load_character_data_to_memory(pool, data);
    }
    async create_new_character(pool, name, cell_id, user_id, territory_tag) {
        return await this.entity_manager.create_new_character(pool, name, cell_id, user_id, territory_tag);
    }
    // get_loot_tag(dice, dead_tag) {
    //     let tmp = 0
    //     // console.log(dead_tag)
    //     // console.log(loot_chance_weight[dead_tag])
    //     // console.log(total_loot_chance_weight[dead_tag] * dice)
    //     for (let i in loot_chance_weight[dead_tag]) {
    //         // console.log(i)
    //         tmp += loot_chance_weight[dead_tag][i];
    //         if (total_loot_chance_weight[dead_tag] * dice <= tmp) {
    //             return i
    //         }
    //     }
    // }
    // get_affix_tag(item_tag: item_tag, dice):affix_tag {
    //     let tmp = 0
    //     for (let affix in loot_affixes_weight[item_tag]) {
    //         if (affix in loot_affixes_weight[item_tag]) {
    //             tmp += loot_affixes_weight[item_tag][affix];
    //             if (total_affixes_weight[item_tag] * dice <= tmp) {
    //                 return affix
    //             }
    //         }            
    //     }
    // }
    // roll_affix(item_tag: item_tag, level: number) {
    //     let dice = Math.random();
    //     let dice2 = Math.random();
    //     let affix = {tag: this.get_affix_tag(item_tag, dice), tier: 1 + Math.floor(level * dice2 / 2)}
    //     return affix;
    // }
    // roll_affixes(item: any, level: number) {
    //     if (item.affixes != undefined) {
    //         for (let i = 0; i < item.affixes; i++) {
    //             item['a' + i] = undefined
    //         }
    //         item.affixes = undefined;
    //     }
    //     let dice = Math.random()
    //     let num_of_affixes = 0
    //     if (dice * (1 + level / 10) > 0.5 ) {
    //         num_of_affixes += 1
    //     }
    //     if (dice * (1 + level / 100) > 0.9) {
    //         num_of_affixes += 1
    //     }
    //     item.affixes = num_of_affixes;
    //     for (let i = 0; i < num_of_affixes; i++) {
    //         item['a' + i] = this.roll_affix(item.tag, level)
    //     }
    //     return item
    // }
    // generate_loot(level: number, dead_tag: any) {
    //     let loot_dice = Math.random();
    //     if (loot_dice < 0.3) {
    //         return undefined;
    //     }
    //     let tag_dice = Math.random();
    //     let item = {tag: this.get_loot_tag(tag_dice, dead_tag)};      
    //     item = this.roll_affixes(item, level)
    //     // console.log(item, dead_tag)      
    //     return item;
    // }    
    // // eslint-disable-next-line no-unused-vars
    // get_tick_death_rate(race) {
    //     return 0.001
    // }
    // // eslint-disable-next-line no-unused-vars
    // get_tick_max_growth(race) {
    //     return 0.001
    // }
    get_territory(x, y) {
        let tmp = x + '_' + y;
        let data = this.constants.territories;
        for (let i in this.constants.territories) {
            if (data[i].indexOf(tmp) > -1) {
                return i;
            }
        }
        return undefined;
    }
    get_id_from_territory(tag) {
        let data = this.constants.id_terr;
        return data[tag];
    }
    can_move(x, y) {
        let ter = this.get_territory(x, y);
        if (ter == undefined) {
            return false;
        }
        let data = this.constants.move;
        return data[ter];
    }
    get_enemy(x, y) {
        let terr_tag = this.get_territory(x, y);
        if (terr_tag == undefined) {
            return;
        }
        let data = this.constants.enemies;
        let tag = data[terr_tag];
        return tag;
    }
    create_quest() {
    }
    async attack_local_monster(pool, char, enemies_amount = 1) {
        if (enemies_amount == 0) {
            return undefined;
        }
        let cell = char.get_cell();
        let terr_tag = this.get_territory(cell.i, cell.j);
        let enemy_tag = this.get_enemy(cell.i, cell.j);
        if ((enemy_tag == undefined) || (terr_tag == undefined)) {
            return undefined;
        }
        let enemies = [];
        for (let i = 0; i < enemies_amount; i++) {
            enemies.push(await this.create_monster(pool, basic_characters[enemy_tag], char.cell_id));
        }
        let battle = await this.create_battle(pool, [char], enemies);
        return battle;
    }
}
exports.World = World;
