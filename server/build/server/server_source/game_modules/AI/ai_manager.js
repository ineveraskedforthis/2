"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = exports.CampaignAI = void 0;
const action_manager_1 = require("../actions/action_manager");
const action_types_1 = require("../action_types");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const system_1 = require("../map/system");
const helpers_1 = require("./helpers");
const events_1 = require("../events/events");
const system_2 = require("../market/system");
const market_1 = require("../events/market");
const basic_functions_1 = require("../calculations/basic_functions");
const crafts_storage_1 = require("../craft/crafts_storage");
const cooking_1 = require("../craft/cooking");
const ammunition_1 = require("../craft/ammunition");
const items_1 = require("../craft/items");
const constraints_1 = require("./constraints");
const rat_hunt_1 = require("./rat_hunt");
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
var CampaignAI;
(function (CampaignAI) {
    function random_walk(char, constraints) {
        let cell = systems_communication_1.Convert.character_to_cell(char);
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.x, d[1] + cell.y];
            // let territory = this.world.get_territory(tmp[0], tmp[1])
            let target = system_1.MapSystem.coordinate_to_cell(tmp);
            if (target != undefined) {
                if (system_1.MapSystem.can_move(tmp) && constraints(target)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, char, move_direction);
        }
    }
    CampaignAI.random_walk = random_walk;
    function rat_walk(character, constraints) {
        let cell = systems_communication_1.Convert.character_to_cell(character);
        let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => { return { item: x, weight: (0, basic_functions_1.trim)(x.rat_scent, 0, 20) }; });
        let target = (0, basic_functions_1.select_weighted)(potential_moves, constraints);
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
    }
    CampaignAI.rat_walk = rat_walk;
    function market_walk(character) {
        let cell = systems_communication_1.Convert.character_to_cell(character);
        let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => {
            return { item: x, weight: x.market_scent };
        });
        let target = (0, basic_functions_1.select_max)(potential_moves, constraints_1.simple_constraints);
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target?.x, target?.y]);
    }
    CampaignAI.market_walk = market_walk;
    function rat_go_home(character, constraints) {
        let cell = systems_communication_1.Convert.character_to_cell(character);
        let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => { return { item: x, weight: x.rat_scent }; });
        let target = (0, basic_functions_1.select_max)(potential_moves, constraints);
        if (target != undefined)
            if (cell.rat_scent > target.rat_scent) {
                action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, character, [cell.x, cell.y]);
            }
            else {
                action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
            }
    }
    CampaignAI.rat_go_home = rat_go_home;
    function rat_decision(char) {
        if ((char.get_fatigue() > 70) || (char.get_stress() > 30)) {
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
            return;
        }
        else if (char.get_fatigue() > 30) {
            rat_go_home(char, constraints_1.steppe_constraints);
            return;
        }
        let target = helpers_1.AIhelper.enemies_in_cell(char);
        const target_char = systems_communication_1.Convert.id_to_character(target);
        if (target_char != undefined) {
            events_1.Event.start_battle(char, target_char);
        }
        else {
            rat_walk(char, constraints_1.steppe_constraints);
            return;
        }
    }
    function decision(char) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return;
        }
        if (char.in_battle()) {
            return;
        }
        if (char.action != undefined) {
            return;
        }
        let responce = helpers_1.AIhelper.check_battles_to_join(char);
        if (responce)
            return;
        if (char.race() == 'rat') {
            rat_decision(char);
            return;
        }
        if (char.archetype.ai_map == 'rat_hunter') {
            (0, rat_hunt_1.RatHunter)(char);
            return;
        }
        movement_rest_decision(char);
        if ((char.get_fatigue() > 60) || (char.get_stress() > 40)) {
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
            console.log(char.name, ': i am stressed');
            return;
        }
        decide_craft(char);
    }
    CampaignAI.decision = decision;
    function decide_craft(char) {
        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AI.craft_bulk(char, cooking_1.Cooking.meat);
        }
        if ((char.skills.woodwork > 40) && (char.perks.fletcher == true)) {
            AI.craft_bulk(char, ammunition_1.AmmunitionCraft.bone_arrow);
        }
        if ((char.perks.alchemist)) {
            AI.craft_bulk(char, cooking_1.Cooking.elodino);
        }
        if ((char.skills.woodwork > 40) && (char.perks.weapon_maker == true)) {
            AI.make_wooden_weapon(char, (0, helpers_1.base_price)(char, materials_manager_1.WOOD));
        }
        if ((char.skills.bone_carving > 40) && (char.perks.weapon_maker == true)) {
            AI.make_bone_weapon(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_BONE));
        }
        if ((char.skills.clothier > 40) && (char.perks.skin_armour_master == true)) {
            AI.make_armour(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_SKIN));
        }
        if ((char.skills.clothier > 40) && (char.perks.shoemaker == true)) {
            AI.make_boots(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_SKIN));
        }
    }
    function movement_rest_decision(char) {
        switch (char.archetype.ai_map) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 70) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    let target = helpers_1.AIhelper.enemies_in_cell(char);
                    const target_char = systems_communication_1.Convert.id_to_character(target);
                    if (target_char != undefined) {
                        events_1.Event.start_battle(char, target_char);
                    }
                    else {
                        random_walk(char, constraints_1.steppe_constraints);
                    }
                }
                break;
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    random_walk(char, constraints_1.steppe_constraints);
                }
                break;
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    random_walk(char, constraints_1.forest_constraints);
                }
                break;
            }
        }
    }
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
var AI;
(function (AI) {
    function craft_bulk(character, craft) {
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, character.savings.get(), craft.input);
        const sell_prices = helpers_1.AIhelper.sell_prices_craft_bulk(character, craft);
        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;
            system_2.BulkOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            market_1.EventMarket.sell(character, item.material, total_amount, item.price);
        }
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_2.BulkOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
        action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[craft.id], character, [0, 0]);
    }
    AI.craft_bulk = craft_bulk;
    function make_armour(character, price_skin) {
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / price_skin);
        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_SKIN, (0, basic_functions_1.trim)(skin_to_buy, 0, 50), price_skin);
        }
        if (resource > 10) {
            const flags = check_if_set_is_ready(character);
            if (!flags.body)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.armour.id], character, [0, 0]);
            else if (!flags.legs)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.pants.id], character, [0, 0]);
            else if (!flags.foot)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.boots.id], character, [0, 0]);
            else
                sell_armour_set(character, price_skin);
        }
    }
    AI.make_armour = make_armour;
    function check_if_set_is_ready(character) {
        let flags = { 'legs': false, 'body': false, 'foot': false };
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'body') {
                flags.body = true;
            }
            if (item?.slot == 'legs') {
                flags.legs = true;
            }
            if (item?.slot == 'foot') {
                flags.foot = true;
            }
        }
        // console.log(flags)
        return flags;
    }
    function sell_armour_set(character, price_skin) {
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'body') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.armour);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
            if (item?.slot == 'foot') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.boots);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
            if (item?.slot == 'legs') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.pants);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    function sell_weapons(character) {
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'weapon') {
                const price_noise = Math.random() * 100;
                let price = Math.floor(150 + price_noise);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    function make_wooden_weapon(character, price_wood) {
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.WOOD);
        let savings = character.savings.get();
        let wood_to_buy = Math.floor(savings / price_wood);
        if (wood_to_buy > 5) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.WOOD);
            market_1.EventMarket.buy(character, materials_manager_1.WOOD, (0, basic_functions_1.trim)(wood_to_buy, 0, 50), price_wood);
        }
        let resource = character.stash.get(materials_manager_1.WOOD);
        if (resource > 20) {
            const dice = Math.random();
            if (dice < 0.5)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.spear.id], character, [0, 0]);
            else if (dice < 0.8)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.mace.id], character, [0, 0]);
            else
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.bow.id], character, [0, 0]);
        }
        sell_weapons(character);
    }
    AI.make_wooden_weapon = make_wooden_weapon;
    function make_bone_weapon(character, bone_price) {
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_BONE);
        let savings = character.savings.get();
        let bones_to_buy = Math.floor(savings / bone_price);
        if (bones_to_buy > 5) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_BONE);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_BONE, (0, basic_functions_1.trim)(bones_to_buy, 0, 50), bone_price);
        }
        let resource = character.stash.get(materials_manager_1.RAT_BONE);
        if (resource > 20) {
            const dice = Math.random();
            if (dice < 1)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Bone.dagger.id], character, [0, 0]);
        }
        sell_weapons(character);
    }
    AI.make_bone_weapon = make_bone_weapon;
    function make_boots(character, skin_price) {
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / skin_price);
        if (skin_to_buy > 5) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_SKIN, (0, basic_functions_1.trim)(skin_to_buy, 0, 50), skin_price);
        }
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        if (resource > 10) {
            const dice = Math.random();
            if (dice < 1)
                action_manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.boots.id], character, [0, 0]);
        }
        sell_armour_set(character, skin_price);
    }
    AI.make_boots = make_boots;
})(AI = exports.AI || (exports.AI = {}));
