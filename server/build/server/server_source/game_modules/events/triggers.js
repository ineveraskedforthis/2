"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = void 0;
const DATA_LAYOUT_BUILDING_1 = require("../DATA_LAYOUT_BUILDING");
const data_1 = require("../data");
const scripted_values_1 = require("./scripted_values");
var BuildingResponceNegative;
(function (BuildingResponceNegative) {
    BuildingResponceNegative["current_building_is_not_undefined"] = "current_building_is_not_undefined";
    BuildingResponceNegative["no_rooms"] = "no_rooms";
    BuildingResponceNegative["wrong_cell"] = "wrong_cell";
    BuildingResponceNegative["no_money"] = "no_money";
    BuildingResponceNegative["invalid_cell"] = "invalid_cell";
    BuildingResponceNegative["no_owner"] = "no_owner";
})(BuildingResponceNegative || (BuildingResponceNegative = {}));
var Trigger;
(function (Trigger) {
    /**
    * Determines if the building is available for a given character.
    *
    * @param character_id The ID of the character.
    * @param building_id The ID of the building.
    * @returns An object with the response status and additional information if applicable.
    */
    function building_is_available(character_id, building_id) {
        let building = data_1.Data.Buildings.from_id(building_id);
        let rooms_not_available = data_1.Data.Buildings.occupied_rooms(building_id);
        let owner_id = data_1.Data.Buildings.owner(building_id);
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building != undefined) {
            return { response: BuildingResponceNegative.current_building_is_not_undefined };
        }
        if (character.cell_id != building.cell_id) {
            return { response: BuildingResponceNegative.invalid_cell };
        }
        if (rooms_not_available >= (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type)) {
            return { response: BuildingResponceNegative.no_rooms };
        }
        if (owner_id == undefined) {
            return { response: "ok", owner_id: undefined, price: 0 };
        }
        let price = scripted_values_1.ScriptedValue.room_price(building_id, character_id);
        if (character.savings.get() < price) {
            return { response: BuildingResponceNegative.no_money };
        }
        let owner = data_1.Data.CharacterDB.from_id(owner_id);
        if (owner.cell_id != character.cell_id)
            return { response: BuildingResponceNegative.invalid_cell };
        return { response: "ok", owner_id: owner_id, price: price };
    }
    Trigger.building_is_available = building_is_available;
})(Trigger = exports.Trigger || (exports.Trigger = {}));
