import { EloTemplate } from "../races/elo";
import { BigRatTemplate, RatTemplate } from "../races/rat";
import { Data } from "../data";
import { Event } from "../events/events";
import { Factions } from "../factions";
import { STARTING_DEVELOPMENT, STARTING_RESOURCES, STARTING_TERRAIN, WORLD_SIZE } from "../static_data/map_definitions";
import { cell_id, world_coordinates } from "../types";
// import { Cell} from "./cell";
import { Template } from "../templates";
import { trim } from "../calculations/basic_functions";
import { Convert } from "../systems_communication";
import { MEAT } from "../manager_classes/materials_manager";
import { Building } from "../DATA_LAYOUT_BUILDING";
import { Cell } from "./DATA_LAYOUT_CELL";
import { terrain_can_move } from "./terrain";

// var size:world_dimensions = [0, 0]
// var max_direction:number = 30

// const dp = 

export namespace MapSystem {
    export function cells() {
        return Data.Cells.list()
    }

    export function initial_load() {
        console.log('loading map')        
        // const development = STARTING_DEVELOPMENT
        // const resources = STARTING_RESOURCES
        // const terrain = STARTING_TERRAIN

        // let size = Data.World.get_world_dimensions()

        // for (let x = 0; x < size[0]; x++) {
        //     for (let y = 0; y < size[1]; y++) {
        //         const id = coordinate_to_id(x, y)
        //         const cell: Cell =  {
        //             id: id,
        //             x: x,
        //             y: y,
        //             market_scent: 0,
        //             rat_scent: 0,
        //             rupture: false
        //         }
        //         Data.Cells.set_data(id, cell)
        //     }
        // }

        // console.log('map is initialised')
    }

    export function get_size() {
        return Data.World.get_world_dimensions()
    }



    // export function coordinate_to_cell(p: [number, number]) {
    //     let id = coordinate_to_id(p[0], p[1])
    //     return id_to_cell(id)
    // }

    // export function id_to_cell(id: cell_id) {
    //     return cells[id]
    // }

    // export function SAFE_id_to_cell(id: cell_id) {
    //     return cells[id] as Cell
    // }

    export function neighbours(id: cell_id) {
        let arr = []
        const [x, y] = id_to_coordinate(id)
        for (const [s, t] of Data.World.directions) {
            const [x1, y1] = [x + s, y + t]
            if (validate_coordinates([x1, y1])) {
                let id = coordinate_to_id([x1, y1])
                // arr.push([x1, y1])
                arr.push(id)
            }
        }
        return arr
    }

    // export function neighbours_cells(id: cell_id): Cell[] {
    //     let arr = []
    //     const [x, y] = id_to_coordinate(id)
    //     for (const [s, t] of dp) {
    //         const [x1, y1] = [x + s, y + t]
    //         if (validate_coordinates([x1, y1])) {
    //             let cell = coordinate_to_cell([x1, y1])
    //             if (cell != undefined) arr.push(cell)
    //         }
    //     }
    //     return arr
    // }

    export function validate_coordinates([x, y]: world_coordinates): boolean {
        let size = Data.World.get_world_dimensions()
        return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]) 
    }

    const max_scent = 50

    export function update(dt: number, rats_number: number, elodino_number: number, npc_humans: number) {
        
        // updating rat scent

        // for (const cell of cells) {
        //     if (cell == undefined) continue

        //     // constant change by dt / 100
        //     let base_d_scent = dt / 100

        //     // constant decay
        //     let d_scent = -1 * base_d_scent

        //     // cell.rat_scent -=dt / 100
            
        //     // then calculate base scent change
        //     if (cell.development.rats == 1) {
        //         // lairs always have 50 scent
        //         cell.rat_scent = max_scent
        //     } else {
        //         // take an average of scent around
        //         let total = 0
        //         let neighbours = neighbours_cells(cell.id)
        //         for (let neighbour of neighbours) {
        //             total += neighbour.rat_scent 
        //         }
        //         const average = total / neighbours.length * 0.95

        //         d_scent += base_d_scent * (average - cell.rat_scent) * 5
        //         // cell.rat_scent = total
        //     }

        //     if (cell.development.urban > 0) {
        //         d_scent -= 30 * base_d_scent
        //     }

        //     if (cell.development.rural > 0) {
        //         d_scent -= 20 * base_d_scent
        //     }

        //     if (cell.development.wild > 0) {
        //         d_scent -= 20 * base_d_scent
        //     }

        //     // add scent to cells with rats
        //     // let guests = cell.characters_set
        //     // let rats = 0
        //     // for (let guest of guests) {
        //     //     let character = Data.CharacterDB.from_id(guest)
        //     //     if (character.race() == 'rat') rats += 1
        //     // }

        //     // cell.rat_scent += rats

        //     // trim to avoid weirdness
        //     cell.rat_scent = trim(cell.rat_scent + d_scent * 20, 0, 50)
        // }

        // for (const cell of cells) {
        //     if (cell == undefined) continue
                        
        //     let temp = 0
        //     if (cell.is_market()) {
        //         temp = 100
        //     } else {
        //         let neighbours = neighbours_cells(cell.id)
        //         let max = 0
        //         for (let item of neighbours) {
        //             if (item.market_scent > max) {
        //                 max = item.market_scent
        //             }
        //         }

        //         temp = max - 1
        //     }

        //     cell.market_scent = temp
        // }

        // for (const cell of cells) {
        //     if (cell == undefined) continue
        //     cell.update(dt)
        //     if ((rats_number < 120) && (cell.development.rats == 1)) {
        //         let dice = Math.random()
        //         if (dice < 0.6) {
        //             Template.Character.GenericRat(cell.x, cell.y, undefined)
        //         } else if (dice < 0.8) {
        //             Template.Character.BigRat(cell.x, cell.y, undefined)
        //         } else if (dice < 1) {
        //             Template.Character.MageRat(cell.x, cell.y, undefined)
        //         }                
        //     }

        //     if ((elodino_number < 60) && (cell.development.elodinos == 1)) {
        //         let dice = Math.random()
        //         if (dice < 0.7) {
        //             Template.Character.Elo(cell.x, cell.y, undefined)
        //         } else {
        //             Template.Character.MageElo(cell.x, cell.y, undefined)
        //         }
        //     }
        // }

        // if (npc_humans <= 80) {
        //     roll_human()
        // }
    }

    function roll_human() {
        let dice = Math.random()
        if (dice < 0.08) {
            Template.Character.HumanRatHunter(0, 3, "Rat Hunter")
        } else if (dice < 0.16) {
            Template.Character.HumanCityGuard(0, 3, "Guard")
        } else if (dice < 0.32) {
            Template.Character.HumanLocalTrader(0, 3, "Local Trader", 'city')
        }
    }

    export function can_move(pos: [number, number]) {
        if (!validate_coordinates(pos)) return false 
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
}