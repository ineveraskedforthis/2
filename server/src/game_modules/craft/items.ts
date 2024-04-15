import { ArmourConfiguration, ArmourStorage, EquipSlotStorage, IMPACT_TYPE, ImpactStorage, MATERIAL, MATERIAL_CATEGORY, MaterialStorage, WeaponConfiguration, WeaponStorage } from "@content/content"
import { new_craft_item } from "./CraftItem"
import { box, skill_check } from "@custom_types/inventory"

function generate_skill_check(skill_check: skill_check[], difficulty: number, material_category: MATERIAL_CATEGORY) {
    switch(material_category) {
        case MATERIAL_CATEGORY.BOW_AMMO:break;
        case MATERIAL_CATEGORY.PLANT:break;
        case MATERIAL_CATEGORY.MATERIAL:break;
        case MATERIAL_CATEGORY.BONE:skill_check.push({skill: 'bone_carving', difficulty: difficulty}); break;
        case MATERIAL_CATEGORY.SKIN:skill_check.push({skill: "clothier", difficulty: difficulty});break;
        case MATERIAL_CATEGORY.LEATHER:skill_check.push({skill: "clothier", difficulty: difficulty});break;
        case MATERIAL_CATEGORY.MEAT:skill_check.push({skill: "clothier", difficulty: difficulty});break;
        case MATERIAL_CATEGORY.FISH:break;
        case MATERIAL_CATEGORY.FOOD:break;
        case MATERIAL_CATEGORY.FRUIT:break;
        case MATERIAL_CATEGORY.WOOD:skill_check.push({skill: "woodwork", difficulty: difficulty});break;
    }

    return skill_check
}

const input_multiplier = 1.2

export function generate_item_crafts() {
    for (const weapon_id of WeaponConfiguration.WEAPON) {
        const weapon = WeaponStorage.get(weapon_id)

        if (weapon.craftable == 0) continue;

        const material = weapon.material
        const secondary_material = weapon.secondary_material

        const material_data = MaterialStorage.get(material)
        const secondary_material_data = MaterialStorage.get(secondary_material)

        const impact_type = ImpactStorage.get(weapon.impact)

        let difficulty = 0

        switch(impact_type.id) {
            case IMPACT_TYPE.POINT:difficulty += 15;break
            case IMPACT_TYPE.BLADE:difficulty += 50;break
            case IMPACT_TYPE.BLUNT:difficulty += 5;break
        }

        let skills: skill_check[] = []
        skills = generate_skill_check(skills, difficulty, material_data.category)

        const main_box: box = {
            amount: Math.floor(1 + weapon.size * (1 - impact_type.handle_ratio) / material_data.unit_size * input_multiplier),
            material: material
        }

        if (material == secondary_material) {
            main_box.amount = Math.floor(1 + weapon.size / material_data.unit_size * input_multiplier)
            new_craft_item(weapon.id_string, [main_box], {tag: "weapon", value: weapon_id}, [], skills)
        } else {
            skills = generate_skill_check(skills, difficulty, secondary_material_data.category)
            new_craft_item(weapon.id_string, [main_box, {amount: Math.floor(1 + weapon.size * impact_type.handle_ratio / secondary_material_data.unit_size * input_multiplier), material: secondary_material}], {tag: "weapon", value: weapon_id}, [], skills)
        }
    }

    for (const armour_id of ArmourConfiguration.ARMOUR) {
        const armour = ArmourStorage.get(armour_id)

        const material = armour.material
        const secondary_material = armour.secondary_material

        const material_data = MaterialStorage.get(material)
        const secondary_material_data = MaterialStorage.get(secondary_material)

        const slot = EquipSlotStorage.get(armour.slot)

        let difficulty = 50

        let skills: skill_check[] = []
        skills = generate_skill_check(skills, difficulty, material_data.category)

        const main_box: box = {
            amount: Math.floor(1 + armour.size * input_multiplier / material_data.unit_size),
            material: material
        }

        if (material == secondary_material) {
            main_box.amount += Math.floor(1 + (armour.size + armour.secondary_size) / material_data.unit_size * input_multiplier)
            new_craft_item(armour.id_string, [main_box], {tag: "armour", value: armour_id}, [], skills)
        } else {
            skills = generate_skill_check(skills, difficulty, secondary_material_data.category)
            new_craft_item(
                armour.id_string,
                [
                    main_box,
                    {
                        amount: Math.floor(1 + armour.secondary_size / secondary_material_data.unit_size * input_multiplier),
                        material: secondary_material
                    }
                ],
                {
                    tag: "armour",
                    value: armour_id
                }, [], skills)
        }
    }
}