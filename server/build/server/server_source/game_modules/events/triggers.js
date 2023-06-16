"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = exports.ResponceNegativeQuantified = exports.ResponceNegative = void 0;
const DATA_LAYOUT_BUILDING_1 = require("../DATA_LAYOUT_BUILDING");
const data_1 = require("../data");
const scripted_values_1 = require("./scripted_values");
const skill_price_1 = require("../prices/skill_price");
const system_1 = require("../character/system");
var ResponceNegative;
(function (ResponceNegative) {
    ResponceNegative["current_building_is_not_undefined"] = "current_building_is_not_undefined";
    ResponceNegative["no_rooms"] = "no_rooms";
    ResponceNegative["wrong_cell"] = "wrong_cell";
    ResponceNegative["no_money"] = "no_money";
    ResponceNegative["invalid_cell"] = "invalid_cell";
    ResponceNegative["no_owner"] = "no_owner";
})(ResponceNegative = exports.ResponceNegative || (exports.ResponceNegative = {}));
var ResponceNegativeQuantified;
(function (ResponceNegativeQuantified) {
    ResponceNegativeQuantified["Money"] = "money";
    ResponceNegativeQuantified["TeacherSkill"] = "teacher_skill";
    ResponceNegativeQuantified["Skill"] = "skill";
})(ResponceNegativeQuantified = exports.ResponceNegativeQuantified || (exports.ResponceNegativeQuantified = {}));
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
            return { response: ResponceNegative.current_building_is_not_undefined };
        }
        if (character.cell_id != building.cell_id) {
            return { response: ResponceNegative.invalid_cell };
        }
        if (rooms_not_available >= (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type)) {
            return { response: ResponceNegative.no_rooms };
        }
        if (owner_id == undefined) {
            return { response: "ok", owner_id: undefined, price: 0 };
        }
        let price = scripted_values_1.ScriptedValue.room_price(building_id, character_id);
        if (character.savings.get() < price) {
            return { response: ResponceNegative.no_money };
        }
        let owner = data_1.Data.CharacterDB.from_id(owner_id);
        if (owner.cell_id != character.cell_id)
            return { response: ResponceNegative.invalid_cell };
        return { response: "ok", owner_id: owner_id, price: price };
    }
    Trigger.building_is_available = building_is_available;
    function can_learn_from(student, teacher, skill) {
        let savings = student.savings.get();
        let price = (0, skill_price_1.skill_price)(skill, student, teacher);
        if (savings < price) {
            return {
                response: ResponceNegativeQuantified.Money,
                current_quantity: savings,
                max_quantity: undefined,
                min_quantity: price
            };
        }
        const teacher_skill = system_1.CharacterSystem.pure_skill(teacher, skill);
        const student_skill = system_1.CharacterSystem.pure_skill(student, skill);
        if ((teacher_skill <= student_skill + 20) || (teacher_skill < 30)) {
            return {
                response: ResponceNegativeQuantified.TeacherSkill,
                current_quantity: teacher_skill,
                max_quantity: undefined,
                min_quantity: Math.max(student_skill + 20, 30)
            };
        }
        return { response: 'ok', price: price };
    }
    Trigger.can_learn_from = can_learn_from;
})(Trigger = exports.Trigger || (exports.Trigger = {}));
