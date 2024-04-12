import fs from "fs"
import path from "path";

import { DEFAULT_WORLD_PATH, SAVE_GAME_PATH } from "../../SAVE_GAME_PATH";
import { Battle } from "../battle/classes/battle";
import { Character } from "../character/character";
import { Item } from "../items/item";
import { Faction, ReputationData, character_id, location_id, market_order_id, money, world_coordinates } from "@custom_types/common";
import { cell_id } from "@custom_types/common";
import { string_to_terrain } from "../map/terrain";
import { Terrain } from "@custom_types/common";
import { LocationData, LocationMinimal } from "../location/location_interface";
import { DataID } from "./data_id";
import { Location } from "../location/location_class";
import { CellData } from "../map/cell_interface";
import { character_to_string, string_to_character } from "./strings_management";
import { MarketOrder, MarketOrderData, MarketOrderInterface } from "../market/classes";
import { battle_id, ms } from "@custom_types/battle_data";
import { CharacterTemplate } from "../types";
import { material_index } from "@custom_types/inventory";

var character_id_object         : Character[]   = []
var item_id_object              : Item[]        = []
var market_order_id_object      : MarketOrder[] = []
var cell_id_object              : CellData[]    = []
var location_id_object          : Location[]    = []
var battle_id_object            : Battle[]      = []

var faction_id_object           : Record<string, Faction> = {}

export const save_path = {
    REPUTATION: path.join(SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path.join(SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path.join(SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path.join(SAVE_GAME_PATH, 'characters.txt'),
    CELLS: path.join(SAVE_GAME_PATH, 'cells.txt'),
    TRADE_ORDERS: path.join(SAVE_GAME_PATH, 'bulk_market.txt'),
    BATTLES: path.join(SAVE_GAME_PATH, 'battles.txt'),

    WORLD_DIMENSIONS: path.join(DEFAULT_WORLD_PATH, 'description.txt'),
    TERRAIN: path.join(DEFAULT_WORLD_PATH, 'map_terrain.txt'),
    FORESTS: path.join(DEFAULT_WORLD_PATH, 'map_forest.txt'),
    MARKETS: path.join(DEFAULT_WORLD_PATH, 'map_markets.txt'),
    FACTIONS: path.join(DEFAULT_WORLD_PATH, 'factions.txt'),
    SPAWN_POINTS: path.join(DEFAULT_WORLD_PATH, 'map_spawn_points.txt'),
}

function read_lines(file: string) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '')
    }
    let data = fs.readFileSync(file).toString()
    return data.split('\n')
}

var world_size:world_coordinates = [0, 0]
var max_direction = 0
var terrain: Terrain[][] = []
var is_market: Boolean[][] = []

const loaded_flag = {
    Characters: false
}


export namespace Data {
    export function load() {
        World.load_world_dimensions(save_path.WORLD_DIMENSIONS)
        World.load_terrain(save_path.TERRAIN)

        Cells.load(save_path.CELLS)
        Factions.load(save_path.FACTIONS, save_path.SPAWN_POINTS)
        World.load()
        Locations.load(save_path.BUILDINGS)
        Characters.load(save_path.CHARACTERS)
        MarketOrders.load()
        // ItemOrders.load()
        Reputation.load(save_path.REPUTATION)
        Locations.load_ownership(save_path.BUILDINGS_OWNERSHIP)
        Battles.load()
    }
    export function save() {
        Characters.save()
        MarketOrders.save()
        // ItemOrders.save()
        Reputation.save(save_path.REPUTATION)
        Locations.save(save_path.BUILDINGS)
        Locations.save_ownership(save_path.BUILDINGS_OWNERSHIP)
        Cells.save(save_path.CELLS)
        Battles.save()
    }

    export namespace Factions {
        export function register(id: string, spawn: cell_id, faction: Faction) {
            faction_id_object[id] = faction
            DataID.Faction.register(id, spawn)
        }

        export function from_id(id: string) {
            return faction_id_object[id]
        }

