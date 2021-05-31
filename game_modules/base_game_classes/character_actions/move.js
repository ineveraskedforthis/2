"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
exports.move = {
    check: async function (pool, char, data) {
        if (char.in_battle()) {
            return 2 /* IN_BATTLE */;
        }
        if (data.x < 0 || data.x >= char.world.x) {
            return 0 /* CANNOT_MOVE_THERE */;
        }
        if (data.y < 0 || data.y >= char.world.y) {
            return 0 /* CANNOT_MOVE_THERE */;
        }
        if (char.world.can_move(data.x, data.y)) {
            let { x, y } = char.world.get_cell_x_y_by_id(char.cell_id);
            let dx = data.x - x;
            let dy = data.y - y;
            if (char.verify_move(dx, dy)) {
                return 1 /* OK */;
            }
            return 0 /* CANNOT_MOVE_THERE */;
        }
        return 0 /* CANNOT_MOVE_THERE */;
    },
    start: async function (pool, char, data) {
        char.action_target = data;
    },
    result: async function (pool, char) {
        char.changed = true;
        let data = char.action_target;
        char.cell_id = char.world.get_cell_id_by_x_y(data.x, data.y);
        let user = char.get_user();
        user.socket.emit('map-pos', data);
        char.send_status_update();
        return await char.on_move_default(pool, data);
    }
};
