import { AttackAction, BattleEventSocket, BattleEventTag, battle_position, unit_id } from "../../../../../shared/battle_data";
import { ItemData } from "../../../../../shared/inventory";
import { AttackObj } from "../../attack/class";
import { Battle } from "../../battle/classes/battle";
import { Unit } from "../../battle/classes/unit";
import { BattleSystem } from "../../battle/system";
import { Character } from "../../character/character";
import { box, CraftBulk, CraftItem } from "../../craft/crafts_storage";
import { Cell } from "../../map/cell";
import { OrderBulkJson } from "../../market/classes";
import { Damage } from "../../misc/damage_types";
import { Convert } from "../../systems_communication";
import { UI_Part } from "../causality_graph";
import { User } from "../user";
import { UserManagement } from "../user_manager";

export namespace Alerts {
    export function not_enough_to_user(user: User, tag: string, required: number, current: number) {
        generic_user_alert(user, 'not_enough', {tag: tag, req: required, cur: current})
    }

    export function market_data(user: User, data: OrderBulkJson[]) {
        generic_user_alert(user, 'market-data', data)
    }
    export function item_market_data(user: User, data: ItemData[]) {
        generic_user_alert(user, 'item-market-data', data)
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

    export function log_attack(character: Character, attack: AttackObj, resistance: Damage, total_damage: number, role: 'defender'|'attacker') {
        generic_character_alert(character, 'log-attack', {
            attack: attack,
            res: resistance,
            total: total_damage,
            role: role
        })
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
        // console.log('emit ' + tag + ' ' + JSON.stringify(msg))
        user.socket.emit(tag, msg)
    }

    export function battle_progress(user: User, flag: boolean) {
        if (!user.logged_in) return
        user.socket.emit('battle-in-process', flag)
    }

    export function generic_character_alert(character: Character, tag: string, msg: any) {
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        generic_user_alert(user, tag, msg)
    }

    export function craft_bulk(user: User, tag: string, value: box[]) {
        Alerts.generic_user_alert(user, 'craft-bulk', {tag: tag, value: value})
    }
    export function craft_bulk_complete(user: User, tag: string, value: CraftBulk) {
        Alerts.generic_user_alert(user, 'craft-bulk-complete', {tag: tag, value: value})
    }

    export function craft_item(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'craft-item', {tag: tag, value: value})
    }
    export function craft_item_complete(user: User, tag: string, value: CraftItem) {
        Alerts.generic_user_alert(user, 'craft-item-complete', {tag: tag, value: value})
    }

    export function skill(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'skill', {tag: tag, value: value})
    }

    export function battle_action_chance(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'b-action-chance', {tag: tag, value: value})
    }

    export function battle_event(battle: Battle, tag:BattleEventTag, unit_id:unit_id, position: battle_position, target:unit_id, cost: number) {
        battle.last_event_index += 1
        const Event:BattleEventSocket = {
            tag: tag,
            creator: unit_id,
            target_position: position,
            target_unit: target,
            index: battle.last_event_index,
            cost: cost,
        }
        if ((tag == 'update') || (tag == 'unit_join')){
            let unit_data = Convert.unit_to_unit_socket(battle.heap.get_unit(unit_id))
            Event.data = unit_data
        }

        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            generic_character_alert(character, 'battle-event', Event)
        }
    }

    export function battle_update_data(battle: Battle) {
        const data = BattleSystem.data(battle)
        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            generic_character_alert(character, 'battle-update-units', data)
        }
    }

    export function battle_update_unit(battle: Battle, unit: Unit) {
        Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0)
        // const data = Convert.unit_to_unit_socket(unit)
        // for (let unit of battle.heap.raw_data) {
        //     const character = Convert.unit_to_character(unit)
        //     generic_character_alert(character, 'battle-update-unit', data)
        // }
    }

    export function battle_to_character(battle: Battle, character: Character) {
        const data = BattleSystem.data(battle)
        generic_character_alert(character, 'battle-update-units', data)
    }

    export function new_unit(battle: Battle, new_unit: Unit) {
        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            generic_character_alert(character, 'battle-new-unit', Convert.unit_to_unit_socket(new_unit))
        }
    }

    export function remove_unit(battle: Battle, removed_unit: Unit) {
        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            generic_character_alert(character, 'battle-remove-unit', Convert.unit_to_unit_socket(removed_unit))
        }
    }

    export function cell_locals(cell: Cell) {
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = Convert.id_to_character(id)
            const local_user = Convert.character_to_user(local_character)
            if (local_user == undefined) {continue}
            UserManagement.add_user_to_update_queue(local_user.data.id, UI_Part.LOCAL_CHARACTERS)
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

    export function perks(user: User, character: Character) {
        console.log(character.perks)
        Alerts.generic_user_alert(user, 'perks-update', character.perks)
    }
}