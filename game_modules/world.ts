// var {constants} = require("./static_data/constants.js");
// var common = require("./common.js");

// export interface PgPool {
    
// }

// import {EntityManager} from './manager_classes/entity_manager'
// import {CONSTS} from './static_data/world_constants_1';
// import {MarketOrder, market_order_index} from './market/market_order'
// import { Character } from "./base_game_classes/character/character";
// import { BattleReworked2 } from "./battle";
// import { ActionManager } from "./manager_classes/action_manager";
// import {SocketManager} from './client_communication/socket_manager'
// import {UserManager} from './manager_classes/user_manager'
// import { Cell } from "./map/cell";
// import { rat } from "./base_game_classes/character/races/rat";
// import { AiManager } from "./manager_classes/ai_manager";
// import { ARROW_BONE, ELODINO_FLESH, FOOD, GRACI_HAIR, materials, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./manager_classes/materials_manager";
// import { money } from "./base_game_classes/savings";
// import { AuctionManagement, auction_order_id, nodb_mode_check, OrderItem } from "./market/market_items";
// import { graci } from "./base_game_classes/character/races/graci";
// import { elo } from "./base_game_classes/character/races/elo";
// import { Weapon } from './static_data/item_tags';
// import { BONE_SPEAR_ARGUMENT } from './base_game_classes/items/items_set_up';
// import { affix } from './base_game_classes/affix';
// import { init_battle_control } from '../static/modules/battle_image_init';

// // const total_loot_chance_weight: {[index: tmp]: number} = {}
// // for (let i in loot_chance_weight) {
// //     total_loot_chance_weight[i] = 0
// //     for (let j in loot_chance_weight[i]) {
// //         total_loot_chance_weight[i] += loot_chance_weight[i][j]
// //     }
// // }

// // var total_affixes_weight = {}
// // for (let tag in loot_affixes_weight) {
// //     total_affixes_weight[tag] = 0
// //     for (let i in loot_affixes_weight[tag]) {
// //         total_affixes_weight[tag] += loot_affixes_weight[tag][i]
// //     }
// // }


// export class World {
//     io: any;
//     x: number
//     y: number
//     constants: typeof CONSTS;
//     BASE_BATTLE_RANGE: number;
//     HISTORY_PRICE: any;
//     vacuum_stage:number;
//     battle_tick: number;
//     pops_tick: number;
//     map_tick: number;
//     territories: {[_: string]: any}
//     // spear_argument: WeaponConstructorArgument
//     // bone_spear_argument: WeaponConstructorArgument
//     // rat_skin_pants_argument: ArmourConstructorArgument
//     // rat_skin_gloves_argument: ArmourConstructorArgument
//     // rat_skin_armour_argument: ArmourConstructorArgument
//     // rat_skin_helmet_argument: ArmourConstructorArgument

//     // materials: {[_: string]: material_index}

//     ACTION_TIME: number

//     constructor(x: number, y: number) {
//         this.x = x;
//         this.y = y;

//         this.ACTION_TIME = 2

//         this.constants = CONSTS;
//         this.BASE_BATTLE_RANGE = 10;
//         this.HISTORY_PRICE = {};
//         this.HISTORY_PRICE['food'] = 50;
//         this.HISTORY_PRICE['clothes'] = 50;
//         this.HISTORY_PRICE['leather'] = 50;
//         this.HISTORY_PRICE['meat'] = 50;
//         this.HISTORY_PRICE['tools'] = 0;

//         this.vacuum_stage = 0;
//         this.battle_tick = 0;
//         this.pops_tick = 1000;
//         this.map_tick = 0;
//         this.territories = {}
//     }

//      init() {
//         this.socket_manager = new SocketManager(pool, this.io, this, true);
//         this.action_manager = new ActionManager(this, pool)
//         this.entity_manager = new EntityManager(this);
        

//          this.entity_manager.init(pool);
//          common.send_query(pool, constants.save_world_size_query, [this.x, this.y])
        
        
//         //  this.generate_territories()
//          this.add_starting_agents(pool);
//     }


//      add_starting_agents() {
//         let port_chunk =  this.entity_manager.create_area(pool, 'port')
//         let living_area =  this.entity_manager.create_area(pool, 'living_area')

//         let ith_colony =  this.entity_manager.create_faction(pool, 'ith_colony')
//         let steppe_rats =  this.entity_manager.create_faction(pool, 'steppe_rats')

//         for (let i = 1; i < 60; i++) {
//             let test_rat =  this.entity_manager.create_new_character(pool, 'Mr. Rat ' + i, this.get_cell_id_by_x_y(6, 5), -1)
//              rat(pool, test_rat)
//         }

