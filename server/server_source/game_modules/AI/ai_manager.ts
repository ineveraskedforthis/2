import type { Character } from "../character/character"
import { hostile } from "../races/racial_hostility";
import { ActionManager, CharacterAction } from "../actions/action_manager";
import { ARROW_BONE, ELODINO_FLESH, FOOD, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { MapSystem } from "../map/system";
import { Cell } from "../map/cell";
import { AIhelper, base_price } from "./helpers";
import { Event } from "../events/events";
import { money } from "../types";
import { BulkOrders, ItemOrders } from "../market/system";
import { EventMarket } from "../events/market";
import { trim } from "../calculations/basic_functions";
import { Data } from "../data";
import { CraftBulk, crafts_bulk, craft_actions } from "../craft/crafts_storage";
import { Cooking } from "../craft/cooking";
import { AmmunitionCraft } from "../craft/ammunition";
import { CraftItem } from "../craft/items";


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


let dp = [[0, 1], [0 ,-1] ,[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]
function forest_constraints(cell: Cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] > 0)
} 
function steppe_constraints(cell: Cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] < 1)
}

export namespace CampaignAI {

    export function random_walk(char: Character, constraints: (cell: Cell) => boolean) {
        let cell = Convert.character_to_cell(char)
        let possible_moves = []
        for (let d of dp) {      
            let tmp: [number, number] = [d[0] + cell.x, d[1] + cell.y]
            // let territory = this.world.get_territory(tmp[0], tmp[1])
            let target = MapSystem.coordinate_to_cell(tmp)
            if (target != undefined) {
                if (MapSystem.can_move(tmp) && constraints(target)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            ActionManager.start_action(CharacterAction.MOVE, char, move_direction)  
        }   
    }

    export function decision(char: Character) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return
        }

        if (char.in_battle()) {
            return
        }

        if (char.action != undefined) {
            return
        }

        let responce = AIhelper.check_battles_to_join(char)
        if (responce) return;

        switch(char.archetype.ai_map) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    let target = AIhelper.enemies_in_cell(char)
                    const target_char = Convert.id_to_character(target)
                    if (target_char != undefined) {
                        Event.start_battle(char, target_char)
                    } else {
                        random_walk(char, steppe_constraints)
                    }
                }
                break
            }

            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, steppe_constraints)
                }
                break
            }

            case 'forest_walker': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, forest_constraints)
                }
                break
            }
        }

        if ((char.get_fatigue() > 60) || (char.get_stress() > 40)) {
            ActionManager.start_action(CharacterAction.REST, char, [0, 0])
            return
        }

        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AI.craft_bulk(char, Cooking.meat)
        }

        if ((char.skills.woodwork > 40) && (char.perks.fletcher == true)) {
            AI.craft_bulk(char, AmmunitionCraft.bone_arrow)
        }

        if ((char.perks.alchemist)) {
            AI.craft_bulk(char, Cooking.elodino)
        }

        if ((char.skills.woodwork > 40) && (char.perks.weapon_maker == true)) {
            AI.make_wooden_weapon(char, base_price(char, WOOD))
        }

        if ((char.skills.bone_carving > 40) && (char.perks.weapon_maker == true)) {
            AI.make_bone_weapon(char, base_price(char, RAT_BONE))
        }

        if ((char.skills.clothier > 40) && (char.perks.skin_armour_master == true)) {
            AI.make_armour(char, base_price(char, RAT_SKIN))
        }

        if ((char.skills.clothier > 40) && (char.perks.shoemaker == true)) {
            AI.make_boots(char, base_price(char, RAT_SKIN))
        }
    }
}

export namespace AI {
    export function craft_bulk(character: Character, craft: CraftBulk) {
        const buy = AIhelper.buy_craft_inputs(character, character.savings.get(), craft.input)
        const sell_prices = AIhelper.sell_prices_craft_bulk(character, craft)

        for (let item of sell_prices) {
            const current = character.stash.get(item.material)
            if (current == 0) continue

            BulkOrders.remove_by_condition(character, item.material)
            let total_amount = character.stash.get(item.material)
            EventMarket.sell(character, item.material, total_amount, item.price)
        }

        for (let item of buy) {
            BulkOrders.remove_by_condition(character, item.material)
            EventMarket.buy(character, item.material, item.amount, item.price)
        }

        ActionManager.start_action(craft_actions[craft.id], character, [0, 0])
    }

