import { CharacterGenericPart } from "../../base_game_classes/character_generic_part";
import { User } from "../../user";

export namespace Alerts {
    export function not_enough_to_user(user: User, tag: string, required: number, current: number) {
        generic_user_alert(user, 'not_enough', {tag: tag, req: required, cur: current})
    }

    function not_enough_to_character(character: CharacterGenericPart, tag: string, required: number, current: number) {
        let user = character_to_user(character)
        if (user == undefined) return
        not_enough_to_user(user, tag, required, current)
    }

    function generic_user_alert(user: User, tag:string, msg:any) {
        user.socket.emit(tag, msg)
    }

    function generic_character_alert(character, tag, msg) {
        let user = character_to_user(character)
        if (user == undefined) return
        generic_user_alert(user, tag, msg)
    }
}