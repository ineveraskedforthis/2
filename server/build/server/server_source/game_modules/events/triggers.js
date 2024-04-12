"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = exports.ResponceNegativeQuantified = exports.ResponceNegative = void 0;
const scripted_values_1 = require("./scripted_values");
const skill_price_1 = require("../prices/skill_price");
const system_1 = require("../character/system");
const data_objects_1 = require("../data/data_objects");
var ResponceNegative;
(function (ResponceNegative) {
    ResponceNegative["current_location_is_not_undefined"] = "current_location_is_not_undefined";
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
    * Determines if the location is available for a given character.
    *
    * @param character_id The ID of the character.
    * @param location_id The ID of the location.
    * @returns An object with the response status and additional information if applicable.
    */
    function location_is_available(character_id, location_id) {
        let location = data_objects_1.Data.Locations.from_id(location_id);
        let owner_id = location.owner_id;
        let character = data_objects_1.Data.Characters.from_id(character_id);
        if (character.cell_id != location.cell_id) {
            return { response: ResponceNegative.invalid_cell };
        }
        if (owner_id == undefined) {
            return { response: "ok", owner_id: undefined, price: 0 };
        }
        let owner = data_objects_1.Data.Characters.from_id(owner_id);
        if (owner.cell_id != character.cell_id)
            return { response: ResponceNegative.invalid_cell };
        return { response: "ok", owner_id: owner_id, price: scripted_values_1.ScriptedValue.rest_price(character, location) };
    }
    Trigger.location_is_available = location_is_available;
    function can_learn_from(student, teacher, skill) {
        let savings = student.savings.get();
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
        let price = (0, skill_price_1.skill_price)(skill, student, teacher);
        if (savings < price) {
            return {
                response: ResponceNegativeQuantified.Money,
                current_quantity: savings,
                max_quantity: undefined,
                min_quantity: price
            };
        }
        return { response: 'ok', price: price };
    }
    Trigger.can_learn_from = can_learn_from;
})(Trigger = exports.Trigger || (exports.Trigger = {}));
