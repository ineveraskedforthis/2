// THIS MODULE MUST BE IMPORTED FIRST

import fs, { read } from "fs"
import path from "path"
import { DEFAULT_WORLD_PATH, SAVE_GAME_PATH } from "../SAVE_GAME_PATH"
import { battle_id } from "../../../shared/battle_data"
import { reputation_level } from "../../../shared/character"
import { Battle } from "./battle/classes/battle"
import { Character } from "./character/character"
// import { Factions } from "./factions"
import { OrderBulk, OrderItem } from "./market/classes"
import { char_id, building_id, order_bulk_id, order_item_id, world_coordinates } from "./types"
import { building_from_string, character_to_string, item_from_string, string_to_character } from "./strings_management"
import { Cell } from "./map/DATA_LAYOUT_CELL"
// import { Terrain, string_to_terrain } from "./map/terrain"
import { CellType } from "./map/cell_type"
import { Terrain, string_to_terrain } from "./map/terrain"
import { cell_id, money } from "../../../shared/common"
import { LandPlot, LandPlotType } from "../../../shared/buildings"
// import { Cell } from "./map/cell"



var world_size:world_coordinates = [0, 0]
var max_direction = 0
var terrain: Terrain[][] = []
var is_market: Boolean[][] = []

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id

var last_character_id = 0 as char_id
var character_list:Character[] = []
var character_id_list:char_id[] = []
var characters_dict:{[_ in char_id]: Character} = {}

var orders_bulk:OrderBulk[] = []
var orders_item:OrderItem[] = []

var bulk_dict: {[_ in order_bulk_id]: OrderBulk} = {}
var item_dict: {[_ in order_item_id]: OrderItem} = {}

var char_id_to_orders_bulk: {[_ in char_id]: Set<order_bulk_id>|undefined} = {}
var char_id_to_orders_item: {[_ in char_id]: Set<order_item_id>|undefined} = {}

const empty_set_orders_bulk: Set<order_bulk_id> = new Set()
const empty_set_orders_item: Set<order_item_id> = new Set()

var last_id_bulk = 0 as order_bulk_id
var last_id_item = 0 as order_item_id



interface reputation {
    faction: string
    level: reputation_level
}

interface Faction {
    tag: string,
    spawn_point: cell_id,
    name: string,
}


var factions: Faction[] = []
var reputation: {[_ in char_id]: {[_ in string]: reputation}} = {}
var faction_to_leader: {[_ in string]: char_id} = {}
var character_is_leader: {[_ in char_id]: boolean|undefined} = {}

//BUILDINGS 
var last_id_building: building_id = 0 as building_id

//OWNERSHIP
//REFACTOR LATER TO LAW SYSTEM
var character_to_buildings: Map<char_id, Set<building_id>> = new Map()
var building_to_character: Map<building_id, char_id> = new Map()

var building_to_cell: Map<building_id, cell_id> = new Map()
var cell_to_buildings: Map<cell_id, Set<building_id>> = new Map()

var id_to_building: Map<building_id, LandPlot> = new Map()
var building_to_occupied_rooms: Map<building_id, number> = new Map()

var cells: Cell[] = []
var cell_ids: cell_id[] = []
var id_to_cell: Map<cell_id, Cell> = new Map()

var cell_to_characters_set: Map<cell_id, Set<char_id>> = new Map()

const save_path = 
{
    REPUTATION: path.join(SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path.join(SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path.join(SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path.join(SAVE_GAME_PATH, 'characters.txt'),
    CELLS: path.join(SAVE_GAME_PATH, 'cells.txt'),

    WORLD_DIMENSIONS: path.join(DEFAULT_WORLD_PATH, 'description.txt'),
    TERRAIN: path.join(DEFAULT_WORLD_PATH, 'map_terrain.txt'),
    FORESTS: path.join(DEFAULT_WORLD_PATH, 'map_forest.txt'),
    MARKETS: path.join(DEFAULT_WORLD_PATH, 'map_markets.txt'),
    FACTIONS: path.join(DEFAULT_WORLD_PATH, 'factions.txt'),
    SPAWN_POINTS: path.join(DEFAULT_WORLD_PATH, 'map_spawn_points.txt'),
}

const save_path_bulk = path.join(SAVE_GAME_PATH, 'bulk_market.txt')

const save_path_item = path.join(SAVE_GAME_PATH, 'item_market.txt')


const loaded_flag = {
    Characters: false
}

function read_lines(file: string) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '')
    }
    let data = fs.readFileSync(file).toString()
    return data.split('\n')
}

