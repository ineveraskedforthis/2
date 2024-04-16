import { SkillListInterface, skill } from "@custom_types/inventory";

export class SkillList implements SkillListInterface{
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
    tanning: number;

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
        this.tanning        = 0
    }
}

export function is_crafting_skill(skill: skill): boolean {
    switch (skill) {
        case "clothier":return true
        case "cooking":return false
        case "onehand":return false
        case "polearms":return false
        case "noweapon":return false
        case "twohanded":return false
        case "skinning":return false
        case "magic_mastery":return false
        case "blocking":return false
        case "evasion":return false
        case "woodwork":return true
        case "hunt":return false
        case "ranged":return false
        case "bone_carving":return true
        case "travelling":return false
        case "fishing":return false
        case "smith":return true
        case "tanning":return true
    }
}

export function is_melee_skill(skill: skill) {
    if (skill === 'blocking') return true
    if (skill === 'noweapon') return true
    if (skill === 'onehand') return true
    if (skill === 'twohanded') return true
    if (skill === 'polearms') return true
    if (skill === 'evasion') return true

    return false
}