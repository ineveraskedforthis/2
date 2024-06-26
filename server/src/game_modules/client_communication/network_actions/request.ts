import { character_id_MESSAGE } from "../../static_data/constants";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { Alerts } from "./alerts";
import { SendUpdate } from "./updates";
import { ScriptedValue } from "../../events/scripted_values";
import { BattleValues } from "../../battle/VALUES";
import { ActionsPosition, ActionsSelf, ActionsUnit, battle_action_position_check, battle_action_self_check, battle_action_unit_check} from "../../battle/actions";
import { ActionPositionKeys, BattleActionData, BattleActionPossibilityReason, action_points, battle_position } from "@custom_types/battle_data";
import { Validator } from "./common_validations";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { Location } from "../../location/location_class";
import { character_id } from "@custom_types/ids";
import { LocationView } from "@custom_types/responses";
import { CharactersHeap } from "../../battle/classes/heap";
import { MapSystem } from "../../map/system";


export namespace Request {
    export function map(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (map)')
            return
        }

        SendUpdate.map_related(user)
    }

    export function local_locations(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (local_locations)')
            return
        }

        SendUpdate.locations(user)
        SendUpdate.map_related(user)
        return
    }

    export function player_index(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (player_index)')
            return
        }
        const battle = Convert.character_to_battle(character)
        if (battle == undefined) return

        Alerts.generic_user_alert(user, character_id_MESSAGE, character.id)
        Alerts.generic_user_alert(user, 'current-unit-turn', CharactersHeap.get_selected_unit(battle)?.id)
    }

    export function belongings(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (belongings)')
            return
        }

        SendUpdate.belongings(user)
    }

    export function flee_chance(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        Alerts.battle_action_chance(user, 'flee', BattleValues.flee_chance(character.position))
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
    //     const battle = Data.Battles.from_id(battle_id);
    //     const unit = Convert.character_to_unit(character)
    //     if (unit == undefined) {return}

    //     for (let [key, item] of Object.entries(ActionsSelf)) {
    //         const result: BattleActionData = {
    //             name: key,
    //             tag: key,
    //             cost: item.ap_cost(battle, character),
    //             damage: 0,
    //             probability: item.chance(battle, character),
    //             target: 'self'
    //         }
    //         sw.socket.emit('battle-action-update', result)
    //     }
    // }

    export function battle_actions_all(sw: SocketWrapper) {
        for (let [key, item] of Object.entries(ActionsSelf)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: 0,
                damage: 0,
                probability: 0,
                target: 'self',
                possible: BattleActionPossibilityReason.InvalidAction
            }
            sw.socket.emit('battle-action-update', result)
        }

        for (let [key, item] of Object.entries(ActionsUnit)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: 0,
                damage: 0,
                probability: 0,
                target: 'unit',
                possible: BattleActionPossibilityReason.InvalidAction
            }
            sw.socket.emit('battle-action-update', result)
        }

        for (let [key, item] of Object.entries(ActionsPosition)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: 0,
                damage: 0,
                probability: 0,
                target: 'position',
                possible: BattleActionPossibilityReason.InvalidAction
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle_actions_self(sw: SocketWrapper) {
        // console.log('requested self actions')
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return
        const battle = Data.Battles.from_id(battle_id);

        for (let [key, item] of Object.entries(ActionsSelf)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character),
                damage: 0,
                probability: item.chance(battle, character),
                target: 'self',
                possible: battle_action_self_check(item, battle, character, 0 as action_points)
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
        const battle = Data.Battles.from_id(battle_id);

        const target_character = CharactersHeap.get_unit(battle, target_id as character_id)
        if (target_character == undefined) return

        for (let [key, item] of Object.entries(ActionsUnit)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, target_character),
                damage: item.damage(battle, character, target_character),
                probability: item.chance(battle, character, target_character),
                target: 'unit',
                possible: battle_action_unit_check(item, battle, character, target_character, 0, 0)
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle_actions_unit_unselected(sw: SocketWrapper) {
        // console.log('requested unit actions')
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return
        const battle = Data.Battles.from_id(battle_id);

        for (let [key, item] of Object.entries(ActionsUnit)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: 0,
                damage: 0,
                probability: 0,
                target: 'unit',
                possible: BattleActionPossibilityReason.InvalidAction
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (battle)')
            return
        }

        SendUpdate.battle(user)
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
        const battle = Data.Battles.from_id(battle_id);

        for (let [key, item] of Object.entries(ActionsPosition)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, target as battle_position),
                damage: 0,
                probability: 1, //item.chance(battle, character, target),
                target: 'position',
                possible: battle_action_position_check(item, battle, character, target as battle_position)
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function battle_actions_position_unselected(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        const battle_id = character.battle_id
        if (battle_id == undefined) return
        const battle = Data.Battles.from_id(battle_id);

        for (let [key, item] of Object.entries(ActionsPosition)) {
            const result: BattleActionData = {
                name: key,
                tag: key,
                cost: 0,
                damage: 0,
                probability: 0, //item.chance(battle, character, target),
                target: 'position',
                possible: BattleActionPossibilityReason.InvalidAction
            }
            sw.socket.emit('battle-action-update', result)
        }
    }

    export function craft_data(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (user == undefined) {
            sw.socket.emit('alert', 'user does not exist')
            return
        }

        SendUpdate.all_craft(user)
    }
}