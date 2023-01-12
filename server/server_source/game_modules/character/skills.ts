import { Data } from "../data";
import { money } from "../types";
import { Character } from "./character";

export class SkillList {
    clothier: number;
    cooking: number;
    onehand: number;
    polearms: number;
    noweapon: number;
    twohanded: number
    skinning: number;
    magic_mastery: number;
    blocking: number;
    evasion: number;
    woodwork: number;
    hunt: number;
    ranged: number;
    bone_carving: number;
    travelling: number;
    fishing: number;
    smith: number;


    constructor() {
        this.clothier       = 0;
        this.cooking        = 0;
        this.onehand        = 0;
        this.polearms       = 0;
        this.noweapon       = 0;
        this.twohanded      = 0;
        this.skinning       = 0;
        this.magic_mastery  = 0;
        this.blocking       = 0;
        this.evasion        = 0;
        this.woodwork       = 0;
        this.hunt           = 0;
        this.ranged         = 0;
        this.bone_carving   = 0;
        this.travelling     = 0;
        this.fishing        = 0;
        this.smith          = 0;
    }
}

export type skill = keyof SkillList

export function skill_price(tag: skill, student: Character, teacher: Character): money {
    let price = 10

    if (Data.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!Data.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!Data.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;

    return Math.round(student.skills[tag] * price) as money
}