        export function load(path_factions: string, path_spawns: string){
            const lines_factions = read_lines(path_factions)
            const lines_spawns = read_lines(path_spawns)

            const array_faction_data: Faction[] = []
            const array_faction_spawn: cell_id[] = []

            for (let line of lines_factions) {
                let row = line.split(';')
                let faction: Faction = {
                    tag: row[0],
                    name: row[1],
                }
                array_faction_data.push(faction)
            }


            for (let line of lines_spawns) {
                let row = line.split(' ')
                let [tag, x, y] = [row[0], Number(row[1]), Number(row[2])]


                // console.log(tag, x, y)

                for (let faction of array_faction_data) {
                    if (faction.tag == tag) {
                        const spawn_point = World.coordinate_to_id([x, y])

                        register(faction.tag, spawn_point, faction)
                    }
                }
            }

            console.log(faction_id_object)
        }

        export function set_faction_leader(faction: string, character: character_id) {
            DataID.Reputation.set(character, faction, 'leader')
        }

        export function get_faction(tag: string) {
            return faction_id_object[tag]
        }

        export function get_factions() {
            return DataID.Faction.list_of_id().map(get_faction)
        }
    }

    export namespace Battles {
        export function load() {
            console.log('loading battles')
            if (!fs.existsSync(save_path.BATTLES)) {
                fs.writeFileSync(save_path.BATTLES, '')
            }
            let data = fs.readFileSync(save_path.BATTLES).toString()
            let lines = data.split('\n')

            for (let line of lines) {
                if (line == '') {continue}
                const battle = string_to_battle(line)
                if (battle.date_of_last_turn == '%') {
                    battle.date_of_last_turn = Date.now() as ms
                }

                battle_id_object[battle.id] = battle
            }

            console.log('battles loaded')
        }

        export function save() {
            console.log('saving battles')
            let str:string = ''

            for_each(battle => {
                if (!battle.stopped) str = str + battle_to_string(battle) + '\n'
            })

            fs.writeFileSync(save_path.BATTLES, str)
            console.log('battles saved')
        }

        function battle_to_string(battle: Battle) {
            return JSON.stringify(battle)
        }

        export function create() {
            const battle = new Battle(undefined)
            battle_id_object[battle.id] = battle
            return battle
        }

        function string_to_battle(s: string) {
            const json:Battle = JSON.parse(s)
            const battle = new Battle(json.id)

            battle.heap = json.heap
            const unit = battle.heap[0]

            if (unit != undefined) {
                const character = Characters.from_id(unit)
                if (character.is_player()) {
                    battle.waiting_for_input = true
                } else {
                    battle.waiting_for_input = false
                }
            } else {
                battle.waiting_for_input = false
            }

            battle.last_event_index = json.last_event_index
            battle.grace_period = json.grace_period||0
            return battle
        }

        export function from_id(battle: battle_id) {
            return battle_id_object[battle]
        }

        export function for_each(callback: (character: Battle) => void) {
            DataID.Battle.for_each((battle_id) => {
                const battle = battle_id_object[battle_id]
                callback(battle)
            })
        }
    }

    export namespace MarketOrders {
        export function save() {
            console.log('saving bulk market orders')
            let str:string = ''

            DataID.MarketOrders.for_each(
                (order) => {
                    const object = market_order_id_object[order]
                    if (object.amount == 0) return;

                    str += JSON.stringify(object)  + '\n'
                }
            )

            fs.writeFileSync(save_path.TRADE_ORDERS, str)
            console.log('bulk market orders saved')
        }

        export function create(amount: number, price: money, typ:'sell'|'buy', tag: material_index, owner: character_id) {
            const order = new MarketOrder(undefined, amount, price, typ, tag, owner)
            market_order_id_object[order.id] = order

            return order
        }

        export function load() {
            console.log('loading bulk market orders')
            if (!fs.existsSync(save_path.TRADE_ORDERS)) {
                fs.writeFileSync(save_path.TRADE_ORDERS, '')
            }
            let data = fs.readFileSync(save_path.TRADE_ORDERS).toString()
            let lines = data.split('\n')
            for (let line of lines) {
                if (line == '') {continue}
                const order: MarketOrderInterface = JSON.parse(line)
                market_order_id_object[order.id] = new MarketOrder(
                    order.id,
                    order.amount,
                    order.price,
                    order.typ,
                    order.material,
                    order.owner_id
                )
            }
            console.log('bulk market orders loaded')
        }