//         for (let i = 1; i < 20; i++) {
//             let test_graci =  this.entity_manager.create_new_character(pool, 'Her Majesty Graci ' + i, this.get_cell_id_by_x_y(13, 9), -1)
//              graci(pool, test_graci)
//         }

//         for (let i = 1; i < 30; i++) {
//             let test_elo =  this.entity_manager.create_new_character(pool, 'Sir Elodino ' + i, this.get_cell_id_by_x_y(18, 10), -1)
//              elo(pool, test_elo)
//         }
        
//         // let ith_mages =  this.entity_manager.create_faction(pool, 'Mages of Ith')

//         // let mayor =  this.entity_manager.create_new_character(pool, 'G\'Ith\'Ub', this.get_cell_id_by_x_y(0, 3), -1)
//         // mayor.savings.inc(10000);

//         // this.entity_manager.set_faction_leader(ith_colony, mayor)

//         port_chunk.set_influence(ith_colony, 100)
//         living_area.set_influence(ith_colony, 50)
//         living_area.set_influence(steppe_rats, 50)


//         /// test person

//         let starting_cell_id = this.get_cell_id_by_x_y(0, 3)
        
//         {
//             let test_person =  this.create_new_character(pool, 'Trader', starting_cell_id, -1)
//             if (nodb_mode_check()) {test_person.change_hp(-90)}
            
//             test_person.stash.inc(MEAT, 10)
//             test_person.stash.inc(WOOD, 100)
//             test_person.stash.inc(FOOD, 500)
//             test_person.stash.inc(RAT_BONE, 100)
//             test_person.stash.inc(WOOD, 100)
//             test_person.stash.inc(RAT_SKIN, 100)
//             test_person.stash.inc(ZAZ, 100)
//             test_person.stash.inc(ELODINO_FLESH, 100)
//             test_person.savings.set(5000 as money)
//             test_person.faction_id = 3
//              test_person.buy(pool, MEAT, 100, 5 as money)
//              test_person.sell(pool, FOOD, 200, 15 as money)
//              test_person.sell(pool, ZAZ, 100, 200 as money)
//             let spear = new Weapon(BONE_SPEAR_ARGUMENT)
//             spear.affixes.push(new affix('daemonic', 1))
//             let id  = test_person.equip.add_weapon(spear)
//              AuctionManagement.sell(pool, this.entity_manager, this.socket_manager, test_person, "weapon", id, 10 as money, 10 as money)
//         }


//         let armour_master =  this.create_new_character(pool, 'Armour master', starting_cell_id, -1)
//         armour_master.skills.clothier = 100
//         armour_master.skills.perks.skin_armour_master = true
//         armour_master.stash.inc(RAT_SKIN, 40)
//         armour_master.savings.inc(1000 as money)
//         armour_master.faction_id = 3



//         let cook =  this.create_new_character(pool, 'Cook', starting_cell_id, -1)
//         cook.learn_perk("meat_master")
//         cook.skills.cooking = 100
//         cook.stash.inc(FOOD, 10)
//         cook.savings.inc(500 as money)
//         cook.faction_id = 3
//         //  cook.sell(pool, FOOD, 500, 10 as money)



//         let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
//         monk.skills.noweapon = 100
//         monk.learn_perk("advanced_unarmed")
//         monk.faction_id = 3
//         monk.changed = true

//         let forest_cook =  this.create_new_character(pool, 'Old cook', this.get_cell_id_by_x_y(7, 5), -1)
//         forest_cook.stash.inc(FOOD, 10)
//         forest_cook.savings.inc(500 as money)
//         forest_cook.skills.cooking = 100
//         forest_cook.learn_perk("meat_master")
//         forest_cook.faction_id = 3
        

//         let fletcher =  this.create_new_character(pool, 'Fletcher', this.get_cell_id_by_x_y(3, 3), -1)
//         fletcher.stash.inc(ARROW_BONE, 20)
//         fletcher.savings.inc(1000 as money)
//         fletcher.learn_perk('fletcher')
//         fletcher.changed = true
//         fletcher.faction_id = 3

//         let spearman =  this.create_new_character(pool, 'Spearman', this.get_cell_id_by_x_y(3, 6), -1)
//         spearman.skills.polearms = 100
//         spearman.learn_perk("advanced_polearm")
//         let spear = new Weapon(BONE_SPEAR_ARGUMENT)
//         spearman.equip.data.weapon = spear
//         spearman.changed = true
//         spearman.faction_id = 3
        

//         let meat_bag =  this.create_new_character(pool, 'Meat Bag', this.get_cell_id_by_x_y(0, 3), -1)
//         meat_bag.stash.inc(MEAT, 200)
//          meat_bag.sell(pool, MEAT, 10, 10 as money)
//         if (nodb_mode_check()) {meat_bag.change_hp(-99)}
//         meat_bag.faction_id = 3

