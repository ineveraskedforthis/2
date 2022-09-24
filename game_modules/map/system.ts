import { STARTING_DEVELOPMENT, STARTING_RESOURCES, WORLD_SIZE } from "../static_data/map_definitions";
import { cell_id, world_dimensions } from "../types";
import { Cell } from "./cell";

var size:world_dimensions = {height: 0, width: 0}
var max_direction:number = 0
var cells:Cell[] = []

export namespace MapSystem {
    export function load() {
        size = WORLD_SIZE
        max_direction = Math.max(size.height, size.width)
        const development = STARTING_DEVELOPMENT
        const resources = STARTING_RESOURCES

        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                const cell = new Cell()
            }
        }
    }

    export function coordinate_to_id(x:number, y:number) {
        return x * max_direction + y as cell_id
    }

    export function id_to_coordinate(id: cell_id): {x: number, y: number} {
        return {
            x: Math.floor(id / max_direction),
            y: id - Math.floor(id / max_direction)
        }
    }

    export function coordinate_to_cell() {

    }
}


async init_cells(pool: PgPool) {
    let data: {[_ in string]: any} = this.world.constants.development 
    let data_res: {[_ in string]: any} = this.world.constants.resources
    for (var i = 0; i < this.world.x; i++) {
        var tmp = []
        for (var j = 0; j < this.world.y; j++) {
            var cell = new Cell(this.world, this, i, j, '', data[i + '_' + j], data_res[i + '_' + j]);
            await cell.init(pool);
            tmp.push(cell);
        }
        this.cells.push(tmp);
    }
}

async load_cells(pool: PgPool) {
    for (let i = 0; i < this.world.x; i++) {
        let tmp = []
        for (let j = 0; j < this.world.y; j++) {
            let cell = new Cell(this.world, this, i, j, '', {rural: 0, ruins:0, urban:0, wild: 0, wastelands: 0}, {water: false, prey: false, fish: false, forest: false});
            tmp.push(cell);
        }
        this.cells.push(tmp);
    }

    for (let i = 0; i < this.world.x; i++) {
        for (let j = 0; j < this.world.y; j++) {
            await this.cells[i][j].load(pool);
        }
    }
}

get_cell(x: number, y: number) {
    if (this.validate_cell(x, y)){
        return this.cells[x][y];
    }
    return undefined
}

validate_cell(x: number, y: number) {
    return (y >= 0) && (y < this.world.y) && (x >= 0) && (x < this.world.x)
}

get_cell_by_id(id: number) {
    // console.log(id);
    return this.get_cell(Math.floor(id / this.world.y), id % this.world.y);
}

get_cell_id_by_x_y(x: number, y: number) {
    return x * this.world.y + y
}