export namespace Data {
    export function load() {
        World.load_world_dimensions(save_path.WORLD_DIMENSIONS)
        Cells.load(save_path.CELLS)
        World.load()
        CharacterDB.load(save_path.CHARACTERS)
        BulkOrders.load()
        ItemOrders.load()
        Reputation.load(save_path.REPUTATION)
        Buildings.load(save_path.BUILDINGS)
        Buildings.load_ownership(save_path.BUILDINGS_OWNERSHIP)
    }
    export function save() {
        CharacterDB.save()
        BulkOrders.save()
        ItemOrders.save()
        Reputation.save(save_path.REPUTATION)
        Buildings.save(save_path.BUILDINGS)
        Buildings.save_ownership(save_path.BUILDINGS_OWNERSHIP)
        Cells.save(save_path.CELLS)
    }

    export namespace Connection {
        
        
        export function character_cell(character: char_id, cell: cell_id): cell_id {
            let character_object = CharacterDB.from_id(character)
            let old_cell = character_object.cell_id
            character_object.cell_id = cell 

            let set = cell_to_characters_set.get(cell)
            if (set == undefined) {
                cell_to_characters_set.set(cell, new Set([character]))
            } else {
                set.add(character)
            }

            if (old_cell != cell) {
                cell_to_characters_set.get(old_cell)?.delete(character)
            }            

            return old_cell
        }
    }

    export namespace World {
        export const directions = [[0, 1], [0 ,-1],[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]

        export function coordinate_to_id([x, y]: world_coordinates) {
            return x * max_direction + y as cell_id
        }

        export function id_to_coordinate(id: cell_id): world_coordinates {
            let max = max_direction
            return [Math.floor(id / max), id - Math.floor(id / max) * max]
        }

        export function neighbours(id: cell_id) {
            let arr = []
            const [x, y] = id_to_coordinate(id)
            for (const [s, t] of directions) {
                const [x1, y1] = [x + s, y + t]
                if (validate_coordinates([x1, y1])) {
                    let id = coordinate_to_id([x1, y1])
                    // arr.push([x1, y1])
                    arr.push(id)
                }
            }
            return arr
        }

        export function validate_coordinates([x, y]: world_coordinates): boolean {
            let size = get_world_dimensions()
            return (y >= 0) && (x >= 0) && (x < size[0]) && (y < size[1]) 
        }

        export function load_world_dimensions(path: string) {
            let data = fs.readFileSync(path).toString().split(' ')
            world_size[0] = Number(data[0])
            world_size[1] = Number(data[0])
            max_direction = Math.max(world_size[0], world_size[1])
        }

        export function load_terrain(path: string) {
            console.log('loading terrain')
            terrain = []
            let lines = read_lines(path)
            let stats: {[_ in string]: number} = {}
            for (let line of lines) {
                let terrains = line.trim().split(' ')
                let terrain_row = []
                for (let item of terrains ) {
                    stats[item] = stats[item] + 1||0
                    terrain_row.push(string_to_terrain(item))
                }
                terrain.push(terrain_row)
            }
            console.log(terrain.length)
            console.log(terrain[0].length)
            console.log(stats)

        }

        export function load_markets(path: string) {
            // terrain = []
            let lines = read_lines(path)
            for (let line of lines) {
                let row = line.trim().split(' ')
                let markets_row = []
                for (let market of row ) {
                    markets_row.push(Number(market) == 1)
                }
                is_market.push(markets_row)
            }
        }

        export function load_forests(path: string) {
            // terrain = []
            let lines = read_lines(path)
            let x = 0
            for (let line of lines) {
                let row = line.trim().split(' ')
                if (x >= world_size[0]) {
                    continue
                }
                let y = 0
                for (let forest_level of row ) {
                    let cell_id = coordinate_to_id([x, y])
                    const cell = Cells.from_id(cell_id);
                    if ((!cell.loaded_forest)) {
                        if ((Number(forest_level) > 0)) {
                            let forest: LandPlot = {
                            durability: Number(forest_level) * 100,
                            cell_id: cell_id,
                            type: LandPlotType.ForestPlot,
                            room_cost: 0 as money
                            }
                            Buildings.create(forest)
                        }                        
                        cell.loaded_forest = true
                    }
                    y++;
                }
                x++
            }
        }

        export function load_factions(path_factions: string, path_spawns: string){
            const lines_factions = read_lines(path_factions)
            const lines_spawns = read_lines(path_spawns)

            for (let line of lines_factions) {
                let row = line.split(';')
                let faction: Faction = {
                    tag: row[0],
                    name: row[1],
                    spawn_point: 0 as cell_id,
                }
                factions.push(faction)
            }

            
            for (let line of lines_spawns) {
                let row = line.split(' ')
                let [tag, x, y] = [row[0], Number(row[1]), Number(row[2])]
                // console.log(tag, x, y)

                for (let item of factions) {
                    if (item.tag == tag) {
                        item.spawn_point = coordinate_to_id([x, y])
                        // console.log(id_to_coordinate(item.spawn_point))
                    }
                }
            }
            console.log(factions)
        }

        export function set_faction_leader(faction: string, character: char_id) {
            Data.Reputation.set(faction, character, 'leader')
            // faction_to_leader[faction] = character
            // character_is_leader[character] = true
        }

        export function get_faction(tag: string) {
            for (let item of factions) {
                if (item.tag == tag) {
                    return item
                }
            }
        }

        export function get_factions() {
            return factions
        }

        export function get_terrain() {
            return terrain
        }

        export function id_to_terrain(cell_id: cell_id):Terrain{
            let [x, y] = id_to_coordinate(cell_id)
            // console.log(terrain)
            // console.log(x, y)
            return terrain[x][y]
        }
        export function id_to_market(cell_id: cell_id){
            let [x, y] = id_to_coordinate(cell_id)
            return is_market[x][y]
        }

        export function load() {
            load_terrain(save_path.TERRAIN)
            load_forests(save_path.FORESTS)
            load_markets(save_path.MARKETS)
            load_factions(save_path.FACTIONS, save_path.SPAWN_POINTS)
        }

        export function set_world_dimensions(size: world_coordinates) {
            world_size = size
            max_direction = Math.max(size[0], size[1])
        }

        export function get_world_dimensions() {
            return world_size
        }

        export function get_max_dimension() {
            return max_direction
        }
    }

