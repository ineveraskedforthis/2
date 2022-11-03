import { CharacterSystem } from "../../base_game_classes/character/system";
import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { SocketWrapper, User } from "../user";
import { UserManagement } from "../user_manager";
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
}