        export function from_number(id: number): MarketOrder|undefined {
            return market_order_id_object[id]
        }

        export function from_id(id: market_order_id): MarketOrder {
            return market_order_id_object[id]
        }
    }

    export namespace Reputation {
        interface ReputationLineData {
            character: character_id,
            item: ReputationData[]
        }

        export function load(save_path: string) {
            console.log('loading reputation')

            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let reputation_line : ReputationLineData = JSON.parse(line)
                for (const item of reputation_line.item) {
                    DataID.Reputation.set(reputation_line.character, item.faction_id, item.reputation)
                }
            }

            console.log('reputation loaded')
        }

        export function save(save_path: string) {
            console.log('saving reputation')
            let str:string = ''
            DataID.Character.for_each(
                (character) => {
                    const reputation = DataID.Reputation.character(character)
                    const line_data : ReputationLineData = {character: character, item: reputation}
                    str = str + JSON.stringify(line_data) + '\n'
                }
            )
            fs.writeFileSync(save_path, str)
            console.log('reputation saved')
        }
    }

    export namespace Characters {
        export function create(location: location_id, name: string, template: CharacterTemplate) {
            const character = new Character(undefined, undefined, undefined, location, name, template)
            character_id_object[character.id] = character

            return character
        }

        export function for_each(callback: (character: Character) => void) {
            DataID.Character.for_each((character_id) => {
                const character = character_id_object[character_id]
                callback(character)
            })
        }

        export function from_number(id: number): Character|undefined {
            return character_id_object[id]
        }

        export function from_id(id: character_id): Character
        export function from_id(id: character_id|undefined): Character|undefined
        export function from_id(id: character_id|undefined): Character|undefined {
            if (id == undefined) return undefined
            return character_id_object[id]
        }

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
                character_id_object[character.id] = character
            }
            loaded_flag.Characters = true
            console.log('characters loaded')
        }

        export function save() {
            console.log('saving characters')
            let str:string = ''

            DataID.Character.for_each((character) => {
                const object = character_id_object[character]
                str = str + character_to_string(object) + '\n'
            })

            fs.writeFileSync(save_path.CHARACTERS, str)
            console.log('characters saved')
        }
    }

    export namespace Cells {
        interface CellSaveData {
            id: cell_id,
            main_location: location_id,
            cell: CellData
        }

        export function save(save_path: string) {
            let str = '';

            cell_id_object.forEach((value, key) => {
                const data : CellSaveData = {
                    id: value.id,
                    main_location: DataID.Cells.main_location(value.id),
                    cell: value
                }
                str += JSON.stringify(data) + '\n'
            })

            fs.writeFileSync(save_path, str)
        }

        export function load(save_path: string) {
            console.log('loading map...')

            for (let line of read_lines(save_path)) {
                if (line == '') continue

                let data: CellSaveData = JSON.parse(line)

                DataID.Cells.register(data.id)
                DataID.Connection.set_main_location(data.id, data.main_location)

                cell_id_object[data.id] = data.cell
            }

            const dims = World.get_world_dimensions()
            for (let i = 0; i < dims[0]; i++) {
                for (let j = 0; j < dims[1]; j++) {
                    const id = World.coordinate_to_id([i,j])
                    let cell = cell_id_object[id]
                    if (cell == undefined) {
                        cell_id_object[id] = {
                            id: id,
                            x: i,
                            y: j,
                            rat_scent: 0,
                            loaded_forest: false,
                            loaded_spawn: false,
                        }
                        DataID.Cells.register(id)

                        const main_location = Locations.create(id, {
                            fish: 0,
                            small_game: 0,
                            berries: 0,
                            cotton: 0,
                            forest: 0,

                            devastation: 0,

                            terrain: terrain[i][j],

                            has_house_level: 0,

                            has_bed: false,
                            has_bowmaking_tools: false,
                            has_clothier_tools: false,
                            has_cooking_tools: false,
                            has_cordwainer_tools: false,
                            has_rat_lair: false,
                            has_tanning_tools: false
                        })

                        DataID.Connection.set_main_location(id, main_location.id)
                    }
                }
            }
        }

        export function from_id(cell: cell_id) {
            return cell_id_object[cell]
        }

        export function for_each(callback: (cell: CellData) => void) {
            DataID.Cells.for_each((cell_id) => {
                const cell = cell_id_object[cell_id]
                callback(cell)
            })
        }
    }

    export namespace Locations {

        export function create(cell: cell_id, data: LocationMinimal) {
            const location = new Location(undefined, cell, data)
            location_id_object[location.id] = location

            return location
        }

        export function load(save_path: string) {
            console.log('loading locations')

            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let {id, location}:{id: location_id, location: LocationData} = JSON.parse(line)
                location_id_object[id] = new Location(id, location.cell_id, location)
            }
        }

        export function load_ownership(save_path: string) {
            console.log('loading locations ownership')

            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let {character, location} : {character: character_id, location: location_id} = JSON.parse(line)
                DataID.Connection.set_location_owner(character, location)
            }
        }

        export function save(save_path: string) {
            let str = ''

            for (let id in location_id_object) {
                const object = location_id_object[id]
                const data: LocationData = {
                    id:             object.id,
                    cell_id:        object.cell_id,

                    fish:           object.fish,
                    cotton:         object.cotton,
                    forest:         object.forest,
                    berries:        object.berries,
                    small_game:     object.small_game,

                    devastation:    object.devastation,

                    has_house_level:        object.has_house_level,
                    has_bed:                object.has_bed,
                    has_bowmaking_tools:    object.has_bowmaking_tools,
                    has_clothier_tools:     object.has_clothier_tools,
                    has_cooking_tools:      object.has_cooking_tools,
                    has_cordwainer_tools:   object.has_cordwainer_tools,
                    has_tanning_tools:      object.has_tanning_tools,
                    has_rat_lair:           object.has_rat_lair,

                    terrain:                object.terrain
                }

                str += JSON.stringify({id: id, location: data}) + '\n'
            }

            fs.writeFileSync(save_path, str)
        }

        export function save_ownership(save_path: string) {
            let str = ''
            DataID.Location.for_each_ownership((location, owner) => {
                if (owner != undefined) {
                    str += JSON.stringify({character: owner, location: location}) + '\n'
                }
            })
            fs.writeFileSync(save_path, str)
        }

        export function from_id(id: location_id) {
            return location_id_object[id]
        }

        export function from_number(id: number): Location|undefined {
            return location_id_object[id]
        }

        export function for_each(callback: (cell: Location) => void) {
            DataID.Location.for_each((location_id) => {
                const location = location_id_object[location_id]
                callback(location)
            })
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
        }

        export function load_markets(path: string) {
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
                for (let forest_level_string of row ) {
                    let cell_id = coordinate_to_id([x, y])
                    const cell = cell_id_object[cell_id]

                    let forest_level = Number(forest_level_string)

                    if ((!cell.loaded_forest)) {
                        let counter = 0;

                        while (forest_level > 0) {
                            let forest: LocationMinimal = {
                                fish: 0,
                                small_game: 10,
                                berries: 10,
                                cotton: 2,
                                forest: 100,

                                devastation: 0,

                                has_house_level:        0,
                                has_bed:                false,
                                has_bowmaking_tools:    false,
                                has_clothier_tools:     false,
                                has_cooking_tools:      false,
                                has_cordwainer_tools:   false,
                                has_tanning_tools:      false,
                                has_rat_lair:           false,

                                terrain: terrain[x][y]
                            }

                            forest_level -= 1
                            counter++

                            Locations.create(cell_id, forest)
                        }

                        while (counter < 10) {
                            let steppe: LocationMinimal = {
                                fish: 0,
                                small_game: 2,
                                berries: 10,
                                cotton: 2,
                                forest: 0,

                                devastation: 0,

                                has_house_level:        0,
                                has_bed:                false,
                                has_bowmaking_tools:    false,
                                has_clothier_tools:     false,
                                has_cooking_tools:      false,
                                has_cordwainer_tools:   false,
                                has_tanning_tools:      false,
                                has_rat_lair:           false,

                                terrain: terrain[x][y]
                            }

                            counter++

                            Locations.create(cell_id, steppe)
                        }

                        cell.loaded_forest = true
                    }
                    y++;
                }
                x++
            }
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
            load_forests(save_path.FORESTS)
            load_markets(save_path.MARKETS)
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
}