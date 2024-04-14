"use strict";
// import { Character } from "../character/character"
// import { BattleActionAI, BattleActionUnitAI } from "./ACTIONS_AI"
// import { Battle } from "./classes/battle"
// import { Unit } from "./classes/unit"
// type Tactic = {
//     sequence: ({target: 'self', action: BattleActionAI}|{target: 'unit', action: BattleActionUnitAI})[]
// }
// type ExecutedTactic = {
//     step: number,
//     tactic: Tactic
// }
// export function execute(tactic: ExecutedTactic, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit ) {
//     let current = tactic.tactic.sequence[tactic.step]
//     if (current.target == 'self') {
//         current.action.execute(battle, character)
//     } else if (current.target == 'unit') {
//         current.action.execute(battle, character, target_character, target_unit)
//     }
//     if (tactic.step == tactic.tactic.sequence.length) {
//         return true
//     }
//     return false;
// }
// export function estimate_ap_cost(tactic: Tactic, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) {
//     let total = 0
//     for (let item of tactic.sequence) {
//         if (item.target == 'self') {
//             total += item.action.ap_cost(battle, character)
//         } else if (item.target == 'unit') {
//             total += item.action.ap_cost(battle, character, target_character, target_unit)
//         }
//     }
// }
// export function estimate_damage(tactic: Tactic, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) {
//     let total = 0
//     for (let item of tactic.sequence) {
//         if (item.target == 'self') {
//             total += item.action.damage(battle, character)
//         } else if (item.target == 'unit') {
//             total += item.action.damage(battle, character, target_character, target_unit)
//         }
//     }
// }
// export function estimate_preservation(tactic: Tactic, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) {
//     let total = 0
//     for (let item of tactic.sequence) {
//         if (item.target == 'self') {
//             total += item.action.preservation(battle, character)
//         } else if (item.target == 'unit') {
//             total += item.action.preservation(battle, character, target_character, target_unit)
//         }
//     }
// }