    export  function make_armour(character:Character, price_skin: money) {
        BulkOrders.remove_by_condition(character, RAT_SKIN)
        let resource = character.stash.get(RAT_SKIN)
        let savings = character.savings.get()

        let skin_to_buy = Math.floor(savings / price_skin)

        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_SKIN)
            EventMarket.buy(character, RAT_SKIN, trim(skin_to_buy, 0, 50), price_skin)
        }

        if (resource > 10) {
            const flags = check_if_set_is_ready(character)
            if (!flags.body) ActionManager.start_action(craft_actions[CraftItem.RatSkin.armour.id], character, [0, 0])
            else if (!flags.legs) ActionManager.start_action(craft_actions[CraftItem.RatSkin.pants.id], character, [0, 0])
            else if (!flags.foot) ActionManager.start_action(craft_actions[CraftItem.RatSkin.boots.id], character, [0, 0])
            else sell_armour_set(character, price_skin)
        }
    }

    function check_if_set_is_ready(character:Character) {
        let flags = {'legs': false, 'body': false, 'foot': false}

        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'body') {
                flags.body = true
            }
            if (item?.slot == 'legs') {
                flags.legs = true
            }
            if (item?.slot == 'foot') {
                flags.foot = true
            }
        }

        // console.log(flags)
        return flags
    }

    function sell_armour_set(character: Character, price_skin: money) {
        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'body') {
                let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.armour)
                EventMarket.sell_item(character, Number(index), price)
            }

            if (item?.slot == 'foot') {
                let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.boots)
                EventMarket.sell_item(character, Number(index), price)
            }

            if (item?.slot == 'legs') {
                let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.pants)
                EventMarket.sell_item(character, Number(index), price)
            }
        }
    }

    function sell_weapons(character: Character) {
        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'weapon') {
                const price_noise = Math.random() * 100
                let price = Math.floor(150 + price_noise) as money
                EventMarket.sell_item(character, Number(index), price)
            }
        }
    }

    export function make_wooden_weapon(character: Character, price_wood: money) {
        BulkOrders.remove_by_condition(character, WOOD)

        let savings = character.savings.get()
        let wood_to_buy = Math.floor(savings / price_wood)
        if (wood_to_buy > 5) {
            BulkOrders.remove_by_condition(character, WOOD)
            EventMarket.buy(character, WOOD, trim(wood_to_buy, 0, 50), price_wood)
        }

        let resource = character.stash.get(WOOD)
        if (resource > 20) {
            const dice = Math.random()
            if (dice < 0.5) ActionManager.start_action(craft_actions[CraftItem.Wood.spear.id], character, [0, 0])
            else if (dice < 0.8) ActionManager.start_action(craft_actions[CraftItem.Wood.mace.id], character, [0, 0])
            else ActionManager.start_action(craft_actions[CraftItem.Wood.bow.id], character, [0, 0])
        }

        sell_weapons(character)
    }


    export function make_bone_weapon(character: Character, bone_price: money) {
        BulkOrders.remove_by_condition(character, RAT_BONE)

        let savings = character.savings.get()
        let bones_to_buy = Math.floor(savings / bone_price)
        if (bones_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_BONE)
            EventMarket.buy(character, RAT_BONE, trim(bones_to_buy, 0, 50), bone_price)
        }

        let resource = character.stash.get(RAT_BONE)
        if (resource > 20) {
            const dice = Math.random()
            if (dice < 1) ActionManager.start_action(craft_actions[CraftItem.Bone.dagger.id], character, [0, 0])
        }

        sell_weapons(character)
    }

    export function make_boots(character: Character, skin_price: money) {
        BulkOrders.remove_by_condition(character, RAT_SKIN)

        let savings = character.savings.get()
        let skin_to_buy = Math.floor(savings / skin_price)
        if (skin_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_SKIN)
            EventMarket.buy(character, RAT_SKIN, trim(skin_to_buy, 0, 50), skin_price)
        }

        let resource = character.stash.get(RAT_SKIN)
        if (resource > 10) {
            const dice = Math.random()
            if (dice < 1) ActionManager.start_action(craft_actions[CraftItem.RatSkin.boots.id], character, [0, 0])
        }

        sell_armour_set(character, skin_price)
    }
}