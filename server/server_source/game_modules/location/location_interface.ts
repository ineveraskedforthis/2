import { Terrain, cell_id } from "@custom_types/common";
import { character_id, location_id } from "@custom_types/common";

export interface LocationMinimal {
    fish: number
    small_game: number
    berries: number
    cotton: number
    forest: number

    devastation: number

    has_house_level: number
    has_tanning_tools: boolean
    has_cordwainer_tools: boolean
    has_clothier_tools: boolean
    has_bowmaking_tools: boolean
    has_cooking_tools: boolean
    has_bed: boolean
    has_rat_lair: boolean

    terrain: Terrain
}

export interface LocationData extends LocationMinimal {
    readonly id: location_id,
    readonly cell_id: cell_id
}

export interface LocationInterface extends LocationData {
    readonly id: location_id
    readonly cell_id : cell_id
    owner_id: character_id|undefined

    readonly local_characters: character_id[]

    readonly can_hunt: boolean
    readonly can_fish: boolean
    readonly can_gather: boolean
    readonly can_farm_cotton: boolean
    readonly can_cut_trees: boolean
}