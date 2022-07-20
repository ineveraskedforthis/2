"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
exports.move = {
    duration(char) {
        return 1 + char.get_fatigue() / 30;
    },
    check: async function (pool, char, data) {
        if (char.in_battle()) {
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        }
        if (char.world.can_move(data.x, data.y)) {
            let { x, y } = char.world.get_cell_x_y_by_id(char.cell_id);
            let dx = data.x - x;
            let dy = data.y - y;
            if (char.verify_move(dx, dy)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            if ((dx == 0 && dy == 0)) {
                return 7 /* CharacterActionResponce.ZERO_MOTION */;
            }
            return 0 /* CharacterActionResponce.CANNOT_MOVE_THERE */;
        }
        return 0 /* CharacterActionResponce.CANNOT_MOVE_THERE */;
    },
    start: async function (pool, char, data) {
        char.action_target = data;
    },
    result: async function (pool, char) {
        char.changed = true;
        let data = char.action_target;
        let old_cell = char.get_cell();
        if (old_cell != undefined) {
            old_cell.exit(char);
        }
        char.cell_id = char.world.get_cell_id_by_x_y(data.x, data.y);
        let new_cell = char.get_cell();
        if (new_cell != undefined) {
            new_cell.enter(char);
        }
        char.change_fatigue(2);
        if (char.is_player()) {
            let user = char.get_user();
            if (user.socket != undefined) {
                data.teleport_flag = false;
                user.socket.emit('map-pos', data);
                char.update_visited();
                char.send_status_update();
            }
        }
        char.world.entity_manager.transfer_orders(char, char.cell_id);
        if (old_cell != undefined)
            char.world.socket_manager.send_item_market_update(old_cell.id);
        if (new_cell != undefined)
            char.world.socket_manager.send_item_market_update(new_cell.id);
        return await char.on_move_default(pool, data);
    },
    is_move: true
};
