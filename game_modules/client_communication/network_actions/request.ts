import { Accuracy } from "../../base_game_classes/battle/battle_calcs";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { Alerts } from "./alerts";

export namespace Request {
    export function accuracy(sw: SocketWrapper, distance: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return;
        if (!user.logged_in) {
            return 
        }
        if (isNaN(distance)) {
            return 
        }
        
        const acc = Accuracy.ranged(character, distance)
        Alerts.battle_action_chance(user, 'shoot', acc)
    }
}