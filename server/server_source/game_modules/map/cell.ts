import { CharacterSystem } from "../character/system.js";
import { cell_id, char_id, order_bulk_id, order_item_id, terrain} from "../types.js";
import { CellResources, Development } from "../static_data/map_definitions.js";
import { Convert } from "../systems_communication.js";
import { CellType } from "./cell_type.js";
import { Data } from "../data.js";
import { Building } from "../DATA_LAYOUT_BUILDING.js";

// const BUILDINGS_PER_CELL = 10

// export class CellOld {
//     x: number;
//     y: number;
//     id: cell_id;

//     // name: string;

//     visited_recently: boolean;
//     last_visit: number
//     rat_scent: number

//     market_scent: number 
    
//     // development: Development;
//     // resources: CellResources;
//     // terrain: terrain;

//     changed_characters: boolean
//     characters_set: Set<char_id>
//     saved_characters_list: {id: char_id, name:string}[]

//     // orders_bulk: Set<order_bulk_id>
//     // orders_item: Set<order_item_id>

//     constructor(id: cell_id, x: number, y:number, name:string, type: CellType, create_buildings: boolean) {
//         this.id = id
//         this.x = x
//         this.y = y

//         // this.name = name;
//         this.visited_recently = false;
//         this.last_visit = 0;
//         this.changed_characters = true

//         this.characters_set = new Set()
//         this.saved_characters_list = []
    
//         this.rat_scent = 0
//         this.market_scent = 0
//     }

//     enter(id: char_id) {
//         this.characters_set.add(id)
//         this.changed_characters = true
//         this.visited_recently = true
//         this.last_visit = 0
//     }

//     exit(id: char_id) {
//         this.characters_set.delete(id)
//         this.changed_characters = true
//     }

//     get_characters_list(): {id: char_id, name:string}[] {
//         if (this.changed_characters) {
//             this.changed_characters = false
//             let result = []
//             for (let item of this.characters_set.values()) {
//                 let character = Convert.id_to_character(item)
//                 if (!character.dead()) {
//                     let return_item = {id: item, name: character.name}
//                     result.push(return_item)
//                 }                
//             }
//             this.saved_characters_list = result
//             return result
//         }
//         return this.saved_characters_list
//     }

//     get_characters_id_set() {
//         return this.characters_set
//     }


//     update(dt: number) {
//         if (this.visited_recently) {
//             this.last_visit += dt
//             if (this.last_visit > 10) {
//                 this.visited_recently = false
//                 this.last_visit = 0
//             }
//         }
//     }
// }