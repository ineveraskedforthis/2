



// export const item_base_damage = {
//         sword: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 10, slice: 20, fire: 0}
//             return result
//         },
//         empty: (result:AttackResult) => {
//             result.damage = {blunt: 3, pierce: 1, slice: 1, fire: 0}
//             return result
//         },
//         fist: (result:AttackResult) => {
//             result.damage = {blunt: 10, pierce: 1, slice: 1, fire: 0};
//             return result
//         },
//         spear: (result:AttackResult) => {
//             result.damage = {blunt: 5, pierce: 20, slice: 5, fire: 0}
//             return result
//         },
//         mace: (result:AttackResult) => {
//             result.damage = {blunt: 60, pierce: 0, slice: 0, fire: 0}
//             return result
//         },
//     }




// export function ranged_base_damage(result: AttackResult, arrow_type: material_index){
//     if (arrow_type == ARROW_BONE) {
//         result.damage.pierce += 10
//     }
//     return result
// }

// export function base_damage(result: AttackResult, item: Weapon) {
//     switch(item.impact_type) {
//         case IMPACT_TYPE.EDGE: {
//             let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight)
//             result.damage.slice = effective_weight * item.impact_quality / 100
//             result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100
//         }
//         case IMPACT_TYPE.POINT: {
//             let effective_weight = (item.impact_weight + item.shaft_weight)
//             result.damage.pierce = 2 * effective_weight * item.impact_quality / 100
//             result.damage.blunt = effective_weight * (100 - item.impact_quality) / 100
//         }
//         case IMPACT_TYPE.HEAD: {
//             let effective_weight = (item.impact_weight * item.shaft_length + item.shaft_weight)
//             result.damage.blunt = effective_weight;
//         }
//     }
//     return result
// }