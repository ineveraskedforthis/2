import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { location_id, character_id } from "@custom_types/ids";
import { ScriptedValue } from "./scripted_values";
import { skill_price } from "../prices/skill_price";
import { CharacterSystem } from "../character/system";
import { skill } from "@custom_types/inventory";
import { Data } from "../data/data_objects";


export enum ResponseNegative {
    current_location_is_not_undefined = "current_location_is_not_undefined",
    no_rooms = "no_rooms",
    wrong_cell = "wrong_cell",
    no_money = "no_money",
    invalid_cell = "invalid_cell",
    no_owner = "no_owner",
}

export enum ResponseNegativeQuantified {
    Money = "money",
    TeacherSkill = "teacher_skill",
    Skill = "skill",
}

type LearningAvailableResponse = {
    response: ResponseNegativeQuantified,
    current_quantity: number,
    max_quantity: number|undefined,
    min_quantity: number|undefined} |
    { response: 'ok', price: money}


type LocationAvailableResponse =
    {response: ResponseNegative}
    |{response: "ok", owner_id: character_id|undefined, price: money}

export namespace Trigger {
    /**
    * Determines if the location is available for a given character.
    *
    * @param character_id The ID of the character.
    * @param location_id The ID of the location.
    * @returns An object with the response status and additional information if applicable.
    */
    export function location_is_available(character_id: character_id, location_id: location_id):LocationAvailableResponse {
        let location = Data.Locations.from_id(location_id)
        let owner_id = location.owner_id
        let character = Data.Characters.from_id(character_id)
        if (character.cell_id != location.cell_id) {
            return { response: ResponseNegative.invalid_cell }
        }

        return { response: "ok", owner_id: owner_id, price: 0 as money }
    }

    export function can_learn_from(student: Character, teacher: Character, skill: skill): LearningAvailableResponse {
        let savings = student.savings.get()
        const teacher_skill = CharacterSystem.pure_skill(teacher, skill)
        const student_skill = CharacterSystem.pure_skill(student, skill)
        if ((teacher_skill <= student_skill + 20) || (teacher_skill < 30)) {
            return {
                response: ResponseNegativeQuantified.TeacherSkill,
                current_quantity: teacher_skill,
                max_quantity: undefined,
                min_quantity: Math.max(student_skill + 20, 30)
            }
        }

        let price = skill_price(skill, student, teacher)
        if (savings < price) {
            return {
                response: ResponseNegativeQuantified.Money,
                current_quantity: savings,
                max_quantity: undefined,
                min_quantity: price
            }
        }
        return { response: 'ok', price: price}
    }
}