//         let mage =  this.create_new_character(pool, 'Mage', this.get_cell_id_by_x_y(1, 5), -1)
//         mage.skills.magic_mastery = 100
//         mage.learn_perk('mage_initiation')
//         mage.learn_perk('magic_bolt')
//         mage.stash.inc(ZAZ, 300)
//         mage.savings.inc(30000 as money)
//          mage.sell(pool, ZAZ, 200, 50 as money)
//          mage.buy(pool, ELODINO_FLESH, 200, 50 as money)
//          mage.buy(pool, GRACI_HAIR, 10, 1000 as money)
//         mage.changed = true
//         mage.faction_id = 3
//     }


//      load() {
//         this.socket_manager = new SocketManager(pool, this.io, this, true);
//         this.entity_manager = new EntityManager(this);
//         this.action_manager = new ActionManager(this, pool)
//          this.entity_manager.load(pool);
//          this.load_size(pool);
//     }

//      load_size() {
//         let size =  common.send_query(pool, constants.load_world_size_query);
//         this.x = size.rows[0].x;
//         this.y = size.rows[0].y;
//     }

//      update(dt: number) {

//          this.entity_manager.update_battles(pool)
//          this.entity_manager.update_cells(pool, dt)
//          this.entity_manager.update_factions(pool)
//          this.entity_manager.update_areas(pool)
//          this.entity_manager.update_chars(pool, dt)
        
//         this.socket_manager.update_user_list();
//     }

    

//     get_cell_teacher(x: number, y: number) {
//         return undefined
//     }

//     get_char_from_id(id: number): Character {
//         return this.entity_manager.chars[id]
//     }

//     get_character_by_id(id: number): Character {
//         return this.entity_manager.chars[id]
//     }

//     get_battle_from_id(id: number): BattleReworked2 {
//         return this.entity_manager.battles[id]
//     }

//     get_cell(x: number, y: number) {
//         return this.entity_manager.get_cell(x, y);
//     }

//     get_cell_by_id(id: number) {
//         return this.entity_manager.get_cell_by_id(id);
//     }

//     get_cell_id_by_x_y(x: number, y: number) {
//         return this.entity_manager.get_cell_id_by_x_y(x, y);
//     }

//     get_cell_x_y_by_id(id: number) {
//         return {x: Math.floor(id / this.y), y: id % this.y}
//     }

//      get_new_id(str: string) {
//          // @ts-ignore: Unreachable code error
//         if (global.flag_nodb) {
//             // @ts-ignore: Unreachable code error
//             global.last_id += 1
//             // @ts-ignore: Unreachable code error
//             return global.last_id
//         }
//         // console.log(str);
//         var x =  common.send_query(pool, constants.get_id_query, [str]);
//         x = x.rows[0];
//         // console.log(x);
//         x = x.last_id;
//         x += 1;
//          common.send_query(pool, constants.set_id_query, [str, x]);
//         return x;
//     }

//     add_item_order(order: OrderItem) {
//         this.entity_manager.add_item_order(order);
//     }

//     get_order (order_id: market_order_index) {
//         return this.entity_manager.get_order(order_id);
//     }

//     get_item_order (id: auction_order_id) {
//         return this.entity_manager.get_item_order(id);
//     }

//     get_from_id_tag(id: number, tag: 'chara'|'cell'){
//         return this.entity_manager.get_from_id_tag(id, tag)
//     }

//      kill(char_id: number) {
//          this.entity_manager.kill(pool, char_id)
//     }

//      create_battle(attackers: Character[], defenders: Character[]) {
//         return  this.entity_manager.create_battle(pool, attackers, defenders)
//     }

//      load_character_data_from_db(char_id: number) {
//         return  this.entity_manager.load_character_data_from_db(pool, char_id)
//     }

//      load_character_data_to_memory(data: number) {
//         return  this.entity_manager.load_character_data_to_memory(pool, data)
//     }

//      create_new_character(name: string, cell_id: number, user_id: number): Promise<Character> {
//         return  this.entity_manager.create_new_character(pool, name, cell_id, user_id)
//     }

//     // get_loot_tag(dice, dead_tag) {
//     //     let tmp = 0
//     //     // console.log(dead_tag)
//     //     // console.log(loot_chance_weight[dead_tag])
//     //     // console.log(total_loot_chance_weight[dead_tag] * dice)
//     //     for (let i in loot_chance_weight[dead_tag]) {
//     //         // console.log(i)
//     //         tmp += loot_chance_weight[dead_tag][i];
//     //         if (total_loot_chance_weight[dead_tag] * dice <= tmp) {
//     //             return i
//     //         }
//     //     }
//     // }

