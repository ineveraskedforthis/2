import { CellDisplay, CharacterStatsResponse } from "@custom_types/responses";
import { Attack } from "../../attack/system";
import { Accuracy } from "../../battle/battle_calcs";
import { CharactersHeap } from "../../battle/classes/heap";
import { BattleSystem } from "../../battle/system";
import { get_crafts_bulk_list } from "../../craft/crafts_storage";
import { get_crafts_item_list } from "../../craft/crafts_storage";
import { DmgOps } from "../../damage_types";
import { Extract } from "../../data-extraction/extract-data";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { MapSystem } from "../../map/system";
import { terrain_to_string } from "../../map/terrain";
import { CharacterValues } from "../../scripted-values/character";
import { BATTLE_CURRENT_UNIT, BATTLE_DATA_MESSAGE, character_id_MESSAGE } from "../../static_data/constants";
import { Convert } from "../../systems_communication";
import { prepare_market_orders } from "../helper_functions";
import { User } from "../user";
import { Alerts } from "./alerts";
import { CraftValues } from "../../scripted-values/craft";
import { SKILL, SkillConfiguration, SkillStorage } from "@content/content";


export namespace SendUpdate {
    export function all(user: User) {
        status(user)
        belongings(user)
        all_skills(user)
        all_craft(user)
        map_related(user)
        battle(user)
        market(user)
        stats(user)
        race_model(user)

    }

