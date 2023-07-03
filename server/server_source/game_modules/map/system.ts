// import { EloTemplate } from "../races/elo";
// import { BigRatTemplate, RatTemplate } from "../races/rat";
import { Data } from "../data";
// import { Event } from "../events/events";
// import { Factions } from "../factions";
// import { STARTING_DEVELOPMENT, STARTING_RESOURCES, STARTING_TERRAIN, WORLD_SIZE } from "../static_data/map_definitions";
// import { cell_id, world_coordinates } from "../types";
// import { Cell} from "./cell";
import { Template } from "../templates";
import { trim } from "../calculations/basic_functions";
// import { Convert } from "../systems_communication";
// import { MEAT } from "../manager_classes/materials_manager";
// import { Building } from "../DATA_LAYOUT_BUILDING";
// import { Cell } from "./DATA_LAYOUT_CELL";
import { Terrain, terrain_can_move } from "./terrain";
import { cell_id } from "../../../../shared/common";
import { Cell } from "./DATA_LAYOUT_CELL";
import { geom, point } from "../geom";
import { world_coordinates } from "../types";

// var size:world_dimensions = [0, 0]
// var max_direction:number = 30

// const dp = 

export namespace MapSystem {
    export function cells() {
        return Data.Cells.list()
    }

    export function initial_load() {
        console.log('loading map')        
    }

    export function get_size() {
        return Data.World.get_world_dimensions()
    }

    export function can_hunt(cell_id: cell_id) {
       return Data.Cells.has_game(cell_id)
    }

    export function can_fish(cell_id: cell_id) {
        return Data.Cells.has_fish(cell_id)
        // if (Data.World.id_to_terrain(cell_id) == Terrain.coast) return true
        // if (Data.Cells.sea_nearby(cell_id)) return true
        // return false
    }

    export function has_market(cell_id: cell_id) {
        if (Data.World.id_to_market(cell_id)) return true
        return false
    }

    export function has_wood(cell_id: cell_id) {
        if (Data.Cells.forestation(cell_id) > 0) return true
        return false
    }

    const max_scent = 50

    function update_rat_scent(deltaTime: number, cell: Cell|undefined) {
        if (cell == undefined) return
        // constant change by dt / 100
        let base_d_scent = deltaTime / 10000
        // constant decay
        let d_scent = -1 * base_d_scent * cell.rat_scent
        // cell.rat_scent -=dt / 100
        {
            // take an average of scent around
            let total = 0
            let neighbours = Data.World.neighbours(cell.id)
            for (let neighbour of neighbours) {
                const neigbour_cell = Data.Cells.from_id(neighbour)
                total += neigbour_cell.rat_scent 
            }
            const average = total / neighbours.length * 1
            d_scent += base_d_scent * (average - cell.rat_scent) * 5
        }

        {   //account for urbanisation
            d_scent -= Data.Cells.urbanisation(cell.id) * base_d_scent
        }
        {   //account for forest
            d_scent -= Data.Cells.forestation(cell.id) / 100 * base_d_scent
        }

        // trim to avoid weirdness
        cell.rat_scent = trim(cell.rat_scent + d_scent * 20, -50, 50)
    }

    function update_market_scent(cell: Cell) {
        if (cell == undefined) return                        
        let temp = 0
        if (Data.World.id_to_terrain(cell.id) == Terrain.sea) {
            temp = -999
        } else if (Data.Cells.has_market(cell.id)) {
            temp = 200
        } else {
            // let neighbours = neighbours_cells(cell.id)
            let neighbours = Data.World.neighbours(cell.id)
            let max = 0
            for (let item of neighbours) {
                let cell_object = Data.Cells.from_id(item)
                if (cell_object.market_scent > max) {
                    max = cell_object.market_scent
                }
            }
            temp = max - 1
        }
        cell.market_scent = temp
    }

