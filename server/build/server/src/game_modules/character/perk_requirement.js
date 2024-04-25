"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perk_requirement = void 0;
function perk_requirement(tag) {
    switch (tag) {
        case 0 /* PERK.PRO_BUTCHER */: return { perks: [], skills: [{ skill: 2 /* SKILL.COOKING */, difficulty: 15 }] };
        case 1 /* PERK.PRO_COOK */: return { perks: [], skills: [{ skill: 2 /* SKILL.COOKING */, difficulty: 25 }] };
        case 2 /* PERK.PRO_BONEWORK */: return { perks: [], skills: [{ skill: 9 /* SKILL.BONE_CARVING */, difficulty: 25 }] };
        case 3 /* PERK.PRO_FLETCHER */: return { perks: [], skills: [{ skill: 8 /* SKILL.FLETCHING */, difficulty: 25 }] };
        case 4 /* PERK.PRO_LEATHERWORK */: return { perks: [], skills: [{ skill: 5 /* SKILL.LEATHERWORKING */, difficulty: 25 }] };
        case 5 /* PERK.PRO_TANNING */: return { perks: [], skills: [{ skill: 12 /* SKILL.TANNING */, difficulty: 25 }] };
        case 6 /* PERK.PRO_CORDWAINER */: return { perks: [], skills: [{ skill: 10 /* SKILL.CORDWAINING */, difficulty: 25 }] };
        case 7 /* PERK.PRO_FIGHTER_UNARMED */: return { perks: [], skills: [{ skill: 24 /* SKILL.UNARMED */, difficulty: 25 }, { skill: 25 /* SKILL.FIGHTING */, difficulty: 50 }] };
        case 8 /* PERK.PRO_FIGHTER_POLEARMS */: return { perks: [], skills: [{ skill: 23 /* SKILL.POLEARMS */, difficulty: 25 }, { skill: 25 /* SKILL.FIGHTING */, difficulty: 50 }] };
        case 9 /* PERK.PRO_FIGHTER_ONEHAND */: return { perks: [], skills: [{ skill: 21 /* SKILL.ONEHANDED */, difficulty: 25 }, { skill: 25 /* SKILL.FIGHTING */, difficulty: 50 }] };
        case 10 /* PERK.PRO_FIGHTER_TWOHAND */: return { perks: [], skills: [{ skill: 22 /* SKILL.TWOHANDED */, difficulty: 25 }, { skill: 25 /* SKILL.FIGHTING */, difficulty: 50 }] };
        case 11 /* PERK.MAGIC_INITIATION */: return { perks: [], skills: [{ skill: 26 /* SKILL.MAGIC */, difficulty: 15 }] };
        case 12 /* PERK.PRO_ALCHEMIST */: return { perks: [11 /* PERK.MAGIC_INITIATION */], skills: [{ skill: 26 /* SKILL.MAGIC */, difficulty: 20 }] };
        case 13 /* PERK.MAGIC_BLOOD */: return { perks: [11 /* PERK.MAGIC_INITIATION */], skills: [{ skill: 26 /* SKILL.MAGIC */, difficulty: 50 }] };
        case 14 /* PERK.MAGIC_BOLT */: return { perks: [11 /* PERK.MAGIC_INITIATION */], skills: [{ skill: 26 /* SKILL.MAGIC */, difficulty: 15 }] };
        case 15 /* PERK.MAGIC_BLINK */: return { perks: [11 /* PERK.MAGIC_INITIATION */], skills: [{ skill: 26 /* SKILL.MAGIC */, difficulty: 50 }] };
        case 16 /* PERK.BATTLE_DODGE */: return { perks: [], skills: [{ skill: 25 /* SKILL.FIGHTING */, difficulty: 25 }] };
        case 17 /* PERK.BATTLE_CHARGE */: return { perks: [], skills: [{ skill: 25 /* SKILL.FIGHTING */, difficulty: 25 }] };
    }
}
exports.perk_requirement = perk_requirement;
