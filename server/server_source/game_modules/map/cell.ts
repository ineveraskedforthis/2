import { CharacterSystem } from "../character/system.js";
import { cell_id, char_id, order_bulk_id, order_item_id, terrain} from "../types.js";
import { CellResources, Development } from "../static_data/map_definitions.js";
import { Convert } from "../systems_communication.js";
import { CellType } from "./cell_type.js";
import { Data } from "../data.js";
import { Building } from "../DATA_LAYOUT_BUILDING.js";

const BUILDINGS_PER_CELL = 10

export class Cell {
    x: number;
    y: number;
    id: cell_id;

    // name: string;

    visited_recently: boolean;
    last_visit: number
    rat_scent: number

    market_scent: number 
    
    // development: Development;
    // resources: CellResources;
    // terrain: terrain;

    changed_characters: boolean
    characters_set: Set<char_id>
    saved_characters_list: {id: char_id, name:string}[]

    // orders_bulk: Set<order_bulk_id>
    // orders_item: Set<order_item_id>

    constructor(id: cell_id, x: number, y:number, name:string, type: CellType, create_buildings: boolean) {
        this.id = id
        this.x = x
        this.y = y

        // this.name = name;
        this.visited_recently = false;
        this.last_visit = 0;
        this.changed_characters = true

        this.characters_set = new Set()
        this.saved_characters_list = []
    
        this.rat_scent = 0
        this.market_scent = 0

        switch(type) {
            case CellType.Sea:{break}
            case CellType.Steppe:{
                for (let i = 0; i < BUILDINGS_PER_CELL; i++) {
                    let steppe:Building = {
                        cell_id: id,
                        durability: 100,

                    }
                    Data.Buildings.create()
                }
                Data.Buildings
            }
            case CellType.Forest:
            case CellType.Rupture:
            case CellType.Coast:
            case CellType.RatLair:
            case CellType.ElodinoCity:
            case CellType.HumanCity:
            case CellType.HumanMarket:
            case CellType.HumanVillage:
        }
    }

    enter(id: char_id) {
        this.characters_set.add(id)
        this.changed_characters = true
        this.visited_recently = true
        this.last_visit = 0
    }

    exit(id: char_id) {
        this.characters_set.delete(id)
        this.changed_characters = true
    }

    get_characters_list(): {id: char_id, name:string}[] {
        if (this.changed_characters) {
            this.changed_characters = false
            let result = []
            for (let item of this.characters_set.values()) {
                let character = Convert.id_to_character(item)
                if (!character.dead()) {
                    let return_item = {id: item, name: character.name}
                    result.push(return_item)
                }                
            }
            this.saved_characters_list = result
            return result
        }
        return this.saved_characters_list
    }

    get_characters_id_set() {
        return this.characters_set
    }

    get_home_price() {
        
    }

    can_clean(): boolean{
        return (this.resources.water)
    }

    can_hunt(): boolean{
        return ((this.development.wild > 0) || (this.resources.prey))
    }

    can_fish(): boolean{
        return (this.resources.fish)
    }

    can_gather_wood(): boolean {
        return (this.development.wild > 0)
    }

    can_gather_cotton(): boolean {
        return (this.development.rural > 0)
    }

    is_market(): boolean {
        return (this.development.market == 1)
    }

    update(dt: number) {
        if (this.visited_recently) {
            this.last_visit += dt
            if (this.last_visit > 10) {
                this.visited_recently = false
                this.last_visit = 0
            }
        }
    }
}