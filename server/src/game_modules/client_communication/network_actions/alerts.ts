import { BattleKeyframeSocket, BattleEventTag, battle_position } from "../../../../../shared/battle_data";
import { ItemData, skill } from "../../../../../shared/inventory";
import { AttackObj } from "../../attack/class";
import { Battle } from "../../battle/classes/battle";
import { BattleSystem } from "../../battle/system";
import { Character } from "../../character/character";
import { CraftBulkTemplate, CraftItemTemplate, box } from "@custom_types/inventory";
import { MarketOrderJson } from "../../market/classes";
import { Damage } from "../../Damage";
import { Convert } from "../../systems_communication";
import { UI_Part } from "../causality_graph";
import { User } from "../user";
import { UserManagement } from "../user_manager";
import { cell_id } from "@custom_types/ids";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { CHANGE_REASON } from "../../effects/effects";
import { Stash } from "../../inventories/stash";
import { MATERIAL, MaterialConfiguration, MaterialStorage } from "@content/content";

export namespace Alerts {
    export function not_enough_to_user(
        user: User,
        tag: string,
        current: number|undefined,
        min: number|undefined,
        max: number|undefined)
    {
        generic_user_alert(user, 'not_enough', {tag: tag, min: min, max: max, cur: current})
    }

    export function market_data(user: User, data: MarketOrderJson[]) {
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

    export function log_to_character(character: Character, message: string) {
        generic_character_alert(character, 'log-message', message)
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

    export function not_enough_to_character(
        character: Character,
        tag: string,
        current: number,
        min: number|undefined,
        max: number|undefined)
    {
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        not_enough_to_user(user, tag, current, min, max)
    }

    export function generic_user_alert(user: User, tag:string, msg:any) {
        if (!user.logged_in) return
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
        for (let item of value) {
            Alerts.generic_user_alert(user, `val_${tag}_craft_output_${item.material}_c`, item.amount)
        }
    }
    export function craft_bulk_complete(user: User, tag: string, value: CraftBulkTemplate) {
        Alerts.generic_user_alert(user, 'craft-bulk-complete', {tag: tag, value: value})
    }

    export function craft_item(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, `val_${tag}_craft_durability_c`, value)
    }
    export function craft_item_complete(user: User, tag: string, value: CraftItemTemplate) {
        Alerts.generic_user_alert(user, 'craft-item-complete', {tag: tag, value: value})
    }

    export function skill(user: User, tag: string, pure_value: number, current_value: number) {
        Alerts.generic_user_alert(user, `val_${tag}_c`, current_value)
    }

    export function battle_action_chance(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'b-action-chance', {tag: tag, value: value})
    }

    export function battle_action_damage(user: User, tag: string, value: number) {
        Alerts.generic_user_alert(user, 'b-action-damage', {tag: tag, value: value})
    }

    export function battle_event_target_unit(battle: Battle, tag: BattleEventTag, unit: Character, target: Character) {
        battle.last_event_index += 1

        const actor_data = Convert.unit_to_unit_socket(unit)
        actor_data.action = {
            action: tag,
            target: target.id,
            type: "unit"
        }

        const target_data = Convert.unit_to_unit_socket(target)

        const event : BattleKeyframeSocket = {
            index: battle.last_event_index,
            data: [
                actor_data, target_data
            ]
        }

        battle.battle_history[event.index] = event

        for (let unit_id of Object.values(battle.heap)) {
            if (unit_id == undefined) continue;
            const unit = Data.Characters.from_id(unit_id)
            generic_character_alert(unit, 'battle-event', event)
        }
    }

    export function battle_event_simple(battle: Battle, tag: BattleEventTag, unit: Character) {
        battle.last_event_index += 1

        const actor_data = Convert.unit_to_unit_socket(unit)
        actor_data.action = {
            action: tag,
            target: unit.id,
            type: "unit"
        }

        const event : BattleKeyframeSocket = {
            index: battle.last_event_index,
            data: [
                actor_data
            ]
        }

        battle.battle_history[event.index] = event

        for (let unit of battle.heap) {
            if (unit == undefined) continue
            const character = Data.Characters.from_id(unit)
            generic_character_alert(character, 'battle-event', event)
        }
    }

    export function battle_event_target_position(battle: Battle, tag: BattleEventTag, unit: Character, position: battle_position) {
        battle.last_event_index += 1

        const actor_data = Convert.unit_to_unit_socket(unit)
        actor_data.action = {
            action: tag,
            target: position,
            type: "position"
        }

        const event : BattleKeyframeSocket = {
            index: battle.last_event_index,
            data: [
                actor_data
            ]
        }

        battle.battle_history[event.index] = event

        for (let unit of battle.heap) {
            if (unit == undefined) continue
            const character = Data.Characters.from_id(unit)
            generic_character_alert(character, 'battle-event', event)
        }
    }

    export function battle_update_data(battle: Battle) {
        const data = BattleSystem.data(battle)
        for (let unit of battle.heap) {
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            generic_character_alert(character, 'battle-update-units', data)
        }
    }

