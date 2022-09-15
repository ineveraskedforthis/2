import { Character } from "../../base_game_classes/character/character";
import { Convert } from "../../systems_communication";
import { User } from "../user";

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
}