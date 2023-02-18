import { EloTemplate } from "../races/elo";
import { BigRatTemplate, RatTemplate } from "../races/rat";
import { Data } from "../data";
import { Event } from "../events/events";
import { Factions } from "../factions";
import { STARTING_DEVELOPMENT, STARTING_RESOURCES, STARTING_TERRAIN, WORLD_SIZE } from "../static_data/map_definitions";
import { cell_id, world_dimensions } from "../types";
import { Cell} from "./cell";
import { Template } from "../templates";
import { trim } from "../calculations/basic_functions";

var size:world_dimensions = [0, 0]
var max_direction:number = 30
var cells:(Cell|undefined)[] = []

const dp = [[0, 1], [0 ,-1],[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]

export namespace MapSystem {
    export function get_cells() {
        return cells
    }

    export function load() {
        console.log('loading map')
        size = WORLD_SIZE
        max_direction = Math.max(size[0], size[1])
        const development = STARTING_DEVELOPMENT
        const resources = STARTING_RESOURCES
        const terrain = STARTING_TERRAIN

        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                const string = x + '_' + y
                const id = coordinate_to_id(x, y)
                const tmp = terrain[x]
                if (tmp == undefined) continue
                const cell = new Cell(coordinate_to_id(x, y), x, y, string, development[string], resources[string], tmp[y])
                cells[id] = cell
            }
        }

        console.log('map is loaded')
    }

    export function get_size() {
        return size
    }

    export function coordinate_to_id(x:number, y:number) {
        return x * max_direction + y as cell_id
    }

    export function id_to_coordinate(id: cell_id): [number, number] {
        return [Math.floor(id / max_direction), id - Math.floor(id / max_direction) * max_direction]
    }

    export function coordinate_to_cell(p: [number, number]) {
        let id = coordinate_to_id(p[0], p[1])
        return id_to_cell(id)
    }

    export function id_to_cell(id: cell_id) {
        return cells[id]
    }

    export function SAFE_id_to_cell(id: cell_id) {
        return cells[id] as Cell
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

    export function neighbours_cells(id: cell_id): Cell[] {
        let arr = []
        const [x, y] = id_to_coordinate(id)
        for (const [s, t] of dp) {
            const [x1, y1] = [x + s, y + t]
            if (validate_coordinates([x1, y1])) {
                let cell = coordinate_to_cell([x1, y1])
                if (cell != undefined) arr.push(cell)
            }
        }
        return arr
    }

    export function validate_coordinates([x, y]: [number, number]): boolean {
        return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]) 
    }

    const max_scent = 50

    export function update(dt: number, rats_number: number, elodino_number: number) {
        
        // updating rat scent

        for (const cell of cells) {
            if (cell == undefined) continue

            // constant change by dt / 100
            let base_d_scent = dt / 100

            // constant decay
            let d_scent = -1 * base_d_scent

            // cell.rat_scent -=dt / 100
            
            // then calculate base scent change
            if (cell.development.rats == 1) {
                // lairs always have 50 scent
                cell.rat_scent = max_scent
            } else {
                // take an average of scent around
                let total = 0
                let neighbours = neighbours_cells(cell.id)
                for (let neighbour of neighbours) {
                    total += neighbour.rat_scent 
                }
                const average = total / neighbours.length * 0.95

                d_scent += base_d_scent * (average - cell.rat_scent) * 5
                // cell.rat_scent = total
            }

            if (cell.development.urban > 0) {
                d_scent -= 30 * base_d_scent
            }

            if (cell.development.rural > 0) {
                d_scent -= 20 * base_d_scent
            }

            if (cell.development.wild > 0) {
                d_scent -= 20 * base_d_scent
            }

            // add scent to cells with rats
            // let guests = cell.characters_set
            // let rats = 0
            // for (let guest of guests) {
            //     let character = Data.CharacterDB.from_id(guest)
            //     if (character.race() == 'rat') rats += 1
            // }

            // cell.rat_scent += rats

            // trim to avoid weirdness
            cell.rat_scent = trim(cell.rat_scent + d_scent * 20, 0, 50)
        }

        for (const cell of cells) {
            if (cell == undefined) continue
            cell.update(dt)
            if ((rats_number < 120) && (cell.development.rats == 1)) {
                let dice = Math.random()
                if (dice < 0.6) {
                    let rat = Event.new_character(RatTemplate, undefined, cell.id, undefined)
                    Data.Reputation.set(Factions.Rats.id, rat.id, 'member')
                } else if (dice < 0.8) {
                    let rat = Event.new_character(BigRatTemplate, undefined, cell.id, undefined)
                    Data.Reputation.set(Factions.Rats.id, rat.id, 'member')
                } else if (dice < 1) {
                    Template.Character.MageRat(cell.x, cell.y)
                }                
            }

            if ((elodino_number < 60) && (cell.development.elodinos == 1)) {
                let dice = Math.random()
                if (dice < 0.7) {
                    let elo = Event.new_character(EloTemplate, undefined, cell.id, undefined)
                    Data.Reputation.set(Factions.Elodinos.id, elo.id, 'member')
                } else {
                    Template.Character.MageElo(cell.x, cell.y)
                }
            }
        }
    }

    export function can_move(pos: [number, number]) {
        if ((pos[0] < 0) || (pos[0] >= size[0])) {
            return false
        }
        if ((pos[1] < 0) || (pos[1] >= size[1])) {
            return false
        }

        let cell = coordinate_to_cell(pos)
        if (cell == undefined) {
            return false
        }

        if (cell.terrain == 'coast' || cell.terrain == 'steppe' || cell.terrain == 'city') {
            if (cell.development.rupture == 1) {
                return false
            }
            return true
        }
        return false
    }

    export function is_valid_move(dx: number, dy: number) {
        return ((dx == 0 && dy == 1) || (dx == 0 && dy == -1) || (dx == 1 && dy == 0) || (dx == -1 && dy == 0) || (dx == 1 && dy == 1) || (dx == -1 && dy == -1))
    }
}