    export namespace Cells {
        export function save(save_path: string) {
            let str = '';

            id_to_cell.forEach((value, key) => {
                str += JSON.stringify({id: key, cell: value}) + '\n' 
            })

            fs.writeFileSync(save_path, str)
        }

        export function load(save_path: string) {
            console.log('loading map...')

            for (let line of read_lines(save_path)) {
                if (line == '') continue

                let {id, cell}:{id: cell_id, cell: Cell} = JSON.parse(line)
                set_data(id, cell)
            }

            const dims = World.get_world_dimensions()
            for (let i = 0; i < dims[0]; i++) {
                for (let j = 0; j < dims[1]; j++) {
                    const id = World.coordinate_to_id([i,j])
                    let cell = from_id(id)
                    if (cell == undefined) {
                        const cell_data: Cell = {
                            id: id,
                            x: i,
                            y: j,
                            market_scent: 0,
                            rat_scent: 0,
                            loaded_forest: false,
                            loaded_spawn: false,
                        }
                        set_data(id, cell_data)
                    }
                }
            }
        }

        export function set_data(id: cell_id, cell: Cell) {
            cells.push(cell)
            id_to_cell.set(id, cell)
            cell_ids.push(id)
        }

        export function get_characters_set_from_cell(cell: cell_id) {
            return cell_to_characters_set.get(cell)
        }

        export function get_characters_list_from_cell(cell: cell_id) {
            let set = get_characters_set_from_cell(cell)
            if (set == undefined) return []
            return Array.from(set)
        }

        export function get_characters_list_display(cell: cell_id) {
            let set = get_characters_set_from_cell(cell)
            if (set == undefined) return []
            const array = Array.from(set)
            let responce = []
            for (const item of array) {
                let character = Data.CharacterDB.from_id(item)
                responce.push({name: character.name, id: item})
            }
            return responce
        }

        export function list() {
            return cells
        }

        export function list_ids(){
            return cell_ids
        }

        export function from_id(cell: cell_id):Cell {
            return id_to_cell.get(cell) as Cell
        }

        export function can_clean(cell: cell_id) {
            return true
        }

        export function has_forest(cell: cell_id) {
            let land_plots = Buildings.from_cell_id(cell)
            if (land_plots == undefined) return false
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id)
                if (plot.type != LandPlotType.ForestPlot) continue
                if (plot.durability > 0) return true
            }
        }

