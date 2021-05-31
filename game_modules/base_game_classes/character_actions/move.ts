import { CharacterGenericPart } from "../character_generic_part";
import {CharacterActionResponce} from '../../manager_classes/action_manager'

export const move ={
    check: async function (pool: any, char: CharacterGenericPart, data: any) {
        if (char.in_battle()) {
            return CharacterActionResponce.IN_BATTLE
        }
        if (data.x < 0 || data.x >= char.world.x) {
            return CharacterActionResponce.CANNOT_MOVE_THERE
        }
        if (data.y < 0 || data.y >= char.world.y) {
            return CharacterActionResponce.CANNOT_MOVE_THERE
        }

        if (char.world.can_move(data.x, data.y)) {
            let {x, y} = char.world.get_cell_x_y_by_id(char.cell_id)
            let dx = data.x - x;
            let dy = data.y - y;
            if (char.verify_move(dx, dy)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.CANNOT_MOVE_THERE
        }
        return CharacterActionResponce.CANNOT_MOVE_THERE
    },

    start: async function (pool: any, char: CharacterGenericPart, data: any) {
        char.action_target = data
    },

    result: async function (pool: any, char: CharacterGenericPart) {
        char.changed = true;
        let data = char.action_target
        char.cell_id = char.world.get_cell_id_by_x_y(data.x, data.y);
        let user = char.get_user()
        user.socket.emit('map-pos', data);
        char.send_status_update()
        return await char.on_move_default(pool, data)   
    }
}