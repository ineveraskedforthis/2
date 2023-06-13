import { Accuracy } from "../../battle/battle_calcs";
import { SkillList } from "../../character/SkillList";
import { MapSystem } from "../../map/system";
import { CellDisplayData } from "../../static_data/map_definitions";
import { Convert } from "../../systems_communication";
import { weapon_attack_tags, weapon_tag } from "../../types";
import { User } from "../user";
import { Alerts } from "./alerts";
import { BattleSystem } from "../../battle/system";
import { BATTLE_CURRENT_UNIT, UNIT_ID_MESSAGE, BATTLE_DATA_MESSAGE } from "../../static_data/constants";
import { prepare_market_orders } from "../helper_functions";
import { durability, get_crafts_item_list } from "../../craft/CraftItem";
import { CraftItem } from "../../craft/items";
import { crafts_bulk, crafts_items } from "../../craft/crafts_storage";
import { get_crafts_bulk_list, output_bulk } from "../../craft/CraftBulk";
import { CharacterSystem } from "../../character/system";
import { Attack } from "../../attack/system";
import { Request } from "./request";
import { DmgOps } from "../../damage_types";
import { Data } from "../../data";
import { terrain_to_string } from "../../map/terrain";
import { CharacterStatsResponce } from "../../../../../shared/responces";
import { cell_id } from "../../../../../shared/common";



export namespace SendUpdate {
    export function all(user: User) {
        status(user)
        belongings(user)
        all_skills(user)
        all_craft(user)
        map_related(user)
        battle(user)
        market(user)   
        stats(user)
        race_model(user)
    }

    export function race_model(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'model', character.model())
    }

    export function stats(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const stats: CharacterStatsResponce = {
            phys_power: CharacterSystem.phys_power(character),
            magic_power: CharacterSystem.magic_power(character),
            enchant_rating: CharacterSystem.enchant_rating(character),
            movement_cost: CharacterSystem.movement_cost_battle(character),
            move_duration_map: CharacterSystem.movement_duration_map(character),
            base_damage_magic_bolt: Attack.magic_bolt_base_damage(character)
        }

        Alerts.generic_user_alert(user, 'stats', stats);
    }

    export function battle(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        if (character.in_battle()) {
            const battle = Convert.id_to_battle(character.battle_id);
            let unit_id = character.battle_unit_id
            Alerts.battle_progress(user, true)
            Alerts.generic_user_alert(user, BATTLE_DATA_MESSAGE, BattleSystem.data(battle));
            Alerts.generic_user_alert(user, BATTLE_CURRENT_UNIT, battle.heap.get_selected_unit()?.id);
            Alerts.generic_user_alert(user, UNIT_ID_MESSAGE, unit_id)  
        } else {
            Alerts.battle_progress(user, false)
        }
    }


    
// send_data_start() {
//         this.world.socket_manager.send_battle_data_start(this)
//         if (this.waiting_for_input) {
//             this.send_action({action: 'new_turn', target: this.heap.selected})
//         }
//     }

//     send_update() {
//         this.world.socket_manager.send_battle_update(this)
//         if (this.waiting_for_input) {
//             this.send_action({action: 'new_turn', target: this.heap.selected})
//         }
//     }