        export function has_cotton(cell: cell_id) {
            let land_plots = Buildings.from_cell_id(cell)
            if (land_plots == undefined) return false
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id)
                if (plot.type != LandPlotType.CottonField) continue
                if (plot.durability > 0) return true
            }
        }
        export function has_market(cell: cell_id) {
            let [x, y] = World.id_to_coordinate(cell)
            return is_market[x][y]
        }
        export function forestation(cell: cell_id) {
            let result = 0
            let land_plots = Buildings.from_cell_id(cell)
            if (land_plots == undefined) return 0
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id)
                if (plot.type != LandPlotType.ForestPlot) continue
                result += plot.durability
            }
            return result
        }
        export function urbanisation(cell: cell_id) {
            let result = 0
            let land_plots = Buildings.from_cell_id(cell)
            if (land_plots == undefined) return 0
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id)
                if (plot.type == LandPlotType.HumanHouse) result += 1
                else if (plot.type == LandPlotType.ElodinoHouse) result += 1
                // else if (plot.type == LandPlotType.Shack) result += 1
                else if (plot.type == LandPlotType.Inn) result += 1
            }
            return result
        }

        export function free_space(cell: cell_id) {
            let free_space = 30
            free_space = free_space - urbanisation(cell)
            free_space = free_space - forestation(cell) / 100
            return free_space
        }

        export function rat_lair(cell: cell_id) {
            let result = false
            let land_plots = Buildings.from_cell_id(cell)
            if (land_plots == undefined) return false
            for (let plot_id of land_plots) {
                let plot = Buildings.from_id(plot_id)
                if (plot.type == LandPlotType.RatLair) {
                    result = true
                }
            }
            return result
        }
    }

    export namespace Buildings {
        export function load(save_path: string) {
            console.log('loading buildings')
            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let {id, building}:{id: building_id, building: LandPlot} = JSON.parse(line)
                last_id_building = Math.max(id, last_id_building) as building_id
                set_data(id, building)
            }
        }

        export function load_ownership(save_path: string) {
            console.log('loading buildings ownership')
            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let {character, building}:{character: char_id, building: building_id} = JSON.parse(line)
                set_ownership(character, building)
            }
        }

        export function save(save_path: string) {
            let str = ''
            id_to_building.forEach((value, key) => {
                str += JSON.stringify({id: key, building: value}) + '\n' 
            })

            fs.writeFileSync(save_path, str)
        }

        export function save_ownership(save_path: string) {
            let str = ''
            building_to_character.forEach((value, key) => {
                str += JSON.stringify({character: value, building: key}) + '\n' 
            })

            fs.writeFileSync(save_path, str)
        }

        export function set_ownership(character: char_id, building: building_id) {
            let buildings = character_to_buildings.get(character)

            if (buildings == undefined) {
                character_to_buildings.set(character, new Set([building]))
            } else {
                buildings.add(building)
            }
            building_to_character.set(building, character)
        }

        export function remove_ownership(character: char_id, building: building_id) {
            building_to_character.delete(building)
            let buildings = character_to_buildings.get(character)
            if (buildings == undefined) return
            buildings.delete(building)
        }

        export function remove_ownership_character(character: char_id) {
            let buildings = character_to_buildings.get(character)
            if (buildings == undefined) return

            for (let id of buildings.values()) {
                building_to_character.delete(id)
            }
            buildings.clear()
        }

        export function create(item: LandPlot) {
            last_id_building = last_id_building + 1 as building_id
            set_data(last_id_building, item)
            return last_id_building
        }

        function set_data(id: building_id, item: LandPlot) {
            building_to_cell.set(id, item.cell_id)
            let temp = cell_to_buildings.get(item.cell_id)
            if (temp == undefined) {
                cell_to_buildings.set(item.cell_id, new Set([id]))
            } else {
                temp.add(id)
            } 

            id_to_building.set(id, item)
            building_to_occupied_rooms.set(id, 0)
        }

        export function occupied_rooms(id: building_id) {
            return building_to_occupied_rooms.get(id) as number
        }

        export function free_room(id:building_id) {
            let rooms = occupied_rooms(id)
            building_to_occupied_rooms.set(id, rooms - 1)
        }

        export function occupy_room(id:building_id) {
            let rooms = occupied_rooms(id)
            building_to_occupied_rooms.set(id, rooms + 1)
        }


        export function from_id(id: building_id) {
            return id_to_building.get(id) as LandPlot
        }

        export function from_cell_id(id: cell_id) {
            return cell_to_buildings.get(id)
        }

        export function owner(id: building_id) {
            return building_to_character.get(id)
        }
    }

    export namespace Reputation {
        export function load(save_path: string) {
            console.log('loading reputation')
            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let reputation_line:{char: char_id, item: {[_ in string]: reputation}} = JSON.parse(line)
                reputation[reputation_line.char] = reputation_line.item
            }
            console.log('reputation loaded')
        }

        export function save(save_path: string) {
            console.log('saving reputation')
            let str:string = ''
            for (let [char_id, item] of Object.entries(reputation)) {
                str = str + JSON.stringify({char: char_id, item: item}) + '\n' 
            }
            fs.writeFileSync(save_path, str)
            console.log('reputation saved')
        }

        export function from_id(faction: string, char_id: char_id):reputation_level {
            if (reputation[char_id] == undefined) return 'neutral';
            let responce = reputation[char_id][faction]
            if (responce == undefined) { return 'neutral' }
            return responce.level
        }

        export function list_from_id(char_id: char_id): { tag: string; name: string; reputation: reputation_level }[] {
            let responce = []
            for (let faction of factions) {
                responce.push({
                    tag: faction.tag,
                    name: faction.name,
                    reputation: from_id(faction.tag, char_id)
                })
            }

            return responce
        }

        /**
         * 
         * @param a his factions are checked  
         * @param X reputation level
         * @param b his reputation is checked
         * @returns **true** if b has a reputation level X with one of factions of a and **false** otherwise
         */
        export function a_X_b(a: char_id, X: reputation_level, b: char_id) {
            if (reputation[b] == undefined) return false
            if (reputation[a] == undefined) return false
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == X) return true
                }
            }
            return false
        }

        /**
         * sets reputation of b to X with factions of a 
         * @param a his factions are checked  
         * @param X reputation level
         * @param b his reputation is changed
         * @returns 
         */
        export function set_a_X_b(a: char_id, X: reputation_level, b: char_id) {
            if (reputation[a] == undefined) return
            if (reputation[b] == undefined) reputation[b] = {}
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    set(reputation.faction, b, X)
                }
            }
            return false
        }

        export function set(faction: string, char_id: char_id, level: reputation_level) {
            if (reputation[char_id] == undefined) reputation[char_id] = {}
            if (reputation[char_id][faction] == undefined) reputation[char_id][faction] = {faction: faction, level: level}
            else reputation[char_id][faction].level = level
        }

        export function a_is_enemy_of_b(a: char_id, b: char_id) {
            if (reputation[a] == undefined) return false
            if (reputation[b] == undefined) return false
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == 'enemy') return true
                }
            }
            return false
        }
    }

    export namespace Battle {
        export function increase_id() {
            last_id = last_id + 1 as battle_id
        }

        export function id() {
            return last_id
        }

        export function set_id(x: battle_id) {
            last_id = x as battle_id
        }

        export function set(id: battle_id, data: Battle) {
            battles_list.push(data)
            battles_dict[id] = data
        }

        export function from_id(id: battle_id) {
            return battles_dict[id]
        }

        export function list() {
            return battles_list
        }
    }

    export namespace CharacterDB {
        export function load(save_path: string) {
            if (loaded_flag.Characters) {
                return
            }
            console.log('loading characters')
            if (!fs.existsSync(save_path)) {
                fs.writeFileSync(save_path, '')
            }
            let data = fs.readFileSync(save_path).toString()
            let lines = data.split('\n')
    
            for (let line of lines) {
                if (line == '') {continue}
                const character = string_to_character(line)
                Data.CharacterDB.set(character.id, character)
                Data.CharacterDB.set_id(Math.max(character.id, Data.CharacterDB.id()) as char_id)
                Connection.character_cell(character.id, character.cell_id)
            }
            loaded_flag.Characters = true
            console.log('characters loaded')
        }
    
        export function save() {
            console.log('saving characters')
            let str:string = ''
            for (let item of Data.CharacterDB.list()) {
                if (item.dead()) continue
                str = str + character_to_string(item) + '\n' 
            }
            fs.writeFileSync(save_path.CHARACTERS, str)
            console.log('characters saved')
        }

        export function increase_id() {
            last_character_id = last_character_id + 1 as char_id
        }

        export function id() {
            return last_character_id
        }

        export function set_id(x: char_id) {
            last_character_id = x as char_id
        }

        export function set(id: char_id, data: Character) {
            character_list.push(data)
            character_id_list.push(id)
            characters_dict[id] = data
        }

        export function from_id(id: char_id): Character
        export function from_id(id: number): Character|undefined
        export function from_id(id: char_id|number): Character|undefined {
            return characters_dict[id as char_id]
        }
        export function list() {
            return character_list
        }
        export function list_of_id(){
            return character_id_list
        }
    }

    export namespace BulkOrders {
        
        export function save() {
            console.log('saving bulk market orders')
            let str:string = ''
            for (let item of Data.BulkOrders.list()) {
                if (item.amount == 0) continue;
                str = str + JSON.stringify(item) + '\n' 
                
            }
            fs.writeFileSync(save_path_bulk, str)
            console.log('bulk market orders saved')
            
        }
    
        export function load() {
            console.log('loading bulk market orders')
            if (!fs.existsSync(save_path_bulk)) {
                fs.writeFileSync(save_path_bulk, '')
            }
            let data = fs.readFileSync(save_path_bulk).toString()
            let lines = data.split('\n')
            for (let line of lines) {
                if (line == '') {continue}
                const order: OrderBulk = JSON.parse(line)
                // console.log(order)
                Data.BulkOrders.set(order.id, order.owner_id, order)
                const last_id = Data.BulkOrders.id()
                Data.BulkOrders.set_id(Math.max(order.id, last_id) as order_bulk_id)            
            }
            console.log('bulk market orders loaded')
        }

        export function increase_id() {
            last_id_bulk = last_id_bulk + 1 as order_bulk_id
        }

        export function id() {
            return last_id_bulk
        }

        export function set_id(x: order_bulk_id) {
            last_id_bulk = x as order_bulk_id
        }

        export function set(id: order_bulk_id, owner_id: char_id, data: OrderBulk) {
            orders_bulk.push(data)
            bulk_dict[id] = data
            const set = char_id_to_orders_bulk[owner_id]
            if (set == undefined) char_id_to_orders_bulk[owner_id] = new Set([id])
            else set.add(id)
        }

        export function from_id(id: order_bulk_id): OrderBulk
        export function from_id(id: number): OrderBulk|undefined
        export function from_id(id: order_bulk_id|number): OrderBulk|undefined {
            return bulk_dict[id as order_bulk_id]
        }

        export function list() {
            return orders_bulk
        }

        export function from_char_id(id: char_id) {
            return char_id_to_orders_bulk[id]
        }
    }
    export namespace ItemOrders {
        export function save() {
            console.log('saving item market orders')
            let str:string = ''
            for (let item of Data.ItemOrders.list()) {
                if (item.finished) continue;
                str = str + JSON.stringify(item) + '\n' 
                
            }
            fs.writeFileSync(save_path_item, str)
            console.log('item market orders saved')
        }
    
        export function load() {
            console.log('loading item market orders')
            if (!fs.existsSync(save_path_item)) {
                fs.writeFileSync(save_path_item, '')
            }
            let data = fs.readFileSync(save_path_item).toString()
            let lines = data.split('\n')
            for (let line of lines) {
                if (line == '') {continue}
                const order_raw: OrderItem = JSON.parse(line)
                const item = item_from_string(JSON.stringify(order_raw.item))
                const order = new OrderItem(order_raw.id, item, order_raw.price, order_raw.owner_id, order_raw.finished)
                
                Data.ItemOrders.set(order.id, order.owner_id, order)
                const last_id = Data.ItemOrders.id()
                Data.ItemOrders.set_id(Math.max(order.id, last_id) as order_item_id)            
            }
            console.log('item market orders loaded')
        }

        export function increase_id() {
            last_id_item = last_id_item + 1 as order_item_id
        }

        export function id() {
            return last_id_item
        }

        export function set_id(x: order_item_id) {
            last_id_item = x as order_item_id
        }

        export function set(id: order_item_id, owner_id: char_id, data: OrderItem) {
            orders_item.push(data)
            item_dict[id] = data
            const set = char_id_to_orders_item[owner_id]
            if (set == undefined) char_id_to_orders_item[owner_id] = new Set([id])
            else set.add(id)
        }

        export function from_id(id: order_item_id) {
            return item_dict[id]
        }

        export function list() {
            return orders_item
        }
    }

    export function CharacterBulkOrders(char_id: char_id) {
        const set = char_id_to_orders_bulk[char_id]
        if (set == undefined) return empty_set_orders_bulk 
        else return set
    }

    export function CharacterItemOrders(char_id: char_id) {
        const set = char_id_to_orders_item[char_id]
        if (set == undefined) return empty_set_orders_item
        else return set
    }

}