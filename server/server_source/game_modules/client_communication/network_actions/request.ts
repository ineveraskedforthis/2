import { Accuracy } from "../../battle/battle_calcs";
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
}