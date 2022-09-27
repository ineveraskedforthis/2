import { ActionManager, CharacterAction, CharacterActionResponce } from "../../actions/action_manager";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { UserManagement } from "../user_manager";
import { Alerts } from "./alerts";

export namespace HandleAction {
    export function move(sw: SocketWrapper, data: {x: unknown, y: unknown}) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#') return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        // sanitise data
        const x = Number(data.x)
        const y = Number(data.y)
        if ((x == NaN) || (y == NaN)) {
            return
        }

        const destination: [number, number] = [x, y]

        let responce = ActionManager.start_action_targeted(CharacterAction.MOVE, character, destination)

        if (responce == CharacterActionResponce.CANNOT_MOVE_THERE) {
            Alerts.impossible_move(user)
        } else if (responce == CharacterActionResponce.IN_BATTLE) {
            Alerts.in_battle(user)
        }
    }
}

    //  move(user: User, data: {x: number, y: number}) {
    //     if (!user.logged_in) {
    //         return 
    //     }
    //     let char = user.get_character();

    // }