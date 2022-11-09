"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// function MAYOR_AI(mayor: Character) {
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
// let dp = [[0, 1], [0 ,-1] ,[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]
// export class AiManager {
//     ;
//     constructor(world:World) {
//         this.world = world
//     }
//     path_finding_calculations() {
//     }
//     move_toward_colony(char: Character) {
//     }
//     enemies_in_cell(char: Character) {
//         let cell = char.get_cell()
//         if (cell == undefined) return false
//         let a = cell.get_characters_set()
//         for (let id of a) {
//             let target_char = this.world.get_char_from_id(id)
//             if (hostile(char.get_tag(), target_char.get_tag())) {
//                 if (!target_char.in_battle() && !target_char.is_dead()) {
//                     return target_char.id
//                 }                
//             }
//         } 
//         return -1
//     }
//     battles_in_cell(char: Character) {
//         let battles:number[] = []
//         let cell = char.get_cell()
//         if (cell == undefined) return battles
//         let a = cell.get_characters_set()
//         for (let id of a) {
//             let target_char = this.world.get_char_from_id(id)
//             if (target_char.in_battle() && !target_char.is_dead()) {
//                 battles.push(target_char.get_battle_id())
//             }        
//         } 
//         return battles
//     }
//      random_steppe_walk(char: Character) {
//         let cell = char.get_cell()
//         if (cell == undefined) {
//             return
//         }
//         let possible_moves = []
//         for (let d of dp) {      
//             let tmp = [d[0] + cell.i, d[1] + cell.j]
//             let territory = this.world.get_territory(tmp[0], tmp[1])
//             let new_cell = this.world.get_cell(tmp[0], tmp[1])
//             if (new_cell != undefined) {
//                 if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] < 1)) {
//                     possible_moves.push(tmp)
//                 }
//             } 
//         }
//         if (possible_moves.length > 0) {
//             let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
//              this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
//         }   
//     }
//     check_battles_to_join(agent: Character) {
//         let battles = this.battles_in_cell(agent)
//         for (let item of battles) {
//             let battle = this.world.entity_manager.battles[item]
//             console.log('check_battle')
//             if (!(battle.ended)) {
//                 let team = battle.check_team_to_join(agent)
//                 console.log(team)
//                 if (team == 'no_interest') continue
//                 else {
//                     battle.join(agent, team)
//                     return true
//                 }
//             }
//         }
//         return false
//     }
//      random_forest_walk(char: Character) {
//         let cell = char.get_cell()
//         if (cell == undefined) {
//             return
//         }
//         let possible_moves = []
//         for (let d of dp) {      
//             let tmp = [d[0] + cell.i, d[1] + cell.j]
//             let territory = this.world.get_territory(tmp[0], tmp[1])
//             let new_cell = this.world.get_cell(tmp[0], tmp[1])
//             if (new_cell != undefined) {
//                 if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] > 0)) {
//                     possible_moves.push(tmp)
//                 }
//             } 
//         }
//         if (possible_moves.length > 0) {
//             let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
//              this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
//         }
//     }
//      decision(char: Character) {
//         // console.log(char.misc.ai_tag)
//         if (char.is_player()) {
//             return
//         }
//         if (char.in_battle()) {
//             return
//         }
//         if (char.action_started) {
//             return
//         }
//         let responce = this.check_battles_to_join(char)
//         if (responce) return;
//         switch(char.misc.ai_tag) {
//             case 'steppe_walker_agressive': {
//                 if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
//                      this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
//                 } else {
//                     let target = this.enemies_in_cell(char)
//                     if (target != -1) {
//                          this.world.action_manager.start_action(CharacterAction.ATTACK, char, target)
//                     } else {
//                          this.random_steppe_walk(char)
//                     }
//                 }
//                 break
//             }
//             case 'steppe_walker_passive': {
//                 if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
//                      this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
//                 } else {
//                      this.random_steppe_walk(char)
//                 }
//                 break
//             }
//             case 'forest_walker': {
//                 if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
//                      this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
//                 } else {
//                      this.random_forest_walk(char)
//                 }
//                 break
//             }
//         }
//         if ((char.get_fatigue() > 90) || (char.get_stress() > 40)) {
//              this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
//             return
//         }
//         if ((char.skills.cooking > 40) || (char.skills.perks.meat_master == true)) {
//              AI.cook_food(pool, this.world.action_manager, char)
//         }
//         if ((char.skills.woodwork > 40) || (char.skills.perks.fletcher == true)) {
//              AI.make_arrow(pool, this.world.action_manager, char)
//         }
//         if ((char.skills.clothier > 40) ||(char.skills.perks.skin_armour_master == true)) {
//              AI.make_armour(pool, this.world.action_manager, char)
//         }
//     }
// }
// namespace AI {
//     export  function cook_food(pool:PgPool, action_manager:ActionManager, character:Character) {
//         let prepared_meat = character.trade_stash.get(FOOD) + character.stash.get(FOOD)
//         let resource = character.stash.get(MEAT)
//         let food_in_stash = character.stash.get(FOOD)
//         let base_buy_price = 5 as money
//         let base_sell_price = 10 as money
//         let savings = character.savings.get()
//         // console.log("AI tick")
//         // console.log(prepared_meat, resource, food_in_stash, savings)
//         //  character.world.entity_manager.remove_orders(pool, character)
//         if ((resource < 5) && (savings > base_buy_price)) {
//              character.world.entity_manager.remove_orders_by_tag(pool, character, MEAT)
//             // console.log(Math.floor(savings / base_buy_price), base_buy_price)
//              character.buy(pool, MEAT, Math.floor(savings / base_buy_price), base_buy_price)
//         }
//         if (prepared_meat < 10) {
//              action_manager.start_action(CharacterAction.COOK_MEAT, character, undefined)
//         }
//         if (food_in_stash > 0) {
//              character.world.entity_manager.remove_orders_by_tag(pool, character, FOOD)
//              character.sell(pool, FOOD, food_in_stash, base_sell_price)
//         }
//     }
//     export  function make_arrow(pool:PgPool, action_manager:ActionManager, character:Character) {
//          character.world.entity_manager.remove_orders_by_tag(pool, character, WOOD)
//          character.world.entity_manager.remove_orders_by_tag(pool, character, RAT_BONE)
//         let arrows = character.trade_stash.get(ARROW_BONE) + character.stash.get(ARROW_BONE)
//         let wood = character.stash.get(WOOD)
//         let bones = character.stash.get(RAT_BONE)
//         let savings = character.savings.get()
//         let trade_savings = character.trade_savings.get()
//         let reserve_units = Math.min(wood, bones / 10)
//         let arrows_in_stash = character.stash.get(ARROW_BONE)
//         let base_price_wood = 5 as money
//         let base_price_bones = 1 as money
//         let input_price = (base_price_wood + 10 * base_price_bones)
//         let profit = 0.5
//         let sell_price = Math.floor(input_price * (1 + profit) / craft_bone_arrow_probability(character) / 10) + 1 as money
//         // bones_to_buy * b_p + wood_to_buy * w_p = savings
//         // (bones_to_buy + bones) - 10 (wood_to_buy + wood) = 0
//         // so
//         // bones_to_buy * b_p + wood_to_buy * w_p            = savings
//         // bones_to_buy       - wood_to_buy * 10             = -bones + 10 * wood
//         // bones_to_buy * b_p + wood_to_buy * w_p            = savings
//         // bones_to_buy * b_p - wood_to_buy * 10 b_p         = (-bones + 10 * wood) * b_p
//         // bones_to_buy * b_p + wood_to_buy * w_p            = savings
//         //                    - wood_to_buy * (10 b_p + w_p) = (-bones + 10 * wood) * b_p - savings
//         // bones_to_buy * b_p + wood_to_buy * w_p            = savings
//         //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
//         // bones_to_buy                                      = (savings - wood_to_buy * w_p) / b_p
//         //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
//         // makes sense only if results are not negative
//         if (reserve_units < 5) {
//             let savings = character.savings.get()
//             let wood_to_buy = -((-bones + 10 * wood) * base_price_bones - savings) / (10 * base_price_bones + base_price_wood)
//             let bones_to_buy = (savings - wood_to_buy * base_price_wood) / base_price_bones
//             // console.log(savings, bones, wood)
//             // console.log(wood_to_buy, bones_to_buy)
//             if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
//                  character.buy(pool, WOOD, Math.floor(wood_to_buy), base_price_wood)
//                  character.buy(pool, RAT_BONE, Math.floor(bones_to_buy), base_price_bones)
//             } else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
//                  character.buy(pool, WOOD, Math.floor(savings / base_price_wood), base_price_wood)
//             } else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
//                  character.buy(pool, RAT_BONE, Math.floor(savings / RAT_BONE), base_price_bones)
//             } 
//         }
//         if (arrows < 100) {
//              action_manager.start_action(CharacterAction.CRAFT_BONE_ARROW, character, undefined)
//         }
//         if (arrows_in_stash > 0) {
//              character.world.entity_manager.remove_orders_by_tag(pool, character, ARROW_BONE)
//             arrows_in_stash = character.stash.get(ARROW_BONE)
//              character.sell(pool, ARROW_BONE, arrows_in_stash, sell_price)
//         }
//     }
//     export  function make_armour(pool:PgPool, action_manager:ActionManager, character:Character) {
//         let base_price_skin = 10 as money
//         let resource = character.stash.get(RAT_SKIN)
//         let savings = character.savings.get()
//         let skin_to_buy = Math.floor(savings / base_price_skin)
//         // console.log('armour')
//         // console.log(resource, savings, skin_to_buy)
//         if (skin_to_buy > 5) {
//              character.world.entity_manager.remove_orders_by_tag(pool, character, RAT_SKIN)
//              character.buy(pool, RAT_SKIN, skin_to_buy, base_price_skin)
//         }
//         if (resource > RAT_SKIN_ARMOUR_SKIN_NEEDED) {
//              action_manager.start_action(CharacterAction.CRAFT.RAT_ARMOUR, character, undefined)
//         }
//         let data = character.equip.data.backpack.armours
//         for (let index in data ) {
//             index = index as any
//             if (data[index]?.type == ARMOUR_TYPE.BODY) {
//                 let price = Math.floor(base_price_skin * RAT_SKIN_ARMOUR_SKIN_NEEDED * 1.5) as money
//                  AuctionManagement.sell(pool, character.world.entity_manager, character.world.socket_manager, character, "armour", index as any, price, price)
//             }
//         }
//     }
// }