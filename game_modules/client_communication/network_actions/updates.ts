import { Convert } from "../../systems_communication";
import { User } from "../user";
import { Alerts } from "./alerts";

export namespace SendUpdate {
    export function savings(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'savings', character.savings.get())
        Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get()) 
    }

    export function status(user: User) {
        let character = Convert.user_to_character(user)
        console.log(character)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'status', {c: character.status, m: character.stats.max})

        // this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    }
}