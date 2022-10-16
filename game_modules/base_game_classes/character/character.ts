import {Stash} from "../inventories/stash"
import { Archetype, InnateStats, Stats, Status, status_type } from "./character_parts";
import { PerksTable, SkillList } from "./skills";
import { Equip } from "../inventories/equip";
import { Savings} from "../inventories/savings";
import { cell_id, char_id, map_position, money, TEMP_USER_ID, user_id } from "../../types";
import { ActionTargeted } from "../../actions/action_manager";

export class Character {
    id: char_id;
    battle_id: number;
    battle_unit_id: number;
    user_id: user_id|TEMP_USER_ID;
    cell_id: cell_id;

    name: string;

    equip: Equip;

    stash: Stash;
    trade_stash: Stash;

    savings: Savings;
    trade_savings: Savings;

    status: Status;

    skills: SkillList;
    perks: PerksTable;
    stats: InnateStats;

    archetype: Archetype
    explored: boolean[];
    next_cell: map_position

    action: ActionTargeted|undefined
    action_progress: number
    action_duration: number

    model_variation: any;

    constructor(id: number, battle_id: number, battle_unit_id: number, user_id: user_id|TEMP_USER_ID, cell_id: cell_id,
                 name: string, archetype: Archetype, 
                 stats: Stats, max_hp: number) {
        
        this.id = id as char_id
        this.battle_id = battle_id
        this.battle_unit_id = battle_unit_id
        this.user_id = user_id
        this.cell_id = cell_id
        this.next_cell = [0, 0]

        this.name = name

        this.archetype = archetype

        this.equip = new Equip()
        this.stash = new Stash()
        this.trade_stash = new Stash()
        this.savings = new Savings()
        this.trade_savings = new Savings()
        
        this.status = new Status()
        this.status.blood = 0
        this.status.fatigue = 0
        this.status.rage = 0
        this.status.hp = max_hp
        this.status.stress = 0

        this.action_progress = 0
        this.action_duration = 0

        this.skills = new SkillList()
        this.perks = {}
        this.stats = new InnateStats(stats.movement_speed, stats.phys_power, stats.magic_power, max_hp)

        this.explored = []
    }

    set_model_variation(data:any) {
        this.model_variation = data
    }

    change(type: status_type, x: number):boolean {
        let tmp = this.status[type];
        let new_status = tmp + x 
        new_status = Math.min(this.stats.max[type], new_status)
        new_status = Math.max(new_status, 0)

        return this.set(type, new_status)
    }

    change_hp(x: number) {
        return this.change('hp', x)
    }

    change_rage(x: number) {
        return this.change('rage', x)
    }

    change_blood(x: number) {
        return this.change('blood', x)
    }

    change_fatigue(x: number) {
        return this.change('fatigue', x)
    }

    change_stress(x: number) {
        return this.change('stress', x)
    }

    set(type: status_type, x: number):boolean {
        if (this.status[type] == x) return false
        this.status[type] = x
        return true
    }

    set_fatigue(x: number) {
        return this.set('fatigue', x)
    }

    set_status(dstatus: Status) {
        this.status.blood = dstatus.blood
        this.status.rage = dstatus.rage
        this.status.stress = dstatus.stress
        this.status.hp = dstatus.hp
        this.status.fatigue = dstatus.fatigue
    }

    change_status(dstatus: Status) {
        this.change_hp(dstatus.hp)
        this.change_rage(dstatus.rage);
        this.change_stress(dstatus.stress);
        this.change_blood(dstatus.blood);
        this.change_fatigue(dstatus.fatigue)
    }

    get_hp() {
        return this.status.hp
    }
    get_blood() {
        return this.status.blood
    }
    get_rage() {
        return this.status.rage
    }
    get_fatigue() {
        return this.status.fatigue
    }
    get_stress() {
        return this.status.stress
    }

    in_battle() {
        return (this.battle_id != -1)
    }

    range() {
        const result = this.equip.get_weapon_range()
        if (result != undefined) return result
        
        if (this.archetype.race == 'graci') return 2;
        return 0.5
    }

    is_player() {
        return this.user_id != '#';
    }
}


// export class CharacterOld {
//     equip: Equip;

//     stash: Stash;
//     trade_stash: Stash;

//     savings: Savings;
//     trade_savings: Savings;

//     status: Status;

//     skills: SkillList;
//     perks: PerksTable;
    
//     stats: InnateStats;
//     misc: Misc;
//     flags: CharacterFlags;
//     changed: boolean;
//     status_changed: boolean;
//     deleted: boolean

