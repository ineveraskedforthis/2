import { CharacterGenericPart } from "../../base_game_classes/character_generic_part";
import { User } from "../../user";
import { Convert } from "../conversions";
import { users_data_list, users_online_list } from "../user_manager";

export namespace Alerts {
    export function not_enough_to_user(user: User, tag: string, required: number, current: number) {
        generic_user_alert(user, 'not_enough', {tag: tag, req: required, cur: current})
    }

    export function log_to_user(user: User, message: string) {
        user.socket.emit('log-message', message);
    }

    export function login_is_completed(user: User) {
        user.socket.emit('is-login-completed', 'ok');
    }

    export function not_enough_to_character(character: CharacterGenericPart, tag: string, required: number, current: number) {
        let user = Convert.character_to_user(users_data_list, users_online_list, character)
        if (user == undefined) return
        not_enough_to_user(user, tag, required, current)
    }

    export function generic_user_alert(user: User, tag:string, msg:any) {
        if (!user.logged_in) return
        user.socket.emit(tag, msg)
    }

    export function generic_character_alert(character: CharacterGenericPart, tag: string, msg: any) {
        let user = Convert.character_to_user(users_data_list, users_online_list, character)
        if (user == undefined) return
        generic_user_alert(user, tag, msg)
    }
}