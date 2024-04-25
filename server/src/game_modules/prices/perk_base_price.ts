import { Character } from "../data/entities/character";
import { money } from "../../../../shared/common";
import { DataID } from "../data/data_id";
import { PERK, PerkStorage } from "@content/content";

export function perk_price(tag: PERK, student: Character, teacher: Character): money {
    let price = PerkStorage.get(tag).base_price;

    if (DataID.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!DataID.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!DataID.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;

    return Math.round(price) as money;
}