//     id: number
//     name: string;
//     user_id: user_id|TEMP_USER_ID;
//     cell_id: number;
//     faction_id: number;

//     action_progress: number;
//     action_duration: number;
//     action_started: boolean;
//     current_action: undefined|CharacterAction
//     action_target: any

//     constructor() {
//         this.equip = new Equip();

//         this.stash = new Stash();
//         this.trade_stash = new Stash();

//         this.savings = new Savings();
//         this.trade_savings = new Savings();

//         this.status = new Status()
//         this.status.hp = 100

//         this.skills = new SkillList()

//         this.stats = new InnateStats()

//         this.stats.max.hp = 100;
//         this.stats.max.rage = 100;
//         this.stats.max.blood = 100;
//         this.stats.max.stress = 100;
//         this.stats.max.fatigue = 100;
//         this.stats.movement_speed = 1;
//         this.stats.phys_power = 10;
//         this.stats.magic_power = 10;

//         this.misc = new Misc;
//         this.misc.model = 'test'
//         this.misc.ai_tag = 'dummy'
//         // this.misc.tactic = {s0: this.world.constants.default_tactic_slot}

//         this.flags = new CharacterFlags()

//         this.changed = false;
//         this.status_changed = false;
//         this.deleted = false;

//         this.id = -1;
//         this.name = 'unknown'
//         this.user_id = '#'
//         this.cell_id = -1
//         this.faction_id = -1

//         this.action_started = false
//         this.action_progress = 0
//         this.action_duration = 0
//     }

//      init(name: string, cell_id: number, user_id = -1) {
//         this.init_base_values(name, cell_id, user_id);
//         this.id = await this.load_to_db(pool);
//         await this.save_to_db(pool);
//         return this.id;
//     } 

//     init_base_values(name: string, cell_id: number, user_id = -1) {
//         this.name = name;
//         if (user_id != -1) {
//             this.flags.player = true;
//         }   
//         this.user_id = user_id;
//         this.cell_id = cell_id;

//         let cell = this.get_cell()
//         if (cell != undefined) {
//             this.misc.explored[cell.id] = true
//             for (let direction of dp) {
//                 let x = cell.i + direction[0]
//                 let y = cell.j + direction[1]
//                 let border_cell = this.world.get_cell(x, y)
//                 if (border_cell != undefined) {
//                     this.misc.explored[border_cell.id] = true
//                 }
//             }
//         }
//         this.faction_id = -1;
//     }



//     flags_handling_update() {
//         let sm = this.world.socket_manager;
//         if (this.status_changed) {
//             if (this.is_player()) {
//                 sm.send_status_update(this);
//             }            
//             this.status_changed = false;
//             this.changed = true
//         }
//         if (this.savings.changed) {
//             if (this.is_player()) {
//                 sm.send_savings_update(this);
//             }            
//             this.savings.changed = false;
//             this.changed = true
//         }
//         if (this.stash.changed) {
//             if (this.is_player()) {
//                 sm.send_stash_update_to_character(this);
//             }
            
//             this.stash.changed = false;
//             this.changed = true
//         }
//     }


//     //some stuff defined per concrete character class

//      status_check() {
//         if (this.status.hp <= 0) {
//             this.status.hp = 0;

//             await this.world.entity_manager.remove_orders(pool, this)
//             await AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
//             await this.world.kill(pool, this.id);
//         }
//     }

//     out_of_battle_update(dt: number) {
//         this.change_rage(-1)
//     }   

//     battle_update() {
//         this.change_stress(1)
//     }

//      on_move() {
//         return undefined
//     }

//     get_user():User {
//         return this.world.user_manager.get_user(this.user_id)
//     }

//     get_item_lvl() {
//         return 1;
//     }

//     get_tag() {
//         return this.misc.tag
//     }


//     get_hp_change() {
//         return 0
//     }

//     get_rage_change() {
//         if (!this.flags.in_battle) {
//             return -1
//         } else {
//             return 1
//         }
//     }

//     get_stress_change() {
//         let d_stress = (this.get_stress_target() - this.status.stress);
//         if (d_stress != 0) {
//             if ((d_stress / 30 > 1)||(d_stress / 30 < -1)) {
//                 return Math.floor(d_stress/30)
//             } else {
//                 return Math.sign(d_stress)
//             }
//         }
//         return 0
//     }

//     get_stress_target() {
//         return 0
//     }

//     get_max_hp() {
//         return this.stats.max.hp
//     }

//     get_max_rage() {
//         return this.stats.max.rage
//     }

