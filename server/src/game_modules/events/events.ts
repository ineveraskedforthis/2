import { EQUIP_SLOT, EquipSlotConfiguration, MATERIAL, MATERIAL_CATEGORY, MaterialStorage, PERK, PerkStorage, SKILL, SkillStorage } from "@content/content";
import { melee_attack_type } from "@custom_types/common";
import { cell_id, location_id } from "@custom_types/ids";
import { handle_attack_reputation_change } from "../SYSTEM_REPUTATION";
import { AttackObj } from "../attack/class";
import { Attack } from "../attack/system";
import { Accuracy } from "../battle/battle_calcs";
import { trim } from "../calculations/basic_functions";
import { perk_requirement } from "../character/perk_requirement";
import { CharacterSystem } from "../character/system";
import { UI_Part, Update } from "../client_communication/causality_graph";
import { Alerts } from "../client_communication/network_actions/alerts";
import { UserManagement } from "../client_communication/user_manager";
import { on_craft_update } from "../craft/helpers";
import { DmgOps } from "../damage_types";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";
import { Character } from "../data/entities/character";
import { CHANGE_REASON, Effect } from "../effects/effects";
import { MapSystem } from "../map/system";
import { perk_price } from "../prices/perk_base_price";
import { Loot } from "../races/generate_loot";
import { CharacterValues } from "../scripted-values/character";
import { EquipmentValues } from "../scripted-values/equipment-values";
import { Convert, Link, Unlink } from "../systems_communication";
import { CharacterTemplate, ModelVariant } from "../types";
import { EventInventory } from "./inventory_events";
import { EventMarket } from "./market";
import { Trigger } from "./triggers";
import { SendUpdate } from "../client_communication/network_actions/updates";

const GRAVEYARD_CELL = 0 as cell_id

export namespace Event {

    export function buy_perk(student: Character, perk: PERK, teacher: Character) {
        let savings = student.savings.get()
        let price = perk_price(perk, student, teacher)

        if (savings < price) {
            Alerts.not_enough_to_character(student, 'money', savings, price, undefined)
            return
        }


        let response = perk_requirement(perk)
        let flag_allowed = true
        for (const perk_check of response.perks) {
            if (CharacterValues.perk(student, perk_check) == 0) {
                Alerts.alert(student, `You need perk ${PerkStorage.get(perk_check).name} to learn ${PerkStorage.get(perk).name}`)
                flag_allowed = false
            }
        }
        for (const skill_check of response.skills) {
            if (CharacterValues.skill(student, skill_check.skill) < skill_check.difficulty) {
                Alerts.alert(student, `You need perk ${SkillStorage.get(skill_check.skill).name} to learn ${PerkStorage.get(perk).name}`)
                flag_allowed = false
            }
        }

        if (!flag_allowed) return;

        Effect.Transfer.savings(student, teacher, price, CHANGE_REASON.EDUCATION)
        Effect.learn_perk(student, perk)
    }

    export function buy_skill(student: Character, skill: SKILL, teacher: Character) {
        let response = Trigger.can_learn_from(student, teacher, skill)
        if (response.response == 'ok') {
            Effect.Transfer.savings(student, teacher, response.price, CHANGE_REASON.EDUCATION)
            Effect.Change.skill(student, skill, 1, CHANGE_REASON.EDUCATION)
        } else {
            Alerts.not_enough_to_character(
                student,
                response.response,
                response.current_quantity,
                response.min_quantity,
                response.max_quantity
            )
        }
    }

    export function move(character: Character, new_location: location_id) {
        const old_cell_id = character.cell_id
        Link.character_and_location(character.id, new_location)

        move_fatigue_change(character)
        let probability = move_durability_roll_probability(old_cell_id)
        move_durability_roll(character, probability)

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.MAP)

        let user = Convert.character_to_user(character)
        if (user == undefined) return

