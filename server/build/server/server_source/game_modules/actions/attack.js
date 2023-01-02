"use strict";
// import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
// import type { Character } from "../../../character/character";
// import { Convert } from "../../../systems_communication";
// import { map_position } from "../../../types";
// import { CharacterSystem } from "../../../character/system";
// import { hostile } from "../../../races/racial_hostility";
// export const attack:ActionTargeted = {
//     duration(char: Character) {
//         return 0
//     },
//     check:  function(char:Character, data: map_position): CharacterActionResponce {
//         if (!char.in_battle()) {
//             let cell = Convert.character_to_cell(char);
//             if (cell == undefined) {
//                 return CharacterActionResponce.INVALID_CELL
//             }
//             let targets = cell.get_characters_list()
//             let target = undefined
//             for (let id of targets) {
//                 let target_char = Convert.id_to_character(id)
//                 if (hostile(char.archetype.race, target_char.archetype.race)) {
//                     if (!target_char.in_battle()) {
//                         target = target_char
//                     }
//                 }
//             } 
//             if (target == undefined) {
//                 return CharacterActionResponce.NO_POTENTIAL_ENEMY
//             } else {
//                 char.action_target = target.id
//                 return CharacterActionResponce.OK
//             }
//         } else return CharacterActionResponce.IN_BATTLE
//     },
//     result:  function(char:Character, data: map_position) {
//         let target_char = char.world.get_char_from_id(char.action_target)
//          char.world.create_battle(pool, [char], [target_char])
//     },
//     start:  function(char:Character, data: map_position) {
//     },
//     immediate: true
// }
