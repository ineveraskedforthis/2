"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const data_id_1 = require("../data/data_id");
class Location {
    constructor(id, cell, data) {
        this.fish = data.fish;
        this.small_game = data.small_game;
        this.berries = data.berries;
        this.cotton = data.cotton;
        this.forest = data.forest;
        this.devastation = data.devastation;
        this.has_tanning_tools = data.has_tanning_tools;
        this.has_cordwainer_tools = data.has_cordwainer_tools;
        this.has_clothier_tools = data.has_clothier_tools;
        this.has_bowmaking_tools = data.has_bowmaking_tools;
        this.has_cooking_tools = data.has_cooking_tools;
        this.has_house_level = data.has_house_level;
        this.has_bed = data.has_bed;
        this.has_rat_lair = data.has_rat_lair;
        this.terrain = data.terrain;
        if (id == undefined)
            this.id = data_id_1.DataID.Location.new_id(cell);
        else {
            this.id = id;
            data_id_1.DataID.Location.register(this.id, cell);
        }
    }
    get cell_id() {
        return data_id_1.DataID.Location.cell_id(this.id);
    }
    get owner_id() {
        return data_id_1.DataID.Location.owner_id(this.id);
    }
    set owner_id(x) {
        data_id_1.DataID.Connection.set_location_owner(x, this.id);
    }
    get local_characters() {
        return data_id_1.DataID.Location.guest_list(this.id);
    }
    get can_hunt() {
        return this.small_game > 0;
    }
    get can_fish() {
        return this.fish > 0;
    }
    get can_gather() {
        return this.berries > 0;
    }
    get can_farm_cotton() {
        return this.cotton > 0;
    }
    get can_cut_trees() {
        return this.forest > 0;
    }
}
exports.Location = Location;
