import { User } from "../../user";

export namespace ValidatorSM {
    export function valid_user(user: User) {
        if (!user.logged_in) return false
        if (user.char_id == -1) return false
        if (user.id == -1) return false
        return true
    }
}