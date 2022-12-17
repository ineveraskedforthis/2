import { Perks } from "../../character/Perks";
import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { SocketWrapper, User } from "../user";
import { Validator } from "./common_validations";

export namespace SocketCommand {
    // data is a raw id of character
    export function attack_character(socket_wrapper: SocketWrapper, raw_data: any) {
        console.log('attack_character ' + raw_data)

        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        if (user == undefined) return
        if (!Validator.can_act(user, character)) {return}
        console.log('user is valid')
            
        const data = Number(raw_data)
        const target_character = Convert.number_to_character(data)
        if (target_character == undefined) return
        console.log('target ccharacter is vaalid')

        Event.start_battle(character, target_character)
    }

    export function learn_perk(sw: SocketWrapper, character_id: number, perk_tag:Perks) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        const data = Number(character_id)
        const target_character = Convert.number_to_character(data)
        if (target_character == undefined) return

        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell')
            return
        }
        if (target_character.perks[perk_tag] != true) {
            user.socket.emit('alert', "target doesn't know this perk")
            return
        }
        if (character.perks[perk_tag] == true) {
            user.socket.emit('alert', "you already know it")
            return
        }

        Event.buy_perk(character, perk_tag, target_character)

    }
}