        let new_cell = Data.Cells.from_id(DataID.Location.cell_id(new_location))
        Alerts.log_to_user(user, 'rat scent ' + new_cell.rat_scent)
        Alerts.log_to_user(user, 'cell_id ' + new_cell.id)
    }

    export function move_durability_roll_probability(cell: cell_id) {
        let probability = 0.5
        let urbanisation = MapSystem.urbanisation(cell)
        let forestation = MapSystem.forestation(cell)
        if (forestation > 100) probability += 0.1
        if (forestation > 300) probability += 0.1
        if (urbanisation > 4) probability -= 0.2
        if (urbanisation > 0) probability -= 0.1

        return probability
    }

    export function move_fatigue_change(character: Character) {
        const boots = EquipmentValues.item(character.equip, EQUIP_SLOT.BOOTS)
        if (boots == undefined) {
            Effect.Change.fatigue(character, 3, CHANGE_REASON.TRAVEL)
        } else {
            const durability = boots.durability
            Effect.Change.fatigue(character, Math.round(trim(3 - 2 * (durability / 100), 1, 3)), CHANGE_REASON.TRAVEL)
        }
    }

    export function move_durability_roll(character: Character, probability: number){
        const dice = Math.random()
        if (dice < probability) {
            Effect.change_durability(character, EQUIP_SLOT.BOOTS, -1)
            let skill_dice = Math.random()
            if (skill_dice * skill_dice * skill_dice > CharacterValues.skill(character, SKILL.TRAVELLING) / 100) {
                Effect.Change.skill(character, SKILL.TRAVELLING, 1, CHANGE_REASON.TRAVEL)
            }
        }
    }

    export function new_character(template:CharacterTemplate, name: string|undefined, starting_location: location_id, model: ModelVariant|undefined) {
        let character = CharacterSystem.template_to_character(template, name, starting_location)
        if (model == undefined) model = {chin: 0, mouth: 0, eyes: 0}
        character.set_model_variation(model)
        Link.send_local_characters_info(starting_location)
        Data.Characters.save()
        return character
    }

    function ranged_dodge(attack: AttackObj, defender: Character, flag_dodge: boolean) {
        // evasion helps against arrows better than in melee
        // 100 evasion - 2 * attack skill = 100% of arrows are missing
        // evaded attack does not rise skill of attacker
        // dodge is an active evasion
        // it gives base 10% of arrows missing
        // and you rise your evasion if you are attacked
        const attack_skill = 2 * attack.attack_skill
        const evasion = CharacterValues.skill(defender, SKILL.EVASION)

        let evasion_chance = evasion / (100 + attack_skill)
        if (flag_dodge) evasion_chance = evasion_chance + 0.1

        const evasion_roll = Math.random()
        if (evasion_roll < evasion_chance) {
            attack.flags.miss = true
            return 'miss'
        }

        if (flag_dodge) {
            Effect.roll_skill_improvement(defender, SKILL.EVASION, 100 - evasion_chance * 100, CHANGE_REASON.DODGE)
        }
    }

    export function shoot(attacker: Character, defender: Character, distance: number, flag_dodge: boolean): 'ok'|'no_ammo'|'miss' {
        // sanity checks
        if (defender.get_hp() == 0) return 'miss'
        if (attacker.get_hp() == 0) return 'miss'
        if (attacker.stash.get(attacker.equip.data.selected_ammo) < 1) {Alerts.not_enough_to_character(attacker, 'arrow', 0, 1, undefined); return 'no_ammo'}

        //remove arrow
        change_stash(attacker, attacker.equip.data.selected_ammo, -1)

        //check missed attack because of lack of skill
        const acc = Accuracy.ranged(attacker, distance)
        const dice_accuracy = Math.random()
        const attacker_ranged_skill = CharacterValues.skill(attacker, SKILL.RANGED)
        if (dice_accuracy > acc) {
            Effect.roll_skill_improvement(attacker, SKILL.RANGED, 100 - 50 * acc, CHANGE_REASON.SHOOTING)
            return 'miss'
        }

        Effect.roll_skill_improvement(attacker, SKILL.RANGED, 100, CHANGE_REASON.SHOOTING)

        // create attack
        const attack = Attack.generate_ranged(attacker)

        // durability changes weapon
        const roll_weapon = Math.random()
        if (roll_weapon < 0.2) {
            Effect.change_durability(attacker, EQUIP_SLOT.WEAPON, -1)
        }

        const response = ranged_dodge(attack, defender, flag_dodge)

        if (response == 'miss') {
            DmgOps.mult_ip(attack.damage, 0)
        } else {
            attack_affect_durability(attacker, defender, attack)
        }

        //apply status to attack
        attack.attacker_status_change.fatigue += 5
        attack.defender_status_change.fatigue += 5
        attack.defender_status_change.stress += 3

        attack.defence_skill += CharacterValues.skill(defender, SKILL.EVASION)
        deal_damage(defender, attack, attacker, false, CHANGE_REASON.RANGED_ATTACK)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }

        return 'ok'
    }

    export function unconditional_magic_bolt(attacker: Character, defender: Character, dist: number, flag_dodge: boolean, flag_charged: boolean) {

        Effect.roll_skill_improvement(attacker, SKILL.MAGIC, 30, CHANGE_REASON.MAGIC_APPLICATION)
        Effect.roll_skill_improvement(attacker, SKILL.BATTLE_MAGIC, 70, CHANGE_REASON.MAGIC_APPLICATION)

        const attack = Attack.generate_magic_bolt(attacker, dist, flag_charged)
        attack.defender_status_change.stress += 5
        deal_damage(defender, attack, attacker, false, CHANGE_REASON.MAGIC_BOLT);
        if (defender.dead()) {
            kill(attacker, defender)
        }
        return 'ok'
    }

    export function magic_bolt_mage(attacker: Character, defender: Character, dist: number, flag_dodge: boolean) {
        if (defender.dead()) return 'miss'
        if (attacker.dead()) return 'miss'
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, false)
    }

    export function magic_bolt_zaz(attacker: Character, defender: Character, dist: number, flag_dodge: boolean) {
        if (defender.dead()) return 'miss'
        if (attacker.dead()) return 'miss'
        if (attacker.stash.get(MATERIAL.ZAZ) == 0) return
        Event.change_stash(attacker, MATERIAL.ZAZ, -1)
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, true)
    }

    export function magic_bolt_blood(attacker: Character, defender: Character, dist: number, flag_dodge: boolean) {
        if (defender.dead()) return 'miss'
        if (attacker.dead()) return 'miss'
        const BLOOD_COST = 10
        if (attacker.status.blood >= BLOOD_COST) {
            Effect.Change.blood(attacker, -BLOOD_COST, CHANGE_REASON.MAGIC_APPLICATION)
        } else{
            const blood = attacker.status.blood;
            const hp = attacker.status.hp;
            if (blood + hp > BLOOD_COST) {
                attacker.status.blood = 0
                Effect.Change.blood(attacker, -attacker.status.blood, CHANGE_REASON.MAGIC_APPLICATION)
                Effect.Change.hp(attacker, BLOOD_COST - blood, CHANGE_REASON.MAGIC_APPLICATION)
            }
        }
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, true)
    }

    function deal_damage(defender: Character, attack: AttackObj, attacker: Character, AOE_flag: boolean, reason: CHANGE_REASON) {
        const total = CharacterSystem.damage(defender, attack.damage, reason);
        Effect.Change.status(defender, attack.defender_status_change, reason);
        Effect.Change.status(attacker, attack.attacker_status_change, reason);

        const resistance = CharacterValues.resistance(defender)

        Alerts.log_attack(defender, attack, resistance, total, 'defender')
        Alerts.log_attack(attacker, attack, resistance, total, 'attacker')

        handle_attack_reputation_change(attacker, defender, AOE_flag)

        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS);
        UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.STATUS);
    }

    export function attack(attacker: Character, defender: Character, dodge_flag: boolean, attack_type: melee_attack_type, AOE_flag:boolean) {
        if (attacker.dead()) return
        if (defender.dead()) return
        const attack = Attack.generate_melee(attacker, attack_type)
        // console.log(attack)

        //status changes for melee attack
        attack.attacker_status_change.rage += 5
        attack.attacker_status_change.fatigue += 5
        attack.defender_status_change.rage += 3
        attack.defender_status_change.stress += 1


        //calculating defense skill
        evade(defender, attack, dodge_flag);
        block(defender, attack);
        parry(defender, attack);

        //calculating improvement to skill
        attack_skill_improvement(attacker, defender, attack);

        //breaking items
        attack_affect_durability(attacker, defender, attack);

        //applying defense and attack skill
        let damage_modifier = (100 + attack.attack_skill) / (100 + attack.defence_skill)
        DmgOps.mult_ip(attack.damage, damage_modifier)

        // console.log('attack after modification')
        // console.log(attack)

        //apply damage and status effect after all modifiers
        deal_damage(defender, attack, attacker, AOE_flag, CHANGE_REASON.ATTACK)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }
    }

    function attack_affect_durability(attacker: Character, defender: Character, attack: AttackObj) {
        if (!attack.flags.miss) {
            const durability_roll = Math.random();
            if (durability_roll < 0.5)
                Effect.change_durability(attacker, EQUIP_SLOT.WEAPON, -1);
            if (attack.flags.blocked) {
                Effect.change_durability(defender, EQUIP_SLOT.WEAPON, -1);
            } else {
                for (let k of EquipSlotConfiguration.SLOT) {
                    if (Math.random() > 0.5) {
                        Effect.change_durability(defender, k, -1)
                    }
                }
            }
        }
    }

    function attack_skill_improvement(attacker: Character, defender: Character, attack: AttackObj) {
        // if attacker skill is lower than total defence skill of attack, then attacker can improve
        for (const attack_skill of attack.related_skills) {
            if (attack.attack_skill < attack.defence_skill) {
                const improvement_rate = (100 + attack.defence_skill) / (100 + attack.attack_skill)
                if (improvement_rate > 1) {
                    Effect.Change.skill(attacker, attack_skill, Math.floor(improvement_rate), CHANGE_REASON.ATTACK)
                } else {
                    const dice = Math.random();
                    if (dice < improvement_rate)
                        Effect.Change.skill(attacker, attack_skill, 1, CHANGE_REASON.ATTACK);
                }
            }
        }

        //fighting provides constant growth of this skill up to some level
        //for defender
        for (const fighting_skill of CharacterValues.equiped_weapon_required_skill(defender)) {
            Effect.roll_skill_improvement(defender, fighting_skill, 30, CHANGE_REASON.FIGHTING)
        }
        //for attacker
        for (const fighting_skill of CharacterValues.equiped_weapon_required_skill(attacker)) {
            Effect.roll_skill_improvement(attacker, fighting_skill, 30, CHANGE_REASON.FIGHTING)
        }

        Effect.roll_skill_improvement(defender, SKILL.FIGHTING, attack.attack_skill, CHANGE_REASON.FIGHTING)
        Effect.roll_skill_improvement(attacker, SKILL.FIGHTING, attack.defence_skill, CHANGE_REASON.FIGHTING)
    }

    function parry(defender: Character, attack: AttackObj) {
        const weapon = CharacterValues.equiped_weapon_required_skill(defender);
        const skill = CharacterValues.attack_skill(defender) + Math.round(Math.random() * 5);
        attack.defence_skill += skill;

        attack.defence_skill += CharacterValues.skill(defender, SKILL.FIGHTING)
        Effect.roll_skill_improvement(defender, SKILL.FIGHTING, attack.attack_skill, CHANGE_REASON.FIGHTING)

        // roll parry
        const parry_dice = Math.random()
        if ((parry_dice * skill > attack.attack_skill)) {
            attack.defence_skill += 40
            attack.flags.blocked = true;
        }

        //fighting provides constant growth of this skill up to some level
        for (const weapon_skill of weapon) {
            if (skill < attack.attack_skill) {
                Effect.Change.skill(defender, weapon_skill, 1, CHANGE_REASON.FIGHTING);
            }

            const dice = Math.random();
            if ((dice < 0.1) && (skill <= 10)) {
                Effect.Change.skill(defender, weapon_skill, 1, CHANGE_REASON.FIGHTING);
            }
        }
    }

    function block(defender: Character, attack: AttackObj) {
        const skill = CharacterValues.skill(defender, SKILL.BLOCKING) + Math.round(Math.random() * 10);
        attack.defence_skill += skill;

        // roll block
        const block_dice = Math.random()
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.blocked = true
        }

        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            Effect.Change.skill(defender, SKILL.BLOCKING, 1, CHANGE_REASON.FIGHTING);
        }

        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 20)) {
            Effect.Change.skill(defender, SKILL.BLOCKING, 1, CHANGE_REASON.FIGHTING);
        }
    }

    function evade(defender: Character, attack: AttackObj, dodge_flag: boolean) {
        //this skill has quite wide deviation
        const skill = trim(CharacterValues.skill(defender, SKILL.EVASION) + Math.round((Math.random() - 0.5) * 40), 0, 200);

        //passive evasion
        attack.defence_skill += skill;

        //active dodge
        if (dodge_flag) {
            attack.flags.miss = true
            attack.defence_skill += 50
        }

        // roll miss
        const block_dice = Math.random()
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.miss = true
        }

        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            Effect.Change.skill(defender, SKILL.EVASION, 1, CHANGE_REASON.FIGHTING);
        }

        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 10)) {
            Effect.Change.skill(defender, SKILL.EVASION, 1, CHANGE_REASON.FIGHTING);
        }
    }

    export function rob_the_dead(robber: Character, target: Character) {
        if (robber.cell_id != target.cell_id) {
            Alerts.alert(robber, "Target is too far away")
            return
        }
        if (!target.dead()) {
            Alerts.alert(robber, "You can rob only dead people")
            return
        }
        if (CharacterSystem.is_empty_inventory(target)) {
            Alerts.alert(robber, "Target's inventory is empty")
            return
        }

        CharacterSystem.transfer_all(target, robber)

        if (!CharacterSystem.is_empty_inventory(target)) {
            Alerts.alert(robber, "Your backpack is full")
        }

        UserManagement.add_user_to_update_queue(robber.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(robber.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(robber.user_id, UI_Part.INVENTORY)
        UserManagement.add_user_to_update_queue(robber.user_id, UI_Part.LOCAL_CHARACTERS)
    }

    export function kill(killer: Character, victim: Character) {
        let cell = Data.Cells.from_id(killer.cell_id)
        console.log(killer.name + ' kills ' + victim.name + ' at ' + `(${cell?.x}, ${cell?.y})`)
        death(victim)
        if (killer.id == victim.id) {
            return
        }

        // loot bulk
        const loot = CharacterSystem.rgo_check(victim)
        for (const item of loot) {
            if (MaterialStorage.get(item.material).category == MATERIAL_CATEGORY.SKIN) {
                const dice = Math.random()
                const skinning_skill = CharacterValues.skill(killer, SKILL.SKINNING)
                const amount = Math.round(item.amount * dice * skinning_skill / 100 * skinning_skill / 100)
                Event.change_stash(killer, item.material, amount)
                if (dice > skinning_skill / 100) {
                    Effect.Change.skill(killer, SKILL.SKINNING, 1, CHANGE_REASON.SKINNING)
                }
            } else {
                Event.change_stash(killer, item.material, item.amount)
            }
        }

        // loot items rgo
        // console.log('check items drop')
        const dropped_items = Loot.items(victim.race)
        for (let item of dropped_items) {
            EventInventory.add_item(killer, item.id)
        }

        DataID.Character.unset_all_ownership(victim.id)
        UserManagement.add_user_to_update_queue(killer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(killer.user_id, UI_Part.LOCAL_CHARACTERS)
    }

    export function death(character: Character) {
        if (character.cleared) return
        EventMarket.clear_orders(character)
        const user_data = Convert.character_to_user_data(character)
        Unlink.user_data_and_character(user_data, character);
        character.cleared = true
    }

    export function change_stash(character: Character, tag: MATERIAL, amount: number) {
        character.stash.inc(tag, amount)
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        Alerts.log_to_user(user, `change ${MaterialStorage.get(tag).name} by ${amount}. Now: ${character.stash.get(tag)}`)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
    }

    export function repair_location(character: Character, building_id: location_id) {
        let location = Data.Locations.from_id(building_id)
        let repair = 1
        let cost = 1
        if (cost > character.stash.get(MATERIAL.WOOD_RED)) return;
        let difficulty = Math.floor((location.devastation) / 3 + 10)
        on_craft_update(character, [{skill_checks: [
            {skill: SKILL.WOODWORKING, difficulty: difficulty / 2},
            {skill: SKILL.CARPENTER, difficulty: difficulty}
        ]}])
        change_stash(character, MATERIAL.WOOD_RED, -cost)
        Effect.location_repair(location, repair)
    }

    export function can_build(character: Character, location_id: location_id) {
        let location = Data.Locations.from_id(location_id)
        const price = 50

        if (DataID.Cells.main_location(location.cell_id) == location_id) {
            return false
        }
        if (location.has_house_level > 0) {
            return false
        }
        if (character.stash.get(MATERIAL.WOOD_RED) < price) {
            return false
        }

        return true
    }

    export function build_house(character: Character, location_id: location_id) {
        let location = Data.Locations.from_id(location_id)
        const price = 150

        if (DataID.Cells.main_location(location.cell_id) == location_id) {
            Alerts.alert(character, "Can't build in the main location")
            return
        }
        if (location.cell_id !== character.cell_id) {
            Alerts.alert(character, "Can't build in other cell")
            return
        }
        if (location.has_house_level > 0) {
            Alerts.alert(character, "This location already has a building placed there.")
            return
        }
        if (character.stash.get(MATERIAL.WOOD_RED) < price) {
            Alerts.alert(character, "Not enough wood to build a house: 50 units are required")
            return
        }

        character.stash.inc(MATERIAL.WOOD_RED, -price)
        Alerts.Log.stash_change(character, MATERIAL.WOOD_RED, -price, CHANGE_REASON.BUILDING)

        DataID.Connection.set_location_owner(character.id, location_id)
        location.has_house_level = 1
        SendUpdate.locations_to_character(character)
    }

    export function remove_tree(location: location_id) {
        const data = Data.Locations.from_id(location)
        data.forest -= 1
    }
}