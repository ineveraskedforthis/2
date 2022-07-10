import type { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import { World } from "../world";
import { CharacterAction } from "./action_manager";


// function MAYOR_AI(mayor: CharacterGenericPart) {
//     let faction = mayor.get_faction()
//     let territories = faction.get_territories_list()
//     for (let ter of territories)  {
//         if (ter.is_contested(faction)) {
//             let enemy = ter.get_largest_enemy_faction(faction)
//             mayor.create_quest({quest_tag: "extermination", target_tag: enemy.get_tag(), territory: ter.tag}, {reputation: 1, money:1})
//         }
//     }
// }

// export const AI = {
//     'major' : MAYOR_AI
// }


let dp = [[0, 1], [0 ,-1] ,[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]


export class AiManager {
    world: World;
    constructor(world:World) {
        this.world = world
    }

    path_finding_calculations() {

    }

    move_toward_colony(char: CharacterGenericPart) {

    }

    enemies_in_cell(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) return false
        let a = cell.get_characters_set()
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id)
            if ((target_char.get_tag() == 'test') && (char.get_tag() == 'rat') || (target_char.get_tag() == 'rat') && (char.get_tag() == 'char')) {
                if (!target_char.in_battle() && !target_char.is_dead()) {
                    return target_char.id
                }                
            }
        } 
        return -1
    }

    async random_steppe_walk(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) {
            return
        }
        let possible_moves = []
        for (let d of dp) {      
            let tmp = [d[0] + cell.i, d[1] + cell.j]
            let territory = this.world.get_territory(tmp[0], tmp[1])
            let new_cell = this.world.get_cell(tmp[0], tmp[1])
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] < 1)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            await this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
        }   
    }

    async random_forest_walk(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) {
            return
        }
        let possible_moves = []
        for (let d of dp) {      
            let tmp = [d[0] + cell.i, d[1] + cell.j]
            let territory = this.world.get_territory(tmp[0], tmp[1])
            let new_cell = this.world.get_cell(tmp[0], tmp[1])
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] > 0)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            await this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
        }
    }

    async decision(char: CharacterGenericPart) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return
        }

        if (char.in_battle()) {
            return
        }

        if (char.action_started) {
            return
        }

        switch(char.misc.ai_tag) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    let target = this.enemies_in_cell(char)
                    if (target != -1) {
                        await this.world.action_manager.start_action(CharacterAction.ATTACK, char, target)
                    } else {
                        await this.random_steppe_walk(char)
                    }
                }
                break
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_steppe_walk(char)
                }
                break
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_forest_walk(char)
                }
                break
            }
        }
    }
}