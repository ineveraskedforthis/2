"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillList = exports.can_shoot = exports.can_cast_magic_bolt = exports.can_push_back = exports.can_fast_attack = exports.can_dodge = exports.perk_requirement = exports.perk_price = exports.perks_list = exports.SkillObject = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
class SkillObject {
    constructor() {
        this.practice = 0;
        this.theory = 0;
    }
}
exports.SkillObject = SkillObject;
exports.perks_list = ['meat_master', 'advanced_unarmed', 'advanced_polearm', 'mage_initiation', 'magic_bolt', 'fletcher', 'skin_armour_master'];
function perk_price(tag) {
    switch (tag) {
        case 'meat_master': return 100;
        case 'advanced_unarmed': return 200;
        case 'advanced_polearm': return 200;
        case 'mage_initiation': return 1000;
        case 'magic_bolt': return 100;
        case 'fletcher': return 200;
        case 'skin_armour_master': return 1000;
    }
}
exports.perk_price = perk_price;
function perk_requirement(tag, character) {
    switch (tag) {
        case 'meat_master': {
            if (character.skills.cooking.practice < 15) {
                return 'not_enough_cooking_skill_15';
            }
            return 'ok';
        }
        case 'fletcher': {
            if (character.skills.woodwork.practice < 15) {
                return 'not_enough_woodwork_skill_15';
            }
            return 'ok';
        }
        case 'advanced_unarmed': {
            if (character.skills.noweapon.practice < 15) {
                return 'not_enough_unarmed_skill_15';
            }
            return 'ok';
        }
        case 'advanced_polearm': {
            if (character.skills.polearms.practice < 15) {
                return 'not_enough_polearms_skill_15';
            }
            return 'ok';
        }
        case 'mage_initiation': {
            if (character.skills.magic_mastery.practice < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'magic_bolt': {
            if (!character.perks.mage_initiation) {
                return 'not_initiated';
            }
            if (character.skills.magic_mastery.practice < 15) {
                return 'not_enough_magic_skill_15';
            }
            return 'ok';
        }
        case 'skin_armour_master': {
            if (character.skills.clothier.practice < 15) {
                return 'not_enough_clothier_skill_15';
            }
        }
    }
}
exports.perk_requirement = perk_requirement;
function weapon_type(weapon) {
    if (weapon == undefined) {
        return "noweapon" /* WEAPON_TYPE.NOWEAPON */;
    }
    return weapon.get_weapon_type();
}
function can_dodge(character) {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == "noweapon" /* WEAPON_TYPE.NOWEAPON */) {
            return true;
        }
    }
    return false;
}
exports.can_dodge = can_dodge;
function can_fast_attack(character) {
    if (character.perks.advanced_unarmed == true) {
        if (weapon_type(character.equip.data.weapon) == "noweapon" /* WEAPON_TYPE.NOWEAPON */) {
            return true;
        }
    }
    return false;
}
exports.can_fast_attack = can_fast_attack;
function can_push_back(character) {
    if (character.perks.advanced_polearm == true) {
        if (weapon_type(character.equip.data.weapon) == "polearms" /* WEAPON_TYPE.POLEARMS */) {
            return true;
        }
    }
    return false;
}
exports.can_push_back = can_push_back;
function can_cast_magic_bolt(character) {
    if (character.perks.magic_bolt) {
        return true;
    }
    if (character.stash.get(materials_manager_1.ZAZ) > 0) {
        return true;
    }
    return false;
}
exports.can_cast_magic_bolt = can_cast_magic_bolt;
function can_shoot(character) {
    if (character.equip.data.weapon == undefined) {
        return false;
    }
    if (character.equip.data.weapon.ranged != true) {
        return false;
    }
    if (character.stash.get(materials_manager_1.ARROW_BONE) >= 1) {
        return true;
    }
    return false;
}
exports.can_shoot = can_shoot;
class SkillList {
    constructor() {
        this.clothier = new SkillObject();
        this.cooking = new SkillObject();
        this.onehand = new SkillObject();
        this.polearms = new SkillObject();
        this.noweapon = new SkillObject();
        this.twohanded = new SkillObject();
        this.skinning = new SkillObject();
        this.magic_mastery = new SkillObject();
        this.blocking = new SkillObject();
        this.evasion = new SkillObject();
        this.woodwork = new SkillObject();
        this.hunt = new SkillObject();
        this.ranged = new SkillObject();
    }
}
exports.SkillList = SkillList;
