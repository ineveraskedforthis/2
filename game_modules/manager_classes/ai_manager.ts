import type { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import { hostile } from "../base_game_classes/races/racial_hostility";
import { money } from "../base_game_classes/savings";
import { PgPool, World } from "../world";
import { ActionManager, CharacterAction } from "./action_manager";
import { FOOD, MEAT } from "./materials_manager";


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
            if (hostile(char.get_tag(), target_char.get_tag())) {
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

    async decision(pool: PgPool, char: CharacterGenericPart) {
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
                return
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_steppe_walk(char)
                }
                return
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_forest_walk(char)
                }
                return
            }
        }

        if ((char.get_fatigue() > 90) || (char.get_stress() > 40)) {
            await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
            return
        }

        if ((char.skills.cooking.practice > 40) || (char.skills.perks.meat_master)) {
            await AI.cook_food(pool, this.world.action_manager, char)
        }
    }
}

namespace AI {
    export async function cook_food(pool:PgPool, action_manager:ActionManager, character:CharacterGenericPart) {
        let prepared_meat = character.trade_stash.get(FOOD) + character.stash.get(FOOD)
        let resource = character.stash.get(MEAT)
        let food_in_stash = character.stash.get(FOOD)
        let base_buy_price = 5 as money
        let base_sell_price = 10 as money
        let savings = character.savings.get()
        // console.log("AI tick")
        // console.log(prepared_meat, resource, food_in_stash, savings)

        // await character.world.entity_manager.remove_orders(pool, character)

        if ((resource < 5) && (savings > base_buy_price)) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, MEAT)
            // console.log(Math.floor(savings / base_buy_price), base_buy_price)
            await character.buy(pool, MEAT, Math.floor(savings / base_buy_price), base_buy_price)
        }

        if (prepared_meat < 10) {
            await action_manager.start_action(CharacterAction.COOK_MEAT, character, undefined)
        }

        if (food_in_stash > 5) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, FOOD)
            await character.sell(pool, FOOD, food_in_stash, base_sell_price)
        }
    }
}