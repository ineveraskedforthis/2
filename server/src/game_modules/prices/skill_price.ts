import { Character } from "../data/entities/character";
import { money } from "@custom_types/common";
import { skill } from "@custom_types/inventory";
import { DataID } from "../data/data_id";


export function skill_price(tag: skill, student: Character, teacher: Character): money {
    let price = 10;

    if (DataID.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!DataID.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!DataID.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;

    return Math.round(student._skills[tag] * price + 10) as money;
}
