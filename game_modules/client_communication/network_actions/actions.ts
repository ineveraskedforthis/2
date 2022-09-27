import { ActionManager, ActionTargeted, CharacterAction, CharacterActionResponce } from "../../actions/action_manager";
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

        let responce = ActionManager.start_action(CharacterAction.MOVE, character, destination)

        if (responce == CharacterActionResponce.CANNOT_MOVE_THERE) {
            Alerts.impossible_move(user)
        } else if (responce == CharacterActionResponce.IN_BATTLE) {
            Alerts.in_battle(user)
        }
    }

    export function act(sw: SocketWrapper, action: ActionTargeted) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#') return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const destination: [number, number] = [0, 0]

        let responce = ActionManager.start_action(action, character, destination)

        if (responce == CharacterActionResponce.CANNOT_MOVE_THERE) {
            Alerts.impossible_move(user)
        } else if (responce == CharacterActionResponce.IN_BATTLE) {
            Alerts.in_battle(user)
        } else if (responce == CharacterActionResponce.NO_RESOURCE) {
            Alerts.not_enough_to_user(user, '???', 0, 0)
        }
    }
}

    //  move(user: User, data: {x: number, y: number}) {
    //     if (!user.logged_in) {
    //         return 
    //     }
    //     let char = user.get_character();

    // }