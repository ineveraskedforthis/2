"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_item_crafts = void 0;
const content_1 = require("../../.././../game_content/src/content");
const CraftItem_1 = require("./CraftItem");
function generate_skill_check(skill_check, difficulty, material_category) {
    switch (material_category) {
        case 0 /* MATERIAL_CATEGORY.BOW_AMMO */: break;
        case 1 /* MATERIAL_CATEGORY.PLANT */: break;
        case 2 /* MATERIAL_CATEGORY.MATERIAL */: break;
        case 3 /* MATERIAL_CATEGORY.BONE */:
            skill_check.push({ skill: 'bone_carving', difficulty: difficulty });
            break;
        case 4 /* MATERIAL_CATEGORY.SKIN */:
            skill_check.push({ skill: "clothier", difficulty: difficulty });
            break;
        case 5 /* MATERIAL_CATEGORY.LEATHER */:
            skill_check.push({ skill: "clothier", difficulty: difficulty });
            break;
        case 6 /* MATERIAL_CATEGORY.MEAT */:
            skill_check.push({ skill: "clothier", difficulty: difficulty });
            break;
        case 7 /* MATERIAL_CATEGORY.FISH */: break;
        case 8 /* MATERIAL_CATEGORY.FOOD */: break;
        case 9 /* MATERIAL_CATEGORY.FRUIT */: break;
        case 10 /* MATERIAL_CATEGORY.WOOD */:
            skill_check.push({ skill: "woodwork", difficulty: difficulty });
            break;
    }
    return skill_check;
}
const input_multiplier = 1.2;
function generate_item_crafts() {
    for (const weapon_id of content_1.WeaponConfiguration.WEAPON) {
        const weapon = content_1.WeaponStorage.get(weapon_id);
        if (weapon.craftable == 0)
            continue;
        const material = weapon.material;
        const secondary_material = weapon.secondary_material;
        const material_data = content_1.MaterialStorage.get(material);
        const secondary_material_data = content_1.MaterialStorage.get(secondary_material);
        const impact_type = content_1.ImpactStorage.get(weapon.impact);
        let difficulty = 0;
        switch (impact_type.id) {
            case 0 /* IMPACT_TYPE.POINT */:
                difficulty += 15;
                break;
            case 1 /* IMPACT_TYPE.BLADE */:
                difficulty += 50;
                break;
            case 2 /* IMPACT_TYPE.BLUNT */:
                difficulty += 5;
                break;
        }
        let skills = [];
        skills = generate_skill_check(skills, difficulty, material_data.category);
        const main_box = {
            amount: Math.floor(1 + weapon.size * (1 - impact_type.handle_ratio) / material_data.unit_size * input_multiplier),
            material: material
        };
        if (material == secondary_material) {
            main_box.amount = Math.floor(1 + weapon.size / material_data.unit_size * input_multiplier);
            (0, CraftItem_1.new_craft_item)(weapon.id_string, [main_box], { tag: "weapon", value: weapon_id }, [], skills);
        }
        else {
            skills = generate_skill_check(skills, difficulty, secondary_material_data.category);
            (0, CraftItem_1.new_craft_item)(weapon.id_string, [main_box, { amount: Math.floor(1 + weapon.size * impact_type.handle_ratio / secondary_material_data.unit_size * input_multiplier), material: secondary_material }], { tag: "weapon", value: weapon_id }, [], skills);
        }
    }
    for (const armour_id of content_1.ArmourConfiguration.ARMOUR) {
        const armour = content_1.ArmourStorage.get(armour_id);
        const material = armour.material;
        const secondary_material = armour.secondary_material;
        const material_data = content_1.MaterialStorage.get(material);
        const secondary_material_data = content_1.MaterialStorage.get(secondary_material);
        const slot = content_1.EquipSlotStorage.get(armour.slot);
        let difficulty = 50;
        let skills = [];
        skills = generate_skill_check(skills, difficulty, material_data.category);
        const main_box = {
            amount: Math.floor(1 + armour.size * input_multiplier / material_data.unit_size),
            material: material
        };
        if (material == secondary_material) {
            main_box.amount += Math.floor(1 + (armour.size + armour.secondary_size) / material_data.unit_size * input_multiplier);
            (0, CraftItem_1.new_craft_item)(armour.id_string, [main_box], { tag: "armour", value: armour_id }, [], skills);
        }
        else {
            skills = generate_skill_check(skills, difficulty, secondary_material_data.category);
            (0, CraftItem_1.new_craft_item)(armour.id_string, [
                main_box,
                {
                    amount: Math.floor(1 + armour.secondary_size / secondary_material_data.unit_size * input_multiplier),
                    material: secondary_material
                }
            ], {
                tag: "armour",
                value: armour_id
            }, [], skills);
        }
    }
}
exports.generate_item_crafts = generate_item_crafts;

