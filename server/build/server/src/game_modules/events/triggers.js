"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = exports.ResponseNegativeQuantified = exports.ResponseNegative = void 0;
const data_objects_1 = require("../data/data_objects");
const skill_price_1 = require("../prices/skill_price");
const character_1 = require("../scripted-values/character");
var ResponseNegative;
(function (ResponseNegative) {
    ResponseNegative["current_location_is_not_undefined"] = "current_location_is_not_undefined";
    ResponseNegative["no_rooms"] = "no_rooms";
    ResponseNegative["wrong_cell"] = "wrong_cell";
    ResponseNegative["no_money"] = "no_money";
    ResponseNegative["invalid_cell"] = "invalid_cell";
    ResponseNegative["no_owner"] = "no_owner";
})(ResponseNegative || (exports.ResponseNegative = ResponseNegative = {}));
var ResponseNegativeQuantified;
(function (ResponseNegativeQuantified) {
    ResponseNegativeQuantified["Money"] = "money";
    ResponseNegativeQuantified["TeacherSkill"] = "teacher_skill";
    ResponseNegativeQuantified["Skill"] = "skill";
})(ResponseNegativeQuantified || (exports.ResponseNegativeQuantified = ResponseNegativeQuantified = {}));
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
            return { response: ResponseNegative.invalid_cell };
        }
        return { response: "ok", owner_id: owner_id, price: 0 };
    }
    Trigger.location_is_available = location_is_available;
    function can_learn_from(student, teacher, skill) {
        let savings = student.savings.get();
        const teacher_skill = character_1.CharacterValues.pure_skill(teacher, skill);
        const student_skill = character_1.CharacterValues.pure_skill(student, skill);
        if ((teacher_skill <= student_skill + 20) || (teacher_skill < 30)) {
            return {
                response: ResponseNegativeQuantified.TeacherSkill,
                current_quantity: teacher_skill,
                max_quantity: undefined,
                min_quantity: Math.max(student_skill + 20, 30)
            };
        }
        let price = (0, skill_price_1.skill_price)(skill, student, teacher);
        if (savings < price) {
            return {
                response: ResponseNegativeQuantified.Money,
                current_quantity: savings,
                max_quantity: undefined,
                min_quantity: price
            };
        }
        return { response: 'ok', price: price };
    }
    Trigger.can_learn_from = can_learn_from;
})(Trigger || (exports.Trigger = Trigger = {}));