//     // get_affix_tag(item_tag: item_tag, dice):affix_tag {
//     //     let tmp = 0
//     //     for (let affix in loot_affixes_weight[item_tag]) {
//     //         if (affix in loot_affixes_weight[item_tag]) {
//     //             tmp += loot_affixes_weight[item_tag][affix];
//     //             if (total_affixes_weight[item_tag] * dice <= tmp) {
//     //                 return affix
//     //             }
//     //         }            
//     //     }
//     // }

//     // roll_affix(item_tag: item_tag, level: number) {
//     //     let dice = Math.random();
//     //     let dice2 = Math.random();
//     //     let affix = {tag: this.get_affix_tag(item_tag, dice), tier: 1 + Math.floor(level * dice2 / 2)}
//     //     return affix;
//     // }

//     // roll_affixes(item: any, level: number) {
//     //     if (item.affixes != undefined) {
//     //         for (let i = 0; i < item.affixes; i++) {
//     //             item['a' + i] = undefined
//     //         }
//     //         item.affixes = undefined;
//     //     }
//     //     let dice = Math.random()
//     //     let num_of_affixes = 0
//     //     if (dice * (1 + level / 10) > 0.5 ) {
//     //         num_of_affixes += 1
//     //     }
//     //     if (dice * (1 + level / 100) > 0.9) {
//     //         num_of_affixes += 1
//     //     }
//     //     item.affixes = num_of_affixes;
//     //     for (let i = 0; i < num_of_affixes; i++) {
//     //         item['a' + i] = this.roll_affix(item.tag, level)
//     //     }
//     //     return item
//     // }

//     // generate_loot(level: number, dead_tag: any) {
//     //     let loot_dice = Math.random();
//     //     if (loot_dice < 0.3) {
//     //         return undefined;
//     //     }
//     //     let tag_dice = Math.random();
//     //     let item = {tag: this.get_loot_tag(tag_dice, dead_tag)};      
//     //     item = this.roll_affixes(item, level)
//     //     // console.log(item, dead_tag)      
//     //     return item;
//     // }    
    
//     // // eslint-disable-next-line no-unused-vars
//     // get_tick_death_rate(race) {
//     //     return 0.001
//     // }

//     // // eslint-disable-next-line no-unused-vars
//     // get_tick_max_growth(race) {
//     //     return 0.001
//     // }

//     get_territory(x: number, y: number) {
//         let tmp = x + '_' + y;
//         let data:{[_: string]: any} =  this.constants.territories
//         for (let i in this.constants.territories) {
//             if (data[i].indexOf(tmp) > -1) {
//                 return i
//             }
//         }
//         return undefined
//     }

//     get_id_from_territory(tag: string): number {
//         let data:{[_: string]: any} = this.constants.id_terr
//         return data[tag]
//     }



//     get_enemy(x: number, y: number) {
//         let terr_tag = this.get_territory(x, y)
//         if (terr_tag == undefined) {
//             return
//         }
//         let data:{[_: string]: string} = this.constants.enemies
//         let tag = data[terr_tag];
//         return tag;
//     }

//     create_quest() {
        
//     }

//     //  attack_local_monster(pool:any, char: Character, enemies_amount = 1): Promise<(BattleReworked2 | undefined)> {
//     //     if (enemies_amount == 0) {
//     //         return undefined
//     //     }
//     //     const cell = Convert.character_to_cell(char)
//     //     if (cell == undefined) {
//     //         return
//     //     }
//     //     let terr_tag = this.get_territory(cell.i, cell.j)
//     //     let enemy_tag = this.get_enemy(cell.i, cell.j)
//     //     if ((enemy_tag == undefined) || (terr_tag == undefined)) {
//     //         return undefined
//     //     }
//     //     let enemies = []
//     //     for (let i = 0; i < enemies_amount; i++) {
//     //         enemies.push( this.create_monster(pool, basic_characters[enemy_tag], char.cell_id))
//     //     }
//     //     let battle =  this.create_battle(pool, [char], enemies);
//     //     return battle
//     // }

//     //  attack_local_outpost(char: Character) {
//     //     const cell = Convert.character_to_cell(char)
//     //     let tmp = cell.i + '_' + cell.j;
//     //     if (tmp in this.constants.outposts) {
//     //         let outpost = this.constants.outposts[tmp];
//     //         let enemies = [];
//     //         for (let i = 0; i < outpost.enemy_amount; i++) {
//     //             enemies.push( this.create_monster(pool, basic_characters[outpost.enemy], char.cell_id))
//     //         }
//     //         let battle =  this.create_battle(pool, [char], enemies);
//     //         battle.stash.inc(outpost.res, outpost.res_amount)
//     //         return battle
//     //     }
//     // }
// }