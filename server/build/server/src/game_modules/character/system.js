"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterSystem = void 0;
const content_1 = require("../../.././../game_content/src/content");
const decide_1 = require("../AI/Decide/decide");
const basic_functions_1 = require("../calculations/basic_functions");
const damage_types_1 = require("../damage_types");
const data_objects_1 = require("../data/data_objects");
const effects_1 = require("../effects/effects");
const generate_loot_1 = require("../races/generate_loot");
const character_1 = require("../scripted-values/character");
var ai_campaign_decision_timer = 0;
var character_state_update_timer = 0;
var CharacterSystem;
(function (CharacterSystem) {
    function template_to_character(template, name, location) {
        if (name == undefined)
            name = template.name_generator();
        const character = data_objects_1.Data.Characters.create(location, name, template);
        character.explored[character.cell_id] = true;
        for (const cell_id of data_objects_1.Data.World.neighbours(character.cell_id)) {
            character.explored[cell_id] = true;
        }
        return character;
    }
    CharacterSystem.template_to_character = template_to_character;
    /**
     * Damages character, accounting for resistances
     * @param character Damaged character
     * @param damage damage
     * @param reason Reason of damage
     * @returns total damage dealt
     */
    function damage(character, damage, reason) {
        let total = 0;
        let resistance = character_1.CharacterValues.resistance(character);
        for (let tag of damage_types_1.damage_types) {
            const damage_curr = (0, basic_functions_1.trim)(damage[tag] - resistance[tag], 0, 100000);
            effects_1.Effect.Change.hp(character, -damage_curr, reason);
            total += damage_curr;
        }
        return total;
    }
    CharacterSystem.damage = damage;
    function is_empty_inventory(target) {
        return (target.savings.get() == 0) && target.stash.is_empty() && target.equip.is_empty();
    }
    CharacterSystem.is_empty_inventory = is_empty_inventory;
    function transfer_all(origin, target) {
        origin.stash.transfer_all(target.stash);
        origin.savings.transfer_all(target.savings);
        origin.equip.transfer_all(target);
    }
    CharacterSystem.transfer_all = transfer_all;
    function rgo_check(character) {
        const loot = generate_loot_1.Loot.base(character.model);
        return loot;
    }
    CharacterSystem.rgo_check = rgo_check;
    function update(dt) {
        ai_campaign_decision_timer += dt;
        character_state_update_timer += dt;
        if (ai_campaign_decision_timer > 8) {
            (0, decide_1.decide)();
            ai_campaign_decision_timer = 0;
        }
        if (character_state_update_timer > 10) {
            data_objects_1.Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return;
                }
                if (!character.in_battle()) {
                    effects_1.Effect.Change.rage(character, -2, "Rest" /* CHANGE_REASON.REST */);
                }
                // spoilage
                for (const material_id of content_1.MaterialConfiguration.MATERIAL) {
                    const material = content_1.MaterialStorage.get(material_id);
                    if (material.category == 7 /* MATERIAL_CATEGORY.FISH */)
                        effects_1.Effect.spoilage(character, material_id, 0.01);
                    if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */)
                        effects_1.Effect.spoilage(character, material_id, 0.01);
                    if (material.category == 9 /* MATERIAL_CATEGORY.FRUIT */)
                        effects_1.Effect.spoilage(character, material_id, 0.01);
                    if (material.category == 8 /* MATERIAL_CATEGORY.FOOD */)
                        effects_1.Effect.spoilage(character, material_id, 0.001);
                }
                // hunger
                {
                    if (character.hp_max < character.hp * 2) {
                        effects_1.Effect.Change.hp(character, -1, "Hunger" /* CHANGE_REASON.HUNGER */);
                    }
                    else {
                        effects_1.Effect.Change.fatigue(character, 1, "Hunger" /* CHANGE_REASON.HUNGER */);
                    }
                }
            });
            character_state_update_timer = 0;
        }
    }
    CharacterSystem.update = update;
    function battle_update(character) {
    }
    CharacterSystem.battle_update = battle_update;
})(CharacterSystem || (exports.CharacterSystem = CharacterSystem = {}));

