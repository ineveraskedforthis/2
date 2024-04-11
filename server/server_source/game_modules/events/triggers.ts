import { money } from "@custom_types/common";
import { rooms } from "../DATA_LAYOUT_BUILDING";
import { Character } from "../character/character";
import { Data } from "../data";
import { building_id, char_id } from "../types";
import { ScriptedValue } from "./scripted_values";
import { skill_price } from "../prices/skill_price";
import { CharacterSystem } from "../character/system";
import { skill } from "@custom_types/inventory";


export enum ResponceNegative {
    current_building_is_not_undefined = "current_building_is_not_undefined",
    no_rooms = "no_rooms",
    wrong_cell = "wrong_cell",
    no_money = "no_money",
    invalid_cell = "invalid_cell",
    no_owner = "no_owner",
}

export enum ResponceNegativeQuantified {
    Money = "money",
    TeacherSkill = "teacher_skill",
    Skill = "skill",
}

type LearningAvailableResponce = {
    response: ResponceNegativeQuantified,
    current_quantity: number,
    max_quantity: number|undefined,
    min_quantity: number|undefined} |
    { response: 'ok', price: money}


type BuildingAvailableResponce =
     {response: ResponceNegative}
    |{response: "ok", owner_id: char_id|undefined, price: money}

export namespace Trigger {
    /**
    * Determines if the building is available for a given character.
    *
    * @param character_id The ID of the character.
    * @param building_id The ID of the building.
    * @returns An object with the response status and additional information if applicable.
    */
    export function building_is_available(character_id: char_id, building_id: building_id):BuildingAvailableResponce {
        let building = Data.Buildings.from_id(building_id)
        let rooms_not_available = Data.Buildings.occupied_rooms(building_id)
        let owner_id = Data.Buildings.owner(building_id)
        let character = Data.CharacterDB.from_id(character_id)
        if (character.current_building != undefined) {
            return { response: ResponceNegative.current_building_is_not_undefined }
        }
        if (character.cell_id != building.cell_id) {
            return { response: ResponceNegative.invalid_cell }
        }
        if (rooms_not_available >= rooms(building.type)) {
            return { response: ResponceNegative.no_rooms }
        }
        if (owner_id == undefined) {
            return { response: "ok", owner_id: undefined, price: 0 as money }
        }

        let price = ScriptedValue.room_price(building_id, character_id)
        if (character.savings.get() < price) {
            return { response: ResponceNegative.no_money }
        }
        let owner = Data.CharacterDB.from_id(owner_id)
        if (owner.cell_id != character.cell_id)
            return { response: ResponceNegative.invalid_cell }

        return { response: "ok", owner_id: owner_id, price: price }
    }

    export function can_learn_from(student: Character, teacher: Character, skill: skill): LearningAvailableResponce {
        let savings = student.savings.get()
        const teacher_skill = CharacterSystem.pure_skill(teacher, skill)
        const student_skill = CharacterSystem.pure_skill(student, skill)
        if ((teacher_skill <= student_skill + 20) || (teacher_skill < 30)) {
            return {
                response: ResponceNegativeQuantified.TeacherSkill,
                current_quantity: teacher_skill,
                max_quantity: undefined,
                min_quantity: Math.max(student_skill + 20, 30)
            }
        }

        let price = skill_price(skill, student, teacher)
        if (savings < price) {
            return {
                response: ResponceNegativeQuantified.Money,
                current_quantity: savings,
                max_quantity: undefined,
                min_quantity: price
            }
        }
        return { response: 'ok', price: price}
    }
}