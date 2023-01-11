import { Attack } from "../../attack/system";
import { Accuracy } from "../../battle/battle_calcs";
import { BattleEvent } from "../../battle/events";
import { Perks, perks_list, perk_price } from "../../character/Perks";
import { DmgOps } from "../../misc/damage_types";
import { UNIT_ID_MESSAGE } from "../../static_data/constants";
import { Convert } from "../../systems_communication";
import { Update } from "../causality_graph";
import { SocketWrapper } from "../user";
import { Alerts } from "./alerts";
import { SendUpdate } from "./updates";


export namespace Request {
    export function accuracy(sw: SocketWrapper, distance: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        // console.log('request accuracy ' + distance)
        if (character == undefined) return;
        if (!user.logged_in) {
            return 
        }
        if (isNaN(distance)) {
            // console.log('not_a_number')
            return 
        }
        
        const acc = Accuracy.ranged(character, distance)
        // console.log(acc)
        Alerts.battle_action_chance(user, 'shoot', acc)

        let magic_bolt = DmgOps.total(Attack.generate_magic_bolt(character, distance).damage)
        Alerts.battle_action_damage(user, 'magic_bolt', magic_bolt)
    }

    export function perks(sw: SocketWrapper, character_id: number) {
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

        let data = target_character.perks
        let responce:{[_ in Perks]?: number} = {}
        for (let perk of perks_list) {
            if (data[perk] == true) {
                responce[perk] = perk_price(perk, character, target_character)
            }
        }
        
        sw.socket.emit('perks-info', responce)
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
        Alerts.battle_action_chance(user, 'flee', BattleEvent.flee_chance(unit.position))
    }

    export function attack_damage(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return
        }
        
        SendUpdate.attack_damage(user)
    }
}