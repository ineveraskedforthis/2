import { Perks } from "../../character/Perks";
import { skill } from "../../character/SkillList";
import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { SocketWrapper, User } from "../user";
import { Validator } from "./common_validations";

export namespace SocketCommand {
    // data is a raw id of character
    export function attack_character(socket_wrapper: SocketWrapper, raw_data: unknown) {
        console.log('attack_character ' + raw_data)
        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        const [valid_user, valid_character, target] = Validator.valid_action_to_character(user, character, raw_data)
        if (target == undefined) return        

        Event.start_battle(valid_character, target)
    }

    export function support_character(socket_wrapper: SocketWrapper, raw_data: unknown) {
        console.log('support_character ' + raw_data)
        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        const [valid_user, valid_character, target] = Validator.valid_action_to_character(user, character, raw_data)
        if (target == undefined) return

        Event.support_in_battle(valid_character, target)
    }

    export function learn_perk(sw: SocketWrapper, msg: undefined|{id: unknown, tag: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        let perk_tag = msg.tag

        if (typeof perk_tag != 'string') return
        
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        } 
        if (target_character.perks[perk_tag as Perks] != true) {
            valid_user.socket.emit('alert', "target doesn't know this perk")
            return
        }
        if (valid_character.perks[perk_tag as Perks] == true) {
            valid_user.socket.emit('alert', "you already know it")
            return
        }

        Event.buy_perk(valid_character, perk_tag as Perks, target_character)
    }

    export function learn_skill(sw: SocketWrapper, msg: undefined|{id: unknown, tag: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        let skill_tag = msg.tag

        if (typeof skill_tag != 'string') return

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        } 

        if (valid_character.skills[skill_tag as skill] == undefined) {
            return
        }

        Event.buy_skill(valid_character, skill_tag as skill, target_character)
    }
}