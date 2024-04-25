import { PERK, SKILL } from "@content/content";
import { skill_check } from "@custom_types/inventory";
import { Character } from "../data/entities/character";

export function perk_requirement(tag: PERK) : {perks: PERK[], skills: skill_check[]} {
    switch (tag) {
        case PERK.PRO_BUTCHER: return {perks: [], skills: [{skill: SKILL.COOKING, difficulty: 15}]}
        case PERK.PRO_COOK: return {perks: [], skills: [{skill: SKILL.COOKING, difficulty: 25}]}
        case PERK.PRO_BONEWORK: return {perks: [], skills: [{skill: SKILL.BONE_CARVING, difficulty: 25}]}
        case PERK.PRO_FLETCHER: return {perks: [], skills: [{skill: SKILL.FLETCHING, difficulty: 25}]}
        case PERK.PRO_LEATHERWORK: return {perks: [], skills: [{skill: SKILL.LEATHERWORKING, difficulty: 25}]}
        case PERK.PRO_TANNING: return {perks: [], skills: [{skill: SKILL.TANNING, difficulty: 25}]}
        case PERK.PRO_CORDWAINER: return {perks: [], skills: [{skill: SKILL.CORDWAINING, difficulty: 25}]}
        case PERK.PRO_FIGHTER_UNARMED: return {perks: [], skills: [{skill: SKILL.UNARMED, difficulty: 25}, {skill: SKILL.FIGHTING, difficulty: 50}]}
        case PERK.PRO_FIGHTER_POLEARMS: return {perks: [], skills: [{skill: SKILL.POLEARMS, difficulty: 25}, {skill: SKILL.FIGHTING, difficulty: 50}]}
        case PERK.PRO_FIGHTER_ONEHAND: return {perks: [], skills: [{skill: SKILL.ONEHANDED, difficulty: 25}, {skill: SKILL.FIGHTING, difficulty: 50}]}
        case PERK.PRO_FIGHTER_TWOHAND: return {perks: [], skills: [{skill: SKILL.TWOHANDED, difficulty: 25}, {skill: SKILL.FIGHTING, difficulty: 50}]}
        case PERK.MAGIC_INITIATION: return {perks: [], skills: [{skill: SKILL.MAGIC, difficulty: 15}]}
        case PERK.PRO_ALCHEMIST: return {perks: [PERK.MAGIC_INITIATION], skills: [{skill: SKILL.MAGIC, difficulty: 20}]}
        case PERK.MAGIC_BLOOD: return {perks: [PERK.MAGIC_INITIATION], skills: [{skill: SKILL.MAGIC, difficulty: 50}]}
        case PERK.MAGIC_BOLT: return {perks: [PERK.MAGIC_INITIATION], skills: [{skill: SKILL.MAGIC, difficulty: 15}]}
        case PERK.MAGIC_BLINK: return {perks: [PERK.MAGIC_INITIATION], skills: [{skill: SKILL.MAGIC, difficulty: 50}]}
        case PERK.BATTLE_DODGE: return {perks: [], skills: [{skill: SKILL.FIGHTING, difficulty: 25}]}
        case PERK.BATTLE_CHARGE: return {perks: [], skills: [{skill: SKILL.FIGHTING, difficulty: 25}]}
    }
}
