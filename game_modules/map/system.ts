import { STARTING_DEVELOPMENT, STARTING_RESOURCES, WORLD_SIZE } from "../static_data/map_definitions";
import { cell_id, world_dimensions } from "../types";
import { Cell} from "./cell";

var size:world_dimensions = [0, 0]
var max_direction:number = 0
var cells:(Cell|undefined)[] = []

const dp = [[0, 1], [0 ,-1],[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]

export namespace MapSystem {
    export function load() {
        size = WORLD_SIZE
        max_direction = Math.max(size[0], size[1])
        const development = STARTING_DEVELOPMENT
        const resources = STARTING_RESOURCES

        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                const string = x + '_' + 'y'
                const id = coordinate_to_id(x, y)
                const cell = new Cell(coordinate_to_id(x, y), x, y, string, development[string], resources[string])
                cells[id] = cell
            }
        }
    }

    export function coordinate_to_id(x:number, y:number) {
        return x * max_direction + y as cell_id
    }

    export function id_to_coordinate(id: cell_id): [number, number] {
        return [Math.floor(id / max_direction), id - Math.floor(id / max_direction)]
    }

    export function coordinate_to_cell(p: [number, number]) {
        let id = coordinate_to_id(p[0], p[1])
        return id_to_cell(id)
    }

    export function id_to_cell(id: cell_id) {
        return cells[id]
    }

    export function neighbours(id: cell_id) {
        let arr = []
        const [x, y] = id_to_coordinate(id)
        for (const [s, t] of dp) {
            const [x1, y1] = [x + s, y + t]
            if (validate_coordinates([x1, y1])) {
                arr.push([x1, y1])
            }
        }
        return arr
    }

    export function validate_coordinates([x, y]: [number, number]): boolean {
        return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]) 
    }

    export function update(dt: number) {
        for (const cell of cells) {
            if (cell == undefined) continue
            cell.update(dt)
        }
    }
}