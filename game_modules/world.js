"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
var { constants } = require("./static_data/constants.js");
var common = require("./common.js");
const entity_manager_1 = require("./manager_classes/entity_manager");
const world_constants_1_1 = require("./static_data/world_constants_1");
const action_manager_1 = require("./manager_classes/action_manager");
const socket_manager_1 = require("./manager_classes/socket_manager");
const user_manager_1 = require("./manager_classes/user_manager");
const rat_1 = require("./base_game_classes/races/rat");
const ai_manager_1 = require("./manager_classes/ai_manager");
const materials_manager_1 = require("./manager_classes/materials_manager");
const market_items_1 = require("./market/market_items");
const graci_1 = require("./base_game_classes/races/graci");
const elo_1 = require("./base_game_classes/races/elo");
const item_tags_1 = require("./static_data/item_tags");
const items_set_up_1 = require("./static_data/items_set_up");
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
        this.ACTION_TIME = 2;
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
        this.socket_manager = new socket_manager_1.SocketManager(undefined, io, this, false);
        this.entity_manager = new entity_manager_1.EntityManager(this);
        this.ai_manager = new ai_manager_1.AiManager(this);
        this.territories = {};
    }
    async init(pool) {
        this.socket_manager = new socket_manager_1.SocketManager(pool, this.io, this, true);
        this.action_manager = new action_manager_1.ActionManager(this, pool);
        this.entity_manager = new entity_manager_1.EntityManager(this);
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
        for (let i = 1; i < 60; i++) {
            let test_rat = await this.entity_manager.create_new_character(pool, 'Mr. Rat ' + i, this.get_cell_id_by_x_y(6, 5), -1);
            await (0, rat_1.rat)(pool, test_rat);
        }
        for (let i = 1; i < 20; i++) {
            let test_graci = await this.entity_manager.create_new_character(pool, 'Her Majesty Graci ' + i, this.get_cell_id_by_x_y(13, 9), -1);
            await (0, graci_1.graci)(pool, test_graci);
        }
        for (let i = 1; i < 30; i++) {
            let test_elo = await this.entity_manager.create_new_character(pool, 'Sir Elodino ' + i, this.get_cell_id_by_x_y(18, 10), -1);
            await (0, elo_1.elo)(pool, test_elo);
        }
        // let ith_mages = await this.entity_manager.create_faction(pool, 'Mages of Ith')
        // let mayor = await this.entity_manager.create_new_character(pool, 'G\'Ith\'Ub', this.get_cell_id_by_x_y(0, 3), -1)
        // mayor.savings.inc(10000);
        // this.entity_manager.set_faction_leader(ith_colony, mayor)
        port_chunk.set_influence(ith_colony, 100);
        living_area.set_influence(ith_colony, 50);
        living_area.set_influence(steppe_rats, 50);
        /// test person
        {
            let test_person = await this.create_new_character(pool, 'Trader', this.get_cell_id_by_x_y(0, 3), -1);
            if ((0, market_items_1.nodb_mode_check)()) {
                test_person.change_hp(-90);
            }
            test_person.stash.inc(materials_manager_1.MEAT, 10);
            test_person.stash.inc(materials_manager_1.WOOD, 100);
            test_person.stash.inc(materials_manager_1.FOOD, 500);
            test_person.stash.inc(materials_manager_1.RAT_BONE, 100);
            test_person.stash.inc(materials_manager_1.WOOD, 100);
            test_person.stash.inc(materials_manager_1.RAT_SKIN, 100);
            test_person.stash.inc(materials_manager_1.ZAZ, 100);
            test_person.stash.inc(materials_manager_1.ELODINO_FLESH, 100);
            test_person.savings.set(5000);
            await test_person.buy(pool, materials_manager_1.MEAT, 100, 5);
            await test_person.sell(pool, materials_manager_1.FOOD, 200, 15);
            await test_person.sell(pool, materials_manager_1.ZAZ, 100, 200);
            let spear = new item_tags_1.Weapon(items_set_up_1.BONE_SPEAR_ARGUMENT);
            test_person.equip.add_weapon(spear);
            await market_items_1.AuctionManagement.sell(pool, this.entity_manager, this.socket_manager, test_person, "weapon", 0, 10, 10);
        }
        let cook = await this.create_new_character(pool, 'Cook', this.get_cell_id_by_x_y(0, 3), -1);
        cook.learn_perk("meat_master");
        cook.stash.inc(materials_manager_1.FOOD, 1000);
        await cook.sell(pool, materials_manager_1.FOOD, 500, 10);
        let monk = await this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1);
        monk.skills.noweapon.practice = 100;
        monk.learn_perk("advanced_unarmed");
        monk.changed = true;
        let forest_cook = await this.create_new_character(pool, 'Old cook', this.get_cell_id_by_x_y(7, 5), -1);
        forest_cook.stash.inc(materials_manager_1.FOOD, 1000);
        await forest_cook.sell(pool, materials_manager_1.FOOD, 500, 20);
        await forest_cook.buy(pool, materials_manager_1.MEAT, 500, 4);
        forest_cook.changed = true;
        let fletcher = await this.create_new_character(pool, 'Fletcher', this.get_cell_id_by_x_y(3, 3), -1);
        fletcher.stash.inc(materials_manager_1.ARROW_BONE, 20000);
        fletcher.savings.inc(2000);
        await fletcher.sell(pool, materials_manager_1.ARROW_BONE, 10000, 3);
        await fletcher.buy(pool, materials_manager_1.RAT_BONE, 1000, 1);
        await fletcher.buy(pool, materials_manager_1.WOOD, 1000, 2);
        fletcher.changed = true;
        let spearman = await this.create_new_character(pool, 'Spearman', this.get_cell_id_by_x_y(3, 6), -1);
        spearman.skills.polearms.practice = 100;
        spearman.learn_perk("advanced_polearm");
        let spear = new item_tags_1.Weapon(items_set_up_1.BONE_SPEAR_ARGUMENT);
        spearman.equip.data.weapon = spear;
        spearman.changed = true;
        let meat_bag = await this.create_new_character(pool, 'Meat Bag', this.get_cell_id_by_x_y(0, 3), -1);
        meat_bag.stash.inc(materials_manager_1.MEAT, 200);
        await meat_bag.sell(pool, materials_manager_1.MEAT, 10, 10);
        // meat_bag.change_hp(-99)
        let mage = await this.create_new_character(pool, 'Mage', this.get_cell_id_by_x_y(1, 5), -1);
        mage.skills.magic_mastery.practice = 100;
        mage.learn_perk('mage_initiation');
        mage.learn_perk('magic_bolt');
        mage.stash.inc(materials_manager_1.ZAZ, 300);
        mage.savings.inc(30000);
        await mage.sell(pool, materials_manager_1.ZAZ, 200, 50);
        await mage.buy(pool, materials_manager_1.ELODINO_FLESH, 200, 50);
        await mage.buy(pool, materials_manager_1.GRACI_HAIR, 10, 1000);
        mage.changed = true;
    }
    async load(pool) {
        this.socket_manager = new socket_manager_1.SocketManager(pool, this.io, this, true);
        this.entity_manager = new entity_manager_1.EntityManager(this);
        this.action_manager = new action_manager_1.ActionManager(this, pool);
        await this.entity_manager.load(pool);
        await this.load_size(pool);
    }
    async load_size(pool) {
        let size = await common.send_query(pool, constants.load_world_size_query);
        this.x = size.rows[0].x;
        this.y = size.rows[0].y;
    }
    async update(pool, dt) {
        await this.entity_manager.update_battles(pool);
        await this.entity_manager.update_cells(pool, dt);
        await this.entity_manager.update_factions(pool);
        await this.entity_manager.update_areas(pool);
        await this.entity_manager.update_chars(pool, dt);
        this.socket_manager.update_user_list();
    }
    get_stash_tags_list() {
        return materials_manager_1.materials.get_materials_list();
    }
    get_materials_json() {
        return materials_manager_1.materials.get_materials_json();
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
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            // @ts-ignore: Unreachable code error
            global.last_id += 1;
            // @ts-ignore: Unreachable code error
            return global.last_id;
        }
        // console.log(str);
        var x = await common.send_query(pool, constants.get_id_query, [str]);
        x = x.rows[0];
        // console.log(x);
        x = x.last_id;
        x += 1;
        await common.send_query(pool, constants.set_id_query, [str, x]);
        return x;
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
    async create_battle(pool, attackers, defenders) {
        return await this.entity_manager.create_battle(pool, attackers, defenders);
    }
    async load_character_data_from_db(pool, char_id) {
        return await this.entity_manager.load_character_data_from_db(pool, char_id);
    }
    async load_character_data_to_memory(pool, data) {
        return await this.entity_manager.load_character_data_to_memory(pool, data);
    }
    async create_new_character(pool, name, cell_id, user_id) {
        return await this.entity_manager.create_new_character(pool, name, cell_id, user_id);
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
        if ((x < 0) || (x >= this.x)) {
            return false;
        }
        if ((y < 0) || (y >= this.y)) {
            return false;
        }
        let data = this.constants.terrain;
        if (!(x in data)) {
            return false;
        }
        let ter = data[x][y];
        let cell = this.get_cell(x, y);
        if (cell == undefined)
            return true;
        if (ter == 'coast' || ter == 'steppe' || ter == 'city') {
            if (cell.development.rupture == 1 || cell.development.wild == 3) {
                return false;
            }
            return true;
        }
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
}
exports.World = World;