    export function race_model(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'model', character.model)
    }

    export function stats(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const stats: CharacterStatsResponse = {
            phys_power: CharacterValues.phys_power(character),
            magic_power: CharacterValues.magic_power(character),
            enchant_rating: CharacterValues.enchant_rating(character),
            movement_cost: CharacterValues.movement_cost_battle(character),
            move_duration_map: CharacterValues.movement_duration_map(character),
            base_damage_magic_bolt: Attack.magic_bolt_base_damage(character, false),
            base_damage_magic_bolt_charged: Attack.magic_bolt_base_damage(character, true),
        }

        Alerts.generic_user_alert(user, 'stats', stats);
    }

    export function battle(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const battle_id = character.battle_id
        if (battle_id != undefined) {
            // console.log('!!!')
            const battle = Data.Battles.from_id(battle_id);
            Alerts.battle_progress(user, true)
            Alerts.generic_user_alert(user, BATTLE_DATA_MESSAGE, BattleSystem.data(battle));
            Alerts.generic_user_alert(user, BATTLE_CURRENT_UNIT, CharactersHeap.get_selected_unit(battle)?.id);
            Alerts.generic_user_alert(user, character_id_MESSAGE, character.id)
        } else {
            Alerts.battle_progress(user, false)
        }
    }

    export function savings(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_savings_c', character.savings.get())
        Alerts.generic_user_alert(user, 'val_savings_trade_c', character.trade_savings.get())
    }

    export function status(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        const status = character.status

        Alerts.generic_user_alert(user, 'val_hp_c', status.hp);
        Alerts.generic_user_alert(user, 'val_rage_c', status.rage);
        Alerts.generic_user_alert(user, 'val_fatigue_c', status.fatigue);
        Alerts.generic_user_alert(user, 'val_stress_c', status.stress);
        Alerts.generic_user_alert(user, 'val_blood_c', status.blood);
        Alerts.generic_user_alert(user, 'val_hp_m', character.get_max_hp());
    }

    export function stash(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'stash-update', character.stash.data)
    }

    export function equip(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'equip-update', Extract.EquipData(character.equip))
        attack_damage(user)
    }

    export function skill(user: User, skill: SKILL) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        const current_skill = CharacterValues.skill(character, skill)
        const pure_skill = CharacterValues.pure_skill(character, skill)

        Alerts.skill(user, skill, pure_skill, current_skill)
    }

    export function skills(user: User, skills: SKILL[]) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (let skill of skills) {
            const current_skill = CharacterValues.skill(character, skill)
            const pure_skill = CharacterValues.pure_skill(character, skill)
            Alerts.skill(user, skill, pure_skill, current_skill)
        }
    }

    export function skill_clothier(user: User) {
        skill(user, SKILL.CLOTHIER)
    }

    export function skill_cooking(user: User) {
        skill(user, SKILL.COOKING)
    }

    export function skill_woodwork(user: User) {
        skill(user, SKILL.WOODWORKING)
    }

    export function skill_skinning(user: User) {
        skill(user, SKILL.SKINNING)
    }

    export function skill_defence(user: User) {
        skills(user, [SKILL.EVASION, SKILL.BLOCKING])
    }

    export function all_skills(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        skills(user, SkillConfiguration.SKILL)
        cell_probability(user)
        Alerts.perks(user, character)
    }

    export function all_craft(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (let item of get_crafts_bulk_list(character)) {
            Alerts.craft_bulk_complete(user, item.id, item)
        }

        for (let item of get_crafts_item_list(character)) {
            Alerts.craft_item_complete(user, item.id, item)
        }

        for (let item of get_crafts_bulk_list(character)) {
            Alerts.craft_bulk(user, item.id, CraftValues.output_bulk(character, item))
        }

        for (let item of get_crafts_item_list(character)) {
            Alerts.craft_item(user, item.id, CraftValues.durability(character, item))
        }
    }

    export function ranged(user: User, distance: number) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        if (isNaN(distance)) {
            return
        }

        Alerts.battle_action_chance(user, 'shoot', Accuracy.ranged(character, distance))
    }

    export function hp(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_hp_c', character.status.hp)
        Alerts.generic_user_alert(user, 'val_hp_m', character.get_max_hp())
    }
    export function blood(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_hp_c', character.status.hp)
    }
    export function fatigue(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_fatigue_c', character.status.fatigue)
    }
    export function stress(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_stress_c', character.status.stress)
    }
    export function rage(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'val_rage_c', character.status.rage)
    }

    export function market(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        const bulk_data = prepare_market_orders(character.cell_id)
        const items_data = Convert.cell_id_to_item_orders_socket(character.cell_id)
        Alerts.item_market_data(user, items_data)
        Alerts.market_data(user, bulk_data)
    }

    export function explored(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return;

        Alerts.generic_user_alert(user, 'explore', character.explored);
        map_position(user, true);

        Data.Cells.for_each(cell => {
            if (character == undefined) return;
            const exploration_status = character.explored[cell.id]
            if ((exploration_status != undefined) && exploration_status) {
                let x = cell.x
                let y = cell.y
                let terrain = Data.World.id_to_terrain(cell.id);
                let forestation = MapSystem.forestation(cell.id);
                let urbanisation = MapSystem.urbanisation(cell.id);

                // console.log(forestation)

                // let res1: {[_ in string]: CellDisplayData} = {}

                const display_data: CellDisplay = {
                    terrain: terrain_to_string(terrain),
                    forestation: forestation,
                    urbanisation: urbanisation,
                    rat_lair: MapSystem.rat_lair(cell.id)
                }


                let res2 = {x: x, y: y, ter: display_data}
                Alerts.generic_user_alert(user, 'map-data-display', res2)
            }
        });
    }

    export function map_position(user: User, teleport_flag:boolean) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        let cell = Convert.character_to_cell(character)
        let data = {
            x:cell.x,
            y:cell.y,
            teleport_flag:teleport_flag
        }
        Alerts.generic_user_alert(user, 'map-pos', data)
        location(user)
    }

    export function location(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'val_location_id_c', character.location_id)
    }

    export function map_position_move(user: User) {
        map_position(user, false);
        location(user);
        local_characters(user);
    }

    export function local_characters(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        let characters = DataID.Location.guest_list(character.location_id).map(Convert.character_id_to_character_view)
        Alerts.generic_user_alert(user, 'cell-characters', characters)
    }

    export function local_actions(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        const cell = Convert.character_to_cell(character)
        // Alerts.map_action(user, 'fish'          , cell.can_fish())
        // Alerts.map_action(user, 'hunt'          , cell.can_hunt())
        // Alerts.map_action(user, 'clean'         , cell.can_clean())
        // Alerts.map_action(user, 'gather_wood'   , cell.can_gather_wood())
        // Alerts.map_action(user, 'gather_cotton' , cell.can_gather_cotton())
    }

    export function map_related(user: User) {
        local_actions(user)
        local_characters(user)
        explored(user)
        location(user)
    }

    export function belongings(user: User) {
        stash(user)
        savings(user)
        equip(user)
    }

    export function attack_damage(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        let blunt  = DmgOps.total(Attack.generate_melee(character, 'blunt' ).damage)
        let slice  = DmgOps.total(Attack.generate_melee(character, 'slice' ).damage)
        let pierce = DmgOps.total(Attack.generate_melee(character, 'pierce').damage)

        Alerts.battle_action_damage(user, 'attack_blunt', blunt)
        Alerts.battle_action_damage(user, 'attack_slice', slice)
        Alerts.battle_action_damage(user, 'attack_pierce', pierce)

        let ranged = DmgOps.total(Attack.generate_ranged(character).damage)
        Alerts.battle_action_damage(user, 'shoot', ranged)
    }

    export function cell_probability(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
    }

    export function update_player_actions_availability() {
            // send_skills_info(character: Character) {
    //


    //
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    //     this.send_perk_related_skills_update(character)
    // }

    //     send_perk_related_skills_update(character: Character) {
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})

    //     this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
    // }
    }
}


    // update_market_info(market: Cell) {
    //     let response = this.prepare_market_orders(market)

    //     for (let i of this.sockets) {
    //         if (i.current_user != null) {
    //             let char = i.current_user.character;
    //             try {
    //                 let cell1 = char.get_cell();
    //                 if (i.online & i.market_data && (cell1.id==market.id)) {
    //                     i.socket.emit('market-data', response);
    //                 }
    //             } catch(error) {
    //             }
    //         }
    //     }
    // }





