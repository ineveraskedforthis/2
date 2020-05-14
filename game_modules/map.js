var Cell = require("./cell.js")

module.exports = class Map {
    async init(pool, world) {
        this.world = world;
        this.x = world.x;
        this.y = world.y;
        this.cells = [];
        for (var i = 0; i < this.x; i++) {
            var tmp = []
            for (var j = 0; j < this.y; j++) {
                var cell = new Cell();
                await cell.init(pool, world, this, i, j, null, -1);
                tmp.push(cell);
            }
            this.cells.push(tmp);
        }
    }

    async update(pool) {
        for (var i = 0; i < this.x; i++) {
            for (var j = 0; j < this.y; j++) {
                await this.cells[i][j].update(pool);
            }
        }
    }

    get_cell(x, y) {
        return this.cells[x][y];
    }

    get_cell_by_id(id) {
        return this.get_cell(Math.floor(id / this.y), id % this.y);
    }
}