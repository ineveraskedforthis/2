import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { UserManagement } from "../user_manager";

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

        const destination = {x: x, y: y}
        let res = await this.world.action_manager.start_action(CharacterAction.MOVE, char, data)
        if (res == CharacterActionResponce.CANNOT_MOVE_THERE) {
            user.socket.emit('alert', 'can\'t go there');
        } else if (res == CharacterActionResponce.IN_BATTLE) {
            user.socket.emit('alert', 'you are in battle');
        }
        
    }
}

    // async move(user: User, data: {x: number, y: number}) {
    //     if (!user.logged_in) {
    //         return 
    //     }
    //     let char = user.get_character();

    // }