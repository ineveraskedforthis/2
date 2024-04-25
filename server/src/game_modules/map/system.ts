import { trim } from "../calculations/basic_functions";
import { terrain_can_move } from "./terrain";
import { Terrain } from "@custom_types/common";
import { geom, point } from "../geom";
import { world_coordinates } from "@custom_types/common";
import { cell_id, location_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";
import { CellData } from "./cell_interface";
import { DataID } from "../data/data_id";
import { Location } from "../location/location_class";
import { LocationInterface } from "../location/location_interface";

export namespace MapSystem {
    export function sea_nearby(cell: cell_id) {
        let neigbours = Data.World.neighbours(cell)
        for (const item in neigbours) {
            let terrain = Data.World.id_to_terrain(neigbours[item])
            if (terrain == Terrain.sea) {
                return true
            }
        }
        return false
    }

    export function can_clean(location: location_id) {
        const object = Data.Locations.from_id(location)
        return sea_nearby(object.cell_id)
    }

    export function has_forest(location: location_id) {
        const object = Data.Locations.from_id(location)
        return object.forest > 0;
    }

    export function has_cotton(location: location_id) {
        const object = Data.Locations.from_id(location)
        return object.cotton > 0;
    }

    export function has_game(location: location_id) {
        const object = Data.Locations.from_id(location)
        return object.small_game > 0;
    }

    export function has_fish(location: location_id) {
        const object = Data.Locations.from_id(location)
        return object.fish > 0;
    }

    export function forestation(cell: cell_id) {
        let result = 0
        let locations = DataID.Cells.locations(cell)

        for (let location of locations) {
            let object = Data.Locations.from_id(location)
            result += object.forest
        }
        return result
    }

    export function urbanisation(cell: cell_id) {
        let result = 0
        let locations = DataID.Cells.locations(cell)

        for (let location of locations) {
            let object = Data.Locations.from_id(location)
            if (object.has_house_level > 0) result ++;
        }

        return result
    }

    export function rat_lair(cell: cell_id) {
        let result = false;
        let locations = DataID.Cells.locations(cell)

        for (let location of locations) {
            let object = Data.Locations.from_id(location)
            if (object.has_rat_lair) result = true;
        }
        return result
    }

    function update_rat_scent(deltaTime: number, cell: CellData|undefined) {
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
            d_scent -= urbanisation(cell.id) * base_d_scent * 2
        }
        {   //account for forest
            d_scent -= forestation(cell.id) / 100 * base_d_scent
        }
        // fresh sea air
        if (sea_nearby(cell.id)) {
            d_scent -= 10 / 100 * base_d_scent
        }

        // trim to avoid weirdness
        cell.rat_scent = trim(cell.rat_scent + d_scent * 20, -50, 50)
    }

    function update_fish(location: Location) {
        if (sea_nearby(location.cell_id)) {
            if (Math.random() < (10 - location.fish) / 100) {
                location.fish = location.fish + 1
            }
        }
    }

    function update_cotton(location: Location) {
        const competition = forestation(location.cell_id) + location.cotton * 20

        if (Math.random() < 1 - competition / 200) {
            location.cotton = location.cotton + 1
        }
    }

    function update_game(location: Location) {
        const competition = location.small_game * 50 - forestation(location.cell_id)

        if (Math.random() < 1 - competition / 200) {
            location.small_game = location.small_game + 1
        }
    }

    export function update(dt: number) {
        Data.Cells.for_each((cell) => {
            update_rat_scent(dt, cell)
        })

        Data.Locations.for_each((location) => {
            if (Math.random() < 0.001) {
                update_cotton(location)
                update_game(location)
                update_fish(location)
            }
        })
    }

    export function initial_update() {
        Data.Locations.for_each((location) => {
            for (let i = 0; i < 20; i++) {
                update_cotton(location)
                update_game(location)
                update_fish(location)
            }
        })
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

    export function can_move_location(location: LocationInterface) {
        const coord = Data.World.id_to_coordinate(location.cell_id)
        let terrain = Data.World.get_terrain()
        try {
            return terrain_can_move(terrain[coord[0]][coord[1]])
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
                let tmp = dist(queue[i], end) / 100000
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