    function update_fish(cell: Cell) {
        if (Data.Cells.sea_nearby(cell.id)) {
            if (Math.random() < (10 - cell.fish) / 100) {
                cell.fish = cell.fish + 1
            }
        }
    }

    function update_cotton(cell: Cell) {
        const competition = Data.Cells.forestation(cell.id) + cell.cotton * 20

        if (Math.random() < 1 - competition / 200) {
            cell.cotton = cell.cotton + 1
        }
    }

    function update_game(cell: Cell) {
        const competition = cell.game * 50 - Data.Cells.forestation(cell.id)

        if (Math.random() < 1 - competition / 200) {
            cell.game = cell.game + 1
        }
    }

    export function update(dt: number) {
        const cells = Data.Cells.list() 
        for (const cell of cells) {
            update_rat_scent(dt, cell)
            update_market_scent(cell)
            if (Math.random() < 0.001) {
                update_cotton(cell)
                update_game(cell)
                update_fish(cell)
            }            
        }
    }

    export function initial_update() {
        const cells = Data.Cells.list() 
        for (const cell of cells) {
            for (let i = 0; i < 20; i++) {
                update_cotton(cell)
                update_game(cell)
                update_fish(cell)
            }            
        }
    }

    export function can_move(pos: [number, number]) {
        if (!Data.World.validate_coordinates(pos)) return false 
        let terrain = Data.World.get_terrain()
        try {
            return terrain_can_move(terrain[pos[0]][pos[1]])
        } catch (error) {
            return false
        }
    }

    export function is_valid_move(dx: number, dy: number) {
        return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1))
    }

    function extract_path(prev: Record<cell_id, cell_id|undefined>, start: cell_id, end: cell_id) {
        let path = []
        let current = end
        while (current != start) {
            path.push(current)
            let previous = prev[current]
            if (previous == undefined) {
                return undefined
            } else {
                current = previous
            }
        }
        path.push(start)
        return path.reverse()
    }

    export function find_path_full(start: cell_id, end: cell_id): cell_id[]|undefined {
        let current = start
        let queue: cell_id[] = [current];
        let prev: Record<cell_id, cell_id|undefined> = {}
        prev[current] = undefined
        let used: Record<cell_id, boolean> = {}
        let right = 1;
        let next = 0
        while ((next != -1) && (right < 400)) {
            current = queue[next]
            used[current] = true
            for (let neighbour of Data.World.neighbours(current)) {
                if (Data.World.id_to_terrain(neighbour) == Terrain.sea) continue
                if (Data.World.id_to_terrain(neighbour) == Terrain.rupture) continue
                if (Data.World.id_to_terrain(neighbour) == Terrain.void) continue
                if (used[neighbour]) continue
                queue[right] = neighbour;
                prev[neighbour] = current
                right++;
                if (neighbour == end) {
                    return extract_path(prev, start, end)
                }
            }

            let heur_score = 9999
            next = -1
            for (let i = 0; i < right; i++) {
                let tmp = dist(queue[i], start) / 100000
                if ((tmp < heur_score) && (!used[queue[i]])) {
                    next = i;
                    heur_score = tmp
                }
            }
        }
        return extract_path(prev, start, end)
    }

    export function find_path(start: cell_id, end: cell_id): cell_id|undefined {
        let path = find_path_full(start, end)
        if (path == undefined) return undefined
        return path[1]
    }

    function dist(a: cell_id, b: cell_id) {
        const a_coord = Data.World.id_to_coordinate(a)
        const b_coord = Data.World.id_to_coordinate(b)
        let a_center = get_hex_centre(a_coord)
        let b_center = get_hex_centre(b_coord)
        return geom.dist(a_center, b_center)
    }

    function get_hex_centre([x, y]: world_coordinates): point {
        var h = Math.sqrt(3) / 2;
        var w = 1 / 2;
        var tx = (1 + w) * x 
        var ty = 2 * h * y - h * x 
        return {x: tx, y: ty};
    }

}