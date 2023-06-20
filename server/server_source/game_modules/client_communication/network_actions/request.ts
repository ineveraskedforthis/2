import { Attack } from "../../attack/system";
import { Accuracy } from "../../battle/battle_calcs";
import { BattleEvent } from "../../battle/events";
import { perk_price } from "../../prices/perk_base_price";
import { skill } from "../../character/SkillList";
import { skill_price } from "../../prices/skill_price";
import { Data } from "../../data";
import { DmgOps } from "../../damage_types";
import { UNIT_ID_MESSAGE } from "../../static_data/constants";
import { Convert } from "../../systems_communication";
import { Update } from "../causality_graph";
import { SocketWrapper } from "../user";
import { Alerts } from "./alerts";
import { SendUpdate } from "./updates";
import { ScriptedValue } from "../../events/scripted_values";
import { rooms } from "../../DATA_LAYOUT_BUILDING";
import { Perks } from "@custom_types/character";
import { ResponceNegativeQuantified, Trigger } from "../../events/triggers";
import { CharacterSystem } from "../../character/system";
import { PerksResponse } from "@custom_types/responses";
import { BattleValues } from "../../battle/VALUES";
import { ActionsPosition, ActionsSelf, ActionsUnit } from "../../battle/actions";
import { BattleActionData, battle_position, unit_id } from "@custom_types/battle_data";
import { type } from "os";
import { Validator } from "./common_validations";


export namespace Request {
    export function accuracy(sw: SocketWrapper, distance: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return;
        if (!user.logged_in) {
            return 
        }
        if (isNaN(distance)) {
            return 
        }
        
        const acc = Accuracy.ranged(character, distance)
        Alerts.battle_action_chance(user, 'shoot', acc)

        let magic_bolt = DmgOps.total(Attack.generate_magic_bolt(character, distance).damage)
        Alerts.battle_action_damage(user, 'magic_bolt', magic_bolt)
    }

    export function perks_and_skills(sw: SocketWrapper, character_id: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }

        let target_character = Convert.id_to_character(character_id)
        if (target_character == undefined) {
            sw.socket.emit('alert', 'character does not exist')
            return
        }
        
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell')
            return
        }

        if (character_id == character.id) {
            user.socket.emit('alert', "can't talk with yourself")
            return 
        }

        let data = target_character.perks
        let response: PerksResponse = {
            name: target_character.name,
            race: target_character.race(),
            factions: Data.Reputation.list_from_id(target_character.id),
            perks: {}, 
            skills: {}
        }

        for (let perk of Object.keys(data) ) {
            if (data[perk as Perks] == true) {
                response.perks[perk as Perks] = perk_price(perk as Perks, character, target_character)
            }
        }

        for (let skill of Object.keys(target_character._skills)) {
            let teaching_response = Trigger.can_learn_from(character, target_character, skill as skill)
            // console.log(skill, teaching_response)
            if (teaching_response.response == 'ok' || teaching_response.response == ResponceNegativeQuantified.Money) {
                const teacher_skill = CharacterSystem.skill(target_character, skill as skill)
                response.skills[skill as skill] = [
                    teacher_skill,
                    skill_price(skill as skill, character, target_character)
                ]
            }
        }
        
        sw.socket.emit('perks-info', response)
    }

    export function local_buildings(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }

        
        let ids = Data.Buildings.from_cell_id(character.cell_id)

        if (ids == undefined) {
            Alerts.generic_user_alert(user, 'buildings-info', [])
            return
        }
        let buildings = Array.from(ids).map((id) => {
            let building = Data.Buildings.from_id(id)
            let rooms_occupied = Data.Buildings.occupied_rooms(id)
            // let owner = Data.Buildings.owner(id)
            return {
                id: id,
                room_cost: ScriptedValue.room_price(id, character.id),
                rooms: rooms(building.type),
                rooms_occupied: rooms_occupied,
                durability: building.durability,
                type: building.type,
            }
        })

        // console.log(buildings)
        Alerts.generic_user_alert(user, 'buildings-info', buildings)
        return
    }

    export function player_index(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const unit = Convert.character_to_unit(character)
        if (unit == undefined) return

        const battle = Convert.character_to_battle(character)
        if (battle == undefined) return

        Alerts.generic_user_alert(user, UNIT_ID_MESSAGE, unit.id)  
        Alerts.generic_user_alert(user, 'current-unit-turn', battle.heap.get_selected_unit()?.id)
    }

    export function flee_chance(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const unit = Convert.character_to_unit(character)
        if (unit == undefined) return
        Alerts.battle_action_chance(user, 'flee', BattleValues.flee_chance(unit.position))
    }

    export function attack_damage(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        
        SendUpdate.attack_damage(user)
    }

    // export function battle_actions(sw: SocketWrapper) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) {
    //         sw.socket.emit('alert', 'your character does not exist')
    //         return
    //     }
    //     const battle_id = character.battle_id
    //     if (battle_id == undefined) return 
    //     const battle = Convert.id_to_battle(battle_id);
    //     const unit = Convert.character_to_unit(character)
    //     if (unit == undefined) {return}

    //     for (let [key, item] of Object.entries(ActionsSelf)) {
    //         const result: BattleActionData = {
    //             name: key,
    //             tag: key,
    //             cost: item.ap_cost(battle, character, unit),
    //             damage: 0,
    //             probability: item.chance(battle, character, unit),
    //             target: 'self'
    //         }
    //         sw.socket.emit('battle-action-update', result)
    //     }
    // }

    export function battle_actions_self(sw: SocketWrapper) {
        // console.log('requested self actions')
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return 
        const battle = Convert.id_to_battle(battle_id);
        const unit = Convert.character_to_unit(character)
        if (unit == undefined) {return}

        for (let [key, item] of Object.entries(ActionsSelf)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit),
                damage: 0,
                probability: item.chance(battle, character, unit),
                target: 'self'
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle_actions_unit(sw: SocketWrapper, target_id: unknown) {
        // console.log('requested unit actions')
        if (target_id == undefined) return
        if (typeof target_id !== 'number') return
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return
        const battle = Convert.id_to_battle(battle_id);
        const unit = Convert.character_to_unit(character)
        if (unit == undefined) {return}

        const target_unit = battle.heap.get_unit(target_id as unit_id)
        if (target_unit == undefined) return 

        const target_character = Convert.unit_to_character(target_unit)

        for (let [key, item] of Object.entries(ActionsUnit)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit, target_character, target_unit),
                damage: item.damage(battle, character, unit, target_character, target_unit),
                probability: item.chance(battle, character, unit, target_character, target_unit),
                target: 'unit'
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle_actions_position(sw: SocketWrapper, target: unknown) {
        // console.log('requested position actions')
        if (target == undefined) return
        if (!Validator.is_point(target)) return 
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return
        const battle = Convert.id_to_battle(battle_id);
        const unit = Convert.character_to_unit(character)
        if (unit == undefined) {return}

        for (let [key, item] of Object.entries(ActionsPosition)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit, target as battle_position),
                damage: 0,
                probability: 1, //item.chance(battle, character, unit, target),
                target: 'position'
            }
            sw.socket.emit('battle-action-update', result)
        }
    }


}