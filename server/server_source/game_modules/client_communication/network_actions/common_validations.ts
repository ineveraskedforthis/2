import { Character } from "../../character/character";
import { User } from "../user";

const a     = 'a'.charCodeAt(0)
const z     = 'z'.charCodeAt(0)
const A     = 'A'.charCodeAt(0)
const Z     = 'Z'.charCodeAt(0)
const zero  = '0'.charCodeAt(0)
const ku    = '9'.charCodeAt(0)


export namespace Validator {
    export function valid_user(user: User) {
        if (!user.logged_in) return false
        if (user.data.char_id == -1) return false
        if (user.data.id == -1) return false
        return true
    }

    export function isAlphaNum(str: string) {
        let length = str.length
        for (let i = 0; i < length; i++) {
            let char_code = str.charCodeAt(i)
            if ((char_code >= a) && (char_code <= z)) continue;
            if ((char_code >= A) && (char_code <= Z)) continue;
            if ((char_code >= zero) && (char_code <= ku)) continue;
            return false
        }
        return true
    }

    export function validate_creds(data: {login: string, password: string}) {
        if (data.login.length == 0) {
            return 'empty-login';
        }
        if (data.login.length >= 30) {
            return 'too-long';
        }
        if (data.password.length == 0){
            return 'empty-pass';
        }
        if (!isAlphaNum(data.login)){
            return 'login-not-allowed-symbols';
        }
        return 'ok';
    }

    export function can_act(user: User, character: Character) {
        if (!user.logged_in) return false
        if (!character.in_battle) return false
        if (character.dead()) return false

        return true
    }
}