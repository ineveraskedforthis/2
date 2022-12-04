import { battle_position, unit_id } from "../../../../../shared/battle_data";
import { ActionManager, ActionTargeted, CharacterAction, CharacterActionResponce } from "../../actions/action_manager";
import { Battle } from "../../battle/classes/battle";
import { BattleEvent } from "../../battle/events";
import { BattleSystem } from "../../battle/system";
import { Event } from "../../events/events";
import { EventInventory } from "../../events/inventory_events";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { UserManagement } from "../user_manager";
import { Alerts } from "./alerts";

export namespace HandleAction {
    export function move(sw: SocketWrapper, data: {x: unknown, y: unknown}) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#') return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        // sanitise data
        const x = Number(data.x)
        const y = Number(data.y)
        if ((x == NaN) || (y == NaN)) {
            return
        }

        const destination: [number, number] = [x, y]

        let responce = ActionManager.start_action(CharacterAction.MOVE, character, destination)

        if (responce == CharacterActionResponce.CANNOT_MOVE_THERE) {
            Alerts.impossible_move(user)
        } else if (responce == CharacterActionResponce.IN_BATTLE) {
            Alerts.in_battle(user)
        }
    }

    export function act(sw: SocketWrapper, action: ActionTargeted) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#') return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const destination: [number, number] = [0, 0]

        let responce = ActionManager.start_action(action, character, destination)

        if (responce == CharacterActionResponce.CANNOT_MOVE_THERE) {
            Alerts.impossible_move(user)
        } else if (responce == CharacterActionResponce.IN_BATTLE) {
            Alerts.in_battle(user)
        } else if (responce == CharacterActionResponce.NO_RESOURCE) {
            Alerts.not_enough_to_user(user, '???', 0, 0)
        }
    }

    export function battle(sw:SocketWrapper, input: {action: unknown, target: unknown}) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (!character.in_battle()) return

        const battle =   Convert.character_to_battle(character)
        if (battle == undefined) return
        const unit =     Convert.character_to_unit(character)
        if (unit == undefined) return

        if (!battle.waiting_for_input) {
            return
        }
        if (battle.heap.get_selected_unit()?.id != unit.id) {
            return
        }
        if (input == undefined) return;
        if (input.action == undefined) return;

        if (input.action == 'move') {
            if (input.target == undefined) return

            const target = input.target as battle_position
            if (target.x == undefined) return;
            if (isNaN(target.x)) return;
            if (target.y == undefined) return;
            if (isNaN(target.y)) return;

            BattleEvent.Move(battle, unit, target)
        } else if (input.action == 'attack_slice') {
            if (input.target == undefined) return
            const defender_id = input.target as unit_id
            const defender = BattleSystem.id_to_unit(defender_id, battle)
            if (defender == undefined) return undefined

            BattleEvent.Attack(battle, unit, defender, 'slice')
        } else if (input.action == 'attack_blunt') {
            if (input.target == undefined) return
            const defender_id = input.target as unit_id
            const defender = BattleSystem.id_to_unit(defender_id, battle)
            if (defender == undefined) return undefined
            
            BattleEvent.Attack(battle, unit, defender, 'blunt')
        } else if (input.action == 'attack_pierce') {
            if (input.target == undefined) return
            const defender_id = input.target as unit_id
            const defender = BattleSystem.id_to_unit(defender_id, battle)
            if (defender == undefined) return undefined
            
            BattleEvent.Attack(battle, unit, defender, 'pierce')
        } else if (input.action == 'end_turn') {
            BattleEvent.EndTurn(battle, unit)
        }
        // else if (input.action == 'fast_attack') {
        //     if(!can_fast_attack(character)) {
        //         return {action: "not_learnt"}
        //     }
        //     return  battle.action(index, BattleAI.convert_attack_to_action(battle, index, input.target, 'fast'))
        // } else if (input.action == 'dodge') {
        //     if(!can_dodge(character)) {
        //         return {action: "not_learnt"}
        //     }
        //     return  battle.action(index, {action: 'dodge', who: index})
        // } else if (input.action == 'push_back') {
        //     if(!can_push_back(character)) {
        //         return {action: "not_learnt"}
        //     }
        //     return  battle.action(index, {action: 'push_back', target: input.target})
        else if (input.action == 'magic_bolt') {
            if (input.target == undefined) return
            const defender_id = input.target as unit_id
            const defender = BattleSystem.id_to_unit(defender_id, battle)
            return BattleEvent.MagicBolt(battle, unit, defender)
        } else if (input.action == 'shoot') { 
            if (input.target == undefined) return
            const defender_id = input.target as unit_id
            const defender = BattleSystem.id_to_unit(defender_id, battle)
            BattleEvent.Shoot(battle, unit, defender)
        } else if (input.action == 'flee') {
            BattleEvent.Flee(battle, unit)
        } else if (input.action == 'switch_weapon') {
            EventInventory.switch_weapon(character)
            BattleEvent.Update(battle, unit)
        } else {
            return  
        }
    }
}

    //  move(user: User, data: {x: number, y: number}) {
    //     if (!user.logged_in) {
    //         return 
    //     }
    //     let char = user.get_character();

    // }