//     get_max_stress() {
//         return this.stats.max.stress
//     }

//     get_max_blood() {
//         return this.stats.max.blood
//     }

//     get_max_fatigue() {
//         return this.stats.max.fatigue
//     }

//     get_cell() {
//         return this.world.get_cell_by_id(this.cell_id);
//     }

//     get_faction() {
//         // if (this.faction_id != -1) {
//         //     return this.world.get_faction_from_id(this.faction_id)
//         // }
//         return undefined
//     }




//     //equip and stash interactions

//     equip_armour(index:number) {
//         this.equip.equip_armour(index);
//         this.changed = true;
//     }

//     equip_weapon(index:number) {
//         this.equip.equip_weapon(index);
//         this.changed = true;
//     }

//     unequip_weapon() {
//         this.equip.unequip_weapon()
//     }

//     unequip_secondary() {
//         this.equip.unequip_secondary()
//     }

//     switch_weapon() {
//         // console.log(this.name + ' switch_weapon')
//         this.equip.switch_weapon()
//         this.send_equip_update()
//     }

//     unequip_armour(tag:ARMOUR_TYPE) {
//         this.equip.unequip_armour(tag)
//     }

//     transfer(target:any, tag:material_index, x:number) {
//         this.stash.transfer(target.stash, tag, x);
//     }

//     transfer_all(target: any) {
//         for (var i_tag of this.world.get_stash_tags_list()) {
//             var x = this.stash.get(i_tag);
//             this.transfer(target, i_tag, x);
//         }
//     }







//     //market interactions


//      buy(tag:material_index, amount: number, price: money) {
//         if (this.savings.get() >= amount * price) {
//             console.log('buy ' + tag + ' ' + amount + ' ' + price)
//             this.savings.transfer(this.trade_savings, amount * price as money)
//             let order = await this.world.entity_manager.generate_order(pool, 'buy', tag, this, amount, price, this.cell_id)
//             return 'ok'
//         }
//         return 'not_enough_money'        
//     }

//      sell(pool:any, tag:material_index, amount: number, price: money) {
//         // console.log(this.stash.get(tag), amount)
//         if (this.stash.get(tag) < amount) {
//             return 'not_enough_items'
//         }
//         console.log('sell ' + tag + ' ' + amount + ' ' + price)
//         this.stash.transfer(this.trade_stash, tag, amount)
//         let order = await this.world.entity_manager.generate_order(pool, 'sell', tag, this, amount, price, this.cell_id)
//         return 'ok'
//     }


//      clear_orders(pool:any) {
//         await this.world.entity_manager.remove_orders(pool, this)
//         await AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
//     }



//     get_magic_power() {
//         let power = this.stats.magic_power * this.equip.get_magic_power_modifier();

//         return power;
//     }

//     get_enchant_rating() {
//         let power = this.get_magic_power()
//         let skill = this.skills.magic_mastery
//         return (power / 10 * skill)
//     }


//     // craft related

//     calculate_gained_failed_craft_stress(tag:any) {
//         let total = 10;
//         return total;
//     }

//     get_craft_food_chance() {
//         let chance = 0.0;
//         chance += this.skills.cooking * 0.05
//         return chance
//     } 
    

    
    
//     // flag checking functions



//     in_battle() {
//         return this.flags.in_battle;
//     }

//     is_dead() {
//         return this.flags.dead
//     }



//     // factions interactions

//     set_faction(faction:any) {
//         this.changed = true
//         this.faction_id = faction.id
//     }


//     // exploration

//     add_explored(tag:any) {
//         // this.misc.explored[tag] = true;
//         // this.changed = true
//     }
    

//     update_visited() {
//         let cell = this.get_cell()
//         if (cell != undefined) {
//             let visited: {x: number, y: number}[] = []
//             for (let direction of dp) {
//                 let x = cell.i + direction[0]
//                 let y = cell.j + direction[1]
//                 let border_cell = this.world.get_cell(x, y)
//                 if ((border_cell != undefined) && border_cell.visited_recently) {
//                     visited.push({x: x, y: y})
//                 }
//                 if (border_cell != undefined && this.misc.explored[border_cell.id] != true) {
//                     this.misc.explored[border_cell.id] = true
//                     let data: any = this.world.constants.development
//                     let res1: any = {}
//                     res1[x + '_' + y] = data[x + '_' + y]
//                     if (data[x + '_' + y] != undefined) {
//                         this.world.socket_manager.send_to_character_user(this, 'map-data-cells', res1)
//                     }                   

