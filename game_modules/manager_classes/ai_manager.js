"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiManager = void 0;
const craft_bone_spear_1 = require("../actions/actions_set_up/character_actions/craft_bone_spear");
const craft_rat_armour_1 = require("../actions/actions_set_up/character_actions/craft_rat_armour");
const racial_hostility_1 = require("../base_game_classes/character/races/racial_hostility");
const market_items_1 = require("../market/market_items");
const item_tags_1 = require("../static_data/item_tags");
const action_manager_1 = require("../actions/action_manager");
const materials_manager_1 = require("./materials_manager");
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
let dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
class AiManager {
    constructor(world) {
        this.world = world;
    }
    path_finding_calculations() {
    }
    move_toward_colony(char) {
    }
    enemies_in_cell(char) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined)
            return false;
        let a = cell.get_characters_set();
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id);
            if ((0, racial_hostility_1.hostile)(char.get_tag(), target_char.get_tag())) {
                if (!target_char.in_battle() && !target_char.is_dead()) {
                    return target_char.id;
                }
            }
        }
        return -1;
    }
    battles_in_cell(char) {
        let battles = [];
        const cell = Convert.character_to_cell(char)
        if (cell == undefined)
            return battles;
        let a = cell.get_characters_set();
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id);
            if (target_char.in_battle() && !target_char.is_dead()) {
                battles.push(target_char.get_battle_id());
            }
        }
        return battles;
    }
    random_steppe_walk(char) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) {
            return;
        }
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.i, d[1] + cell.j];
            let territory = this.world.get_territory(tmp[0], tmp[1]);
            let new_cell = this.world.get_cell(tmp[0], tmp[1]);
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] < 1)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            await this.world.action_manager.start_action(action_manager_1.CharacterAction.MOVE, char, { x: move_direction[0], y: move_direction[1] });
        }
    }
    check_battles_to_join(agent) {
        let battles = this.battles_in_cell(agent);
        for (let item of battles) {
            let battle = this.world.entity_manager.battles[item];
            console.log('check_battle');
            if (!(battle.ended)) {
                let team = battle.check_team_to_join(agent);
                console.log(team);
                if (team == 'no_interest')
                    continue;
                else {
                    battle.join(agent, team);
                    return true;
                }
            }
        }
        return false;
    }
    random_forest_walk(char) {
        const cell = Convert.character_to_cell(char)
        if (cell == undefined) {
            return;
        }
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.i, d[1] + cell.j];
            let territory = this.world.get_territory(tmp[0], tmp[1]);
            let new_cell = this.world.get_cell(tmp[0], tmp[1]);
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] > 0)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            await this.world.action_manager.start_action(action_manager_1.CharacterAction.MOVE, char, { x: move_direction[0], y: move_direction[1] });
        }
    }
    decision(char) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return;
        }
        if (char.in_battle()) {
            return;
        }
        if (char.action_started) {
            return;
        }
        let responce = this.check_battles_to_join(char);
        if (responce)
            return;
        switch (char.misc.ai_tag) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    let target = this.enemies_in_cell(char);
                    if (target != -1) {
                        await this.world.action_manager.start_action(action_manager_1.CharacterAction.ATTACK, char, target);
                    }
                    else {
                        await this.random_steppe_walk(char);
                    }
                }
                break;
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    await this.random_steppe_walk(char);
                }
                break;
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    await this.random_forest_walk(char);
                }
                break;
            }
        }
        if ((char.get_fatigue() > 90) || (char.get_stress() > 40)) {
            await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
            return;
        }
        if ((char.skills.cooking > 40) || (char.skills.perks.meat_master == true)) {
            await AI.cook_food(pool, this.world.action_manager, char);
        }
        if ((char.skills.woodwork > 40) || (char.skills.perks.fletcher == true)) {
            await AI.make_arrow(pool, this.world.action_manager, char);
        }
        if ((char.skills.clothier > 40) || (char.skills.perks.skin_armour_master == true)) {
            await AI.make_armour(pool, this.world.action_manager, char);
        }
    }
}
exports.AiManager = AiManager;
var AI;
(function (AI) {
    function cook_food(pool, action_manager, character) {
        let prepared_meat = character.trade_stash.get(materials_manager_1.FOOD) + character.stash.get(materials_manager_1.FOOD);
        let resource = character.stash.get(materials_manager_1.MEAT);
        let food_in_stash = character.stash.get(materials_manager_1.FOOD);
        let base_buy_price = 5;
        let base_sell_price = 10;
        let savings = character.savings.get();
        // console.log("AI tick")
        // console.log(prepared_meat, resource, food_in_stash, savings)
        // await character.world.entity_manager.remove_orders(pool, character)
        if ((resource < 5) && (savings > base_buy_price)) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.MEAT);
            // console.log(Math.floor(savings / base_buy_price), base_buy_price)
            await character.buy(pool, materials_manager_1.MEAT, Math.floor(savings / base_buy_price), base_buy_price);
        }
        if (prepared_meat < 10) {
            await action_manager.start_action(action_manager_1.CharacterAction.COOK_MEAT, character, undefined);
        }
        if (food_in_stash > 0) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.FOOD);
            await character.sell(pool, materials_manager_1.FOOD, food_in_stash, base_sell_price);
        }
    }
    AI.cook_food = cook_food;
    function make_arrow(pool, action_manager, character) {
        await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.WOOD);
        await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.RAT_BONE);
        let arrows = character.trade_stash.get(materials_manager_1.ARROW_BONE) + character.stash.get(materials_manager_1.ARROW_BONE);
        let wood = character.stash.get(materials_manager_1.WOOD);
        let bones = character.stash.get(materials_manager_1.RAT_BONE);
        let savings = character.savings.get();
        let trade_savings = character.trade_savings.get();
        let reserve_units = Math.min(wood, bones / 10);
        let arrows_in_stash = character.stash.get(materials_manager_1.ARROW_BONE);
        let base_price_wood = 5;
        let base_price_bones = 1;
        let input_price = (base_price_wood + 10 * base_price_bones);
        let profit = 0.5;
        let sell_price = Math.floor(input_price * (1 + profit) / (0, craft_bone_spear_1.craft_bone_arrow_probability)(character) / 10) + 1;
        // bones_to_buy * b_p + wood_to_buy * w_p = savings
        // (bones_to_buy + bones) - 10 (wood_to_buy + wood) = 0
        // so
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy       - wood_to_buy * 10             = -bones + 10 * wood
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy * b_p - wood_to_buy * 10 b_p         = (-bones + 10 * wood) * b_p
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy * (10 b_p + w_p) = (-bones + 10 * wood) * b_p - savings
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
        // bones_to_buy                                      = (savings - wood_to_buy * w_p) / b_p
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
        // makes sense only if results are not negative
        if (reserve_units < 5) {
            let savings = character.savings.get();
            let wood_to_buy = -((-bones + 10 * wood) * base_price_bones - savings) / (10 * base_price_bones + base_price_wood);
            let bones_to_buy = (savings - wood_to_buy * base_price_wood) / base_price_bones;
            // console.log(savings, bones, wood)
            // console.log(wood_to_buy, bones_to_buy)
            if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
                await character.buy(pool, materials_manager_1.WOOD, Math.floor(wood_to_buy), base_price_wood);
                await character.buy(pool, materials_manager_1.RAT_BONE, Math.floor(bones_to_buy), base_price_bones);
            }
            else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
                await character.buy(pool, materials_manager_1.WOOD, Math.floor(savings / base_price_wood), base_price_wood);
            }
            else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
                await character.buy(pool, materials_manager_1.RAT_BONE, Math.floor(savings / materials_manager_1.RAT_BONE), base_price_bones);
            }
        }
        if (arrows < 100) {
            await action_manager.start_action(action_manager_1.CharacterAction.CRAFT_BONE_ARROW, character, undefined);
        }
        if (arrows_in_stash > 0) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.ARROW_BONE);
            arrows_in_stash = character.stash.get(materials_manager_1.ARROW_BONE);
            await character.sell(pool, materials_manager_1.ARROW_BONE, arrows_in_stash, sell_price);
        }
    }
    AI.make_arrow = make_arrow;
    function make_armour(pool, action_manager, character) {
        let base_price_skin = 10;
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / base_price_skin);
        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, materials_manager_1.RAT_SKIN);
            await character.buy(pool, materials_manager_1.RAT_SKIN, skin_to_buy, base_price_skin);
        }
        if (resource > craft_rat_armour_1.RAT_SKIN_ARMOUR_SKIN_NEEDED) {
            await action_manager.start_action(action_manager_1.CharacterAction.CRAFT_RAT_ARMOUR, character, undefined);
        }
        let data = character.equip.data.backpack.armours;
        for (let index in data) {
            index = index;
            if (data[index]?.type == item_tags_1.ARMOUR_TYPE.BODY) {
                let price = Math.floor(base_price_skin * craft_rat_armour_1.RAT_SKIN_ARMOUR_SKIN_NEEDED * 1.5);
                await market_items_1.AuctionManagement.sell(pool, character.world.entity_manager, character.world.socket_manager, character, "armour", index, price, price);
            }
        }
    }
    AI.make_armour = make_armour;
})(AI || (AI = {}));
