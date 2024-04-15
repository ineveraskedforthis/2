import { DataID } from "../data/data_id";

import { Terrain } from "@custom_types/common";
import { cell_id, character_id } from "@custom_types/ids";
import { LocationData, LocationInterface, LocationMinimal } from "./location_interface";
import { location_id } from "@custom_types/ids";

export class Location implements LocationInterface {
    id: location_id

    fish: number;
    small_game: number;
    berries: number;
    cotton: number;
    forest: number;

    devastation: number;

    has_house_level: number
    has_rat_lair: boolean
    has_tanning_tools: boolean
    has_cordwainer_tools: boolean
    has_clothier_tools: boolean
    has_bowmaking_tools: boolean
    has_cooking_tools: boolean
    has_bed: boolean

    terrain: Terrain

    constructor(id: location_id|undefined, cell: cell_id, data: LocationMinimal) {
        this.fish = data.fish
        this.small_game = data.small_game
        this.berries = data.berries
        this.cotton = data.cotton
        this.forest = data.forest

        this.devastation = data.devastation

        this.has_tanning_tools = data.has_tanning_tools
        this.has_cordwainer_tools = data.has_cordwainer_tools
        this.has_clothier_tools = data.has_clothier_tools
        this.has_bowmaking_tools = data.has_bowmaking_tools
        this.has_cooking_tools = data.has_cooking_tools
        this.has_house_level = data.has_house_level
        this.has_bed = data.has_bed
        this.has_rat_lair = data.has_rat_lair

        this.terrain = data.terrain

        if (id == undefined)
            this.id = DataID.Location.new_id(cell)
        else {
            this.id = id
            DataID.Location.register(this.id, cell)
        }
    }

    get cell_id() {
        return DataID.Location.cell_id(this.id)
    }

    get owner_id() {
        return DataID.Location.owner_id(this.id)
    }

    set owner_id(x: character_id|undefined) {
        DataID.Connection.set_location_owner(x, this.id)
    }

    get local_characters() {
        return DataID.Location.guest_list(this.id)
    }

    get can_hunt() {
        return this.small_game > 0
    }

    get can_fish() {
        return this.fish > 0
    }

    get can_gather() {
        return this.berries > 0
    }

    get can_farm_cotton() {
        return this.cotton > 0
    }

    get can_cut_trees() {
        return this.forest > 0
    }
}