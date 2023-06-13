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

    export function can_hunt(cell_id: cell_id) {
        if (Data.Cells.forestation(cell_id) > 200) return true
        if (Data.Cells.urbanisation(cell_id) < 5) return true

        return false
    }

    export function can_fish(cell_id: cell_id) {
        if (Data.World.id_to_terrain(cell_id) == Terrain.coast) return true
        return false
    }

    export function has_market(cell_id: cell_id) {
        if (Data.World.id_to_market(cell_id)) return true
        return false
    }

    export function has_wood(cell_id: cell_id) {
        if (Data.Cells.forestation(cell_id) > 100) return true
        return false
    }

    const max_scent = 50

    export function update(dt: number) {
        // updating rat scent
        const cells = Data.Cells.list() 
        for (const cell of cells) {
            if (cell == undefined) continue
            // constant change by dt / 100
            let base_d_scent = dt / 100
            // constant decay
            let d_scent = -0.1 * base_d_scent
            // cell.rat_scent -=dt / 100            
            {
                // take an average of scent around
                let total = 0
                let neighbours = Data.World.neighbours(cell.id)
                for (let neighbour of neighbours) {
                    const neigbour_cell = Data.Cells.from_id(neighbour)
                    total += neigbour_cell.rat_scent 
                }
                const average = total / neighbours.length * 0.95
                d_scent += base_d_scent * (average - cell.rat_scent) * 5
                // cell.rat_scent = total
            }

            {   //account for urbanisation
                d_scent -= Data.Cells.urbanisation(cell.id) * base_d_scent
            }

            // if (cell.development.rural > 0) {
            //     d_scent -= 20 * base_d_scent
            // }

            {   //account for forest
                d_scent -= Data.Cells.forestation(cell.id) / 100 * base_d_scent
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
}