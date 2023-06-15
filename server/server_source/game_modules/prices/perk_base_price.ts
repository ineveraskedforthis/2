// import { money } from "../types";
import { Character } from "../character/character";
import { Data } from "../data";
import { Perks } from "../../../../shared/character";
import { money } from "../../../../shared/common";
// import { Perks } from "../character/Perks";

function perk_base_price(tag: Perks): number {
    switch (tag) {
        case 'meat_master': return 100;
        case 'advanced_unarmed': return 200;
        case 'advanced_polearm': return 200;
        case 'mage_initiation': return 1000;
        case 'blood_mage': return 1000;
        case 'magic_bolt': return 100;
        case 'fletcher': return 200;
        case 'skin_armour_master': return 1000;
        case 'alchemist': return 1000;
        case "dodge": return 1000
        case "claws": return 1000
        case "charge": return 1000
        case "shoemaker": return 1000
        case "weapon_maker": return 1000
    }
}

export function perk_price(tag: Perks, student: Character, teacher: Character): money {
    let price = perk_base_price(tag);

    if (Data.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!Data.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!Data.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;

    return Math.round(price) as money;
}
