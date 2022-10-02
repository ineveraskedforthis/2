import { BattleEventSocket, BattleEventTag, battle_position, unit_id } from "../../../shared/battle_data";
import { Battle } from "../../base_game_classes/battle/battle";
import { UnitData } from "../../base_game_classes/battle/unit";
import { Character } from "../../base_game_classes/character/character";
import { Convert } from "../../systems_communication";
import { User } from "../user";

export namespace Alerts {
    export function not_enough_to_user(user: User, tag: string, required: number, current: number) {
        generic_user_alert(user, 'not_enough', {tag: tag, req: required, cur: current})
    }

    export function in_battle(user: User) {
        generic_user_alert(user, 'alert', 'you are in battle')
    }

    export function character_removed(user: User) {
        generic_user_alert(user, 'char-removed', undefined)
    }

    export function ok(user:User) {
        generic_user_alert(user, 'alert', 'ok')
    }

    export function impossible_move(user: User) {
        generic_user_alert(user, 'alert', 'can\'t go there');
    }

    export function failed(character:Character) {
        generic_character_alert(character, 'alert', 'failed')
    }

    export function no_character(user:User) {
        generic_user_alert(user, 'no-character', '')
    }


    export function log_to_user(user: User, message: string) {
        user.socket.emit('log-message', message);
    }

    export function login_is_completed(user: User) {
        user.socket.emit('is-login-completed', 'ok');
    }

    export function not_enough_to_character(character: Character, tag: string, required: number, current: number) {
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        not_enough_to_user(user, tag, required, current)
    }

    export function generic_user_alert(user: User, tag:string, msg:any) {
        if (!user.logged_in) return
        console.log('emit ' + tag + ' ' + msg)
        user.socket.emit(tag, msg)
    }

    export function generic_character_alert(character: Character, tag: string, msg: any) {
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        generic_user_alert(user, tag, msg)
    }

    export function craft(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'craft-probability', {tag: tag,  value: value})
    }

    export function skill(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'skill', {tag: tag, value: value})
    }

    export function battle_action_chance(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'b-action-chance', {tag: tag, value: value})
    }

    export function battle_event(battle: Battle, tag:BattleEventTag, unit_id:unit_id, position: battle_position, target:unit_id) {
        battle.last_event_index += 1
        const Event:BattleEventSocket = {
            tag: tag,
            creator: unit_id,
            target_position: position,
            target_unit: target,
            index: battle.last_event_index
        }
        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            generic_character_alert(character, 'battle-event', Event)
        }
    }

    export function map_action(user: User, tag: string, data: boolean) {
        Alerts.generic_user_alert(user, 'map-action-status', {tag: tag, value: data})
    }

    export function cell_action(user: User, tag: string, data: number) {
        generic_user_alert(user, 'cell-action-chance', {tag: tag, value: data})
    }

    export function action_ping(character: Character, duration: number, is_move:boolean) {
        generic_character_alert(character, 'action-ping', {tag: 'start', time: duration, is_move: is_move})
    }
}