    export function battle_update_units(battle: Battle) {
        for (let unit of battle.heap) {
            if (unit == undefined) continue;
            Alerts.battle_event_simple(battle, 'update', Data.Characters.from_id(unit))
        }
    }

    export function battle_update_unit(battle: Battle, unit: Character) {
        Alerts.battle_event_simple(battle, 'update', unit)
    }

    export function battle_to_character(battle: Battle, character: Character) {
        const data = BattleSystem.data(battle)
        generic_character_alert(character, 'battle-update-units', data)
    }

    export function new_unit(battle: Battle, new_unit: Character) {
        for (let unit of battle.heap) {
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            generic_character_alert(character, 'battle-new-unit', Convert.unit_to_unit_socket(new_unit))
        }
    }

    export function remove_unit(battle: Battle, removed_unit: Character) {
        for (let unit of battle.heap) {
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            generic_character_alert(character, 'battle-remove-unit', removed_unit)
        }
    }

    export function cell_locals(cell: cell_id) {
        const locals = DataID.Cells.local_character_id_list(cell)
        for (let item of locals) {
            // const id = item.id
            const local_character = Data.Characters.from_id(item)
            const local_user = Convert.character_to_user(local_character)
            if (local_user == undefined) {continue}
            UserManagement.add_user_to_update_queue(local_user.data.id, UI_Part.LOCAL_CHARACTERS)
        }
    }

    export function action_ping(character: Character, duration: number, is_move:boolean) {
        generic_character_alert(character, 'action-ping', {tag: 'start', time: duration, is_move: is_move})
    }

    export function perks(user: User, character: Character) {
        Alerts.generic_user_alert(user, 'perks-update', character._perks)
    }

    export function traits(user: User, character: Character) {
        Alerts.generic_user_alert(user, 'traits-update', character._traits)
    }

    export function enter_room(character: Character) {
        Alerts.generic_character_alert(character, 'enter-room', character)
    }

    export function leave_room(character: Character) {
        Alerts.generic_character_alert(character, 'leave-room', character)
    }

    export namespace Log {
        export function to_trade_stash(A: Character, material: MATERIAL, amount: number) {
            Alerts.log_to_character(A, `You moved ${amount} of ${MaterialStorage.get(material).name} to your trade stash. Cancel your market order to return it back.`)
        }

        export function from_trade_stash(A: Character, material: MATERIAL, amount: number) {
            Alerts.log_to_character(A, `You moved ${amount} of ${MaterialStorage.get(material).name} from your trade stash.`)
        }

        export function to_trade_savings(A: Character, amount: number) {
            Alerts.log_to_character(A, `You moved ${amount} money to your trade savings. Cancel your market order to return it back.`)
        }

        export function from_trade_savings(A: Character, amount: number) {
            Alerts.log_to_character(A, `You moved ${amount} money from your trade savings.`)
        }

        export function savings_transfer(from: Character, to: Character, amount: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(from, `You transfered ${amount} money to ${to.name}(${to.id}). Reason:${reason}`)
            Alerts.log_to_character(to, `You got ${amount} money from ${from.name}(${to.id}). Reason:${reason}`)
        }

        export function stash_transfer(from: Character, to: Character, transfer: Stash, reason: CHANGE_REASON) {
            for (const m of MaterialConfiguration.MATERIAL) {
                const amount = transfer.get(m)
                material_transfer(from, to, m, amount, reason)
            }
        }

        export function material_transfer(from: Character, to: Character, what: MATERIAL, amount: number, reason: CHANGE_REASON) {
            if (amount == 0) return;
            Alerts.log_to_character(from, `You transfered ${amount} of ${MaterialStorage.get(what).name} to ${to.name}(${to.id}). Reason:${reason}`)
            Alerts.log_to_character(to, `You got ${amount} of ${MaterialStorage.get(what).name} from ${from.name}(${to.id}). Reason:${reason}`)
        }

        export function hp_change(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your hp changed by ${d}. Reason: ${reason}`)
        }

        export function stress_change(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your stress changed by ${d}. Reason: ${reason}`)
        }

        export function fatigue_change(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your fatigue changed by ${d}. Reason: ${reason}`)
        }

        export function blood_change(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your blood changed by ${d}. Reason: ${reason}`)
        }

        export function rage_change(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your rage changed by ${d}. Reason: ${reason}`)
        }

        export function hp_set(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your hp was set to ${d}. Reason: ${reason}`)
        }

        export function stress_set(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your stress was set to ${d}. Reason: ${reason}`)
        }

        export function fatigue_set(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your fatigue was set to ${d}. Reason: ${reason}`)
        }

        export function blood_set(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your blood was set to ${d}. Reason: ${reason}`)
        }

        export function rage_set(character: Character, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your rage was set to ${d}. Reason: ${reason}`)
        }

        export function skill_change(character: Character, skill: skill, d: number, reason: CHANGE_REASON) {
            Alerts.log_to_character(character, `Your ${skill} skill changed by ${d}. Reason: ${reason}`)
        }
    }
}