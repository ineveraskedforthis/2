import { Accuracy } from "../../battle/battle_calcs";
import { Perks, perks_list, perk_price } from "../../character/skills";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { Alerts } from "./alerts";

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
}