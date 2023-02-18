import { Data } from "../data";
import { money } from "../types";
import { Character } from "../character/character";
import { skill } from "../character/SkillList";


export function skill_price(tag: skill, student: Character, teacher: Character): money {
    let price = 10;

    if (Data.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!Data.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!Data.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;

    return Math.round(student.skills[tag] * price + 10) as money;
}