//                     if (this.world.constants.terrain[x] != undefined && this.world.constants.terrain[x][y] != undefined) {
//                         let res2 = {x: x, y: y, ter: this.world.constants.terrain[x][y]}
//                         this.world.socket_manager.send_to_character_user(this, 'map-data-terrain', res2)
//                     }
//                 }
//             }
//             this.world.socket_manager.send_to_character_user(this, 'cell-visited', visited)
//         }
//     }

//      on_move_default(pool:any, data:any) {
//         let tmp = this.world.get_territory(data.x, data.y)
//         if (tmp == undefined) {
//             return 2
//         }
//         this.add_explored(this.world.get_id_from_territory(tmp));
//         this.world.socket_manager.send_explored(this);
//         this.update_visited()

//         let res = await this.on_move(pool)
//         if (res != undefined) {
//             return 2
//         } 
//         return 1
//     }

//     verify_move(dx: number, dy: number) {
//         return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1))
//     }

//     set_flag(flag: 'in_battle'|'trainer'|'player'|'dead', value: boolean) {
//         this.flags[flag] = value
//         this.changed = true
//     }

//     set_battle_id(x: number) {
//         this.misc.battle_id = x
//         this.changed = true
//     }
//     get_battle_id() {
//         return this.misc.battle_id
//     }

//     set_in_battle_id(x: number) {
//         this.misc.in_battle_id = x
//         this.changed = true
//     }
//     get_in_battle_id() {
//         return this.misc.in_battle_id
//     }

//     get_tactic() {
//         return [this.world.constants.default_tactic_slot]
//     }

//     learn_perk(tag: Perks) {
//         this.skills.perks[tag] = true
//         this.changed = true
//     }


//     //db interactions

//      save_status_to_db(pool:any, save = true) {
//         if (save) {
//             // await common.send_query(pool, constants.set_status_query, [this.status, this.id]);
//         }
//     }

//      load_from_json(data:any) {
//         this.id = data.id;
//         this.name = data.name;
//         this.user_id = data.user_id;
//         this.cell_id = data.cell_id;
//         this.faction_id = data.faction_id

//         this.status = data.status;
//         this.skills = data.skills;
//         this.stats = data.stats;
//         this.misc = data.misc

//         this.flags = data.flags;

//         this.savings = new Savings();        
//         this.savings.load_from_json(data.savings);     
//         this.trade_savings = new Savings()
//         this.trade_savings.load_from_json(data.trade_savings)

//         this.stash = new Stash();
//         this.stash.load_from_json(data.stash);
//         this.trade_stash = new Stash()
//         this.trade_stash.load_from_json(data.trade_stash)

//         this.equip = new Equip();
//         this.equip.load_from_json(data.equip);        
//     }

//     get_json() {
//         return {
//             name: this.name,

//             status: this.status,
//             skills: this.skills,
//             stats: this.stats,
//             misc: this.misc,

//             flags: this.flags,

//             savings: this.savings.get_json(),
//             stash: this.stash.get_json(),
//             equip: this.equip.get_json(),
//         };
//     }

//      load_to_db(pool:any) {
//         // @ts-ignore: Unreachable code error
//         if (global.flag_nodb) {
//             // @ts-ignore: Unreachable code error
//             global.last_id += 1
//             // @ts-ignore: Unreachable code error
//             return global.last_id
//         }
//         let result = await common.send_query(pool, constants.new_char_query, [
//             this.user_id,
//             this.cell_id, 
//             this.faction_id,
//             this.name, 
//             this.status,
//             this.skills,
//             this.stats,
//             this.misc,
//             this.flags,
//             this.savings.get_json(), 
//             this.trade_savings.get_json(),
//             this.stash.get_json(), 
//             this.trade_stash.get_json(),
//             this.equip.get_json()]);
//         return result.rows[0].id;
//     }

//      save_to_db(pool:any, save = true) {
        
//         if (save) {
//             await common.send_query(pool, constants.update_char_query, [
//                 this.id,
//                 this.cell_id,
//                 this.faction_id,
//                 this.status,
//                 this.skills,
//                 this.stats,
//                 this.misc,
//                 this.flags,
//                 this.savings.get_json(),
//                 this.trade_savings.get_json(),
//                 this.stash.get_json(),
//                 this.trade_stash.get_json(),
//                 this.equip.get_json()]);
//             this.changed = false;
//         }
//     }

//      delete_from_db(pool:any) {
//         await common.send_query(pool, constants.delete_char_query, [this.id]);
//     }
// }