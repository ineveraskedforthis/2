module.exports = async function move(pool, data) {
    if (this.in_battle()) {
        return 0
    }
    if (this.world.can_move(data.x, data.y)) {
        let {x, y} = this.world.get_cell_x_y_by_id(this.cell_id)
        let dx = data.x - x;
        let dy = data.y - y;
        if (this.verify_move(dx, dy)) {
            this.changed = true;
            this.cell_id = this.world.get_cell_id_by_x_y(data.x, data.y);
            return await this.on_move_default(pool, data)                
        }
        return 0
    }
    return 0
}