//     send_current_turn() {
//         this.send_action({action: 'new_turn', target: this.heap.selected})
//     }

    // send_battle_data_to_user(user: User) {

    // }

    // send_battle_data_start(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     let data = battle.get_data()
    //     let status = battle.get_status()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             let position = char.get_in_battle_id()
    //             this.send_to_character_user(char, 'battle-has-started', data);
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }

    // send_battle_update(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     let status = battle.get_status()
    //     let data = battle.get_data()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'battle-update', data)
    //             // this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }



    // send_battle_action(battle: BattleReworked2, a: any) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let char = this.world.get_character_by_id(units[i].char_id);
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'battle-action', a)
    //         }
    //     }
    // }

    // send_stop_battle(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let character = this.world.get_character_by_id(units[i].char_id);
    //         if (character != undefined) {
    //             if (character.is_player()) {
    //                 this.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
    //                 this.send_to_character_user(character, 'battle-has-ended', '')
    //                 this.send_updates_to_char(character)
    //             }
    //         }
    //     }
    // }


    export function savings(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'savings', character.savings.get())
        Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get()) 
    }
 
    export function status(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'status', {c: character.status, m: character.stats.max})
    }

    export function stash(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'stash-update', character.stash.data)
    }

    export function equip(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'equip-update', character.equip.get_data())
        attack_damage(user)
    }

    export function skill_clothier(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        
        Alerts.skill(user, 'clothier', character.skills.clothier)
    }

    export function skill_cooking(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'cooking', character.skills.cooking)        
    }

    export function skill_woodwork(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'woodwork', character.skills.woodwork)
    }

    export function skill_skinning(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'woodwork', character.skills.woodwork)
    }

    export function skill_weapon(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (const tag of weapon_attack_tags) {
            Alerts.skill(user, tag, character.skills[tag])
        }
    }

    export function skill_defence(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'evasion', character.skills.evasion)
        Alerts.skill(user, 'blocking', character.skills.blocking)
    }

    export function all_skills(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        for (let i in character.skills) {
            Alerts.skill(user, i, character.skills[i as keyof SkillList])
        }
        cell_probability(user)

        Alerts.perks(user, character)
    }

    export function all_craft(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (let item of get_crafts_bulk_list(character)) {
            Alerts.craft_bulk_complete(user, item.id, item)
        }

        for (let item of get_crafts_item_list(character)) {
            Alerts.craft_item_complete(user, item.id, item)
        }

        for (let item of get_crafts_bulk_list(character)) {
            Alerts.craft_bulk(user, item.id, output_bulk(character, item))
        }

        for (let item of get_crafts_item_list(character)) {
            Alerts.craft_item(user, item.id, durability(character, item))
        }
    }

    export function ranged(user: User, distance: number) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        if (isNaN(distance)) {
            return 
        }

        Alerts.battle_action_chance(user, 'shoot', Accuracy.ranged(character, distance))
    }

    export function hp(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'hp', {c: character.status.hp, m: character.stats.max.hp})
    }

    export function market(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        const bulk_data = prepare_market_orders(character.cell_id)
        const items_data = Convert.cell_id_to_item_orders_socket(character.cell_id)    
        Alerts.item_market_data(user, items_data)
        Alerts.market_data(user, bulk_data)
    }

    export function explored(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'explore', character.explored)
        map_position(user, true)

        for (let i = 0; i < character.explored.length; i++) {
            if (character.explored[i]) {
                let cell = Data.Cells.from_id(i as cell_id)
                if (cell != undefined) {
                    let x = cell.x
                    let y = cell.y
                    let terrain = Data.World.id_to_terrain(cell.id);
                    let forestation = Data.Cells.forestation(cell.id);
                    let urbanisation = Data.Cells.urbanisation(cell.id);

                    // console.log(forestation)

                    // let res1: {[_ in string]: CellDisplayData} = {}
                    
                    const display_data = {
                        terrain: terrain_to_string(terrain),
                        forestation: forestation,
                        urbanisation: urbanisation,
                        rat_lair: Data.Cells.rat_lair(cell.id)
                    }

                    // if (data != undefined) {
                    //     Alerts.generic_user_alert(user, 'map-data-cells', res1)
                    // }

                    let res2 = {x: x, y: y, ter: display_data}
                    Alerts.generic_user_alert(user, 'map-data-display', res2)
                }
            }            
        }
    }

    export function map_position(user: User, teleport_flag:boolean) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        let cell = Convert.character_to_cell(character)
        let data = {
            x:cell.x,
            y:cell.y,
            teleport_flag:teleport_flag
        }
        Alerts.generic_user_alert(user, 'map-pos', data)
    }

    export function map_position_move(user: User) {
        map_position(user, false)
    }

    export function local_characters(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        let characters_list = Data.Cells.get_characters_list_display(character.cell_id)
        Alerts.generic_user_alert(user, 'cell-characters', characters_list)
    }

    export function local_actions(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        const cell = Convert.character_to_cell(character)
        // Alerts.map_action(user, 'fish'          , cell.can_fish())
        // Alerts.map_action(user, 'hunt'          , cell.can_hunt())
        // Alerts.map_action(user, 'clean'         , cell.can_clean())
        // Alerts.map_action(user, 'gather_wood'   , cell.can_gather_wood())
        // Alerts.map_action(user, 'gather_cotton' , cell.can_gather_cotton())
    }

    export function map_related(user: User) {
        local_actions(user)
        local_characters(user)
        explored(user)
    }

    export function belongings(user: User) {
        stash(user)
        savings(user)
        equip(user)
    }

    export function attack_damage(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        let blunt  = DmgOps.total(Attack.generate_melee(character, 'blunt' ).damage)
        let slice  = DmgOps.total(Attack.generate_melee(character, 'slice' ).damage)
        let pierce = DmgOps.total(Attack.generate_melee(character, 'pierce').damage)

        Alerts.battle_action_damage(user, 'attack_blunt', blunt)
        Alerts.battle_action_damage(user, 'attack_slice', slice)
        Alerts.battle_action_damage(user, 'attack_pierce', pierce)

        let ranged = DmgOps.total(Attack.generate_ranged(character).damage)
        Alerts.battle_action_damage(user, 'shoot', ranged)
    }
        
    //     // user.socket.emit('map-data-cells', this.world.constants.development)
    //     // user.socket.emit('map-data-terrain', this.world.constants.terrain)

    export function cell_probability(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
    }

    export function update_player_actions_availability() {
            // send_skills_info(character: Character) {
    //     
       

    //     
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    //     this.send_perk_related_skills_update(character)
    // }

    //     send_perk_related_skills_update(character: Character) {
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})

    //     this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
    // }
    }
}






    // update_market_info(market: Cell) {
    //     let responce = this.prepare_market_orders(market)     

    //     for (let i of this.sockets) {
    //         if (i.current_user != null) {
    //             let char = i.current_user.character;
    //             try {
    //                 let cell1 = char.get_cell();
    //                 if (i.online & i.market_data && (cell1.id==market.id)) {
    //                     i.socket.emit('market-data', responce);
    //                 }
    //             } catch(error) {
    //             }
    //         }
    //     }
    // }





