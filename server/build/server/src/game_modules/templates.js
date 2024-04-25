"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const events_1 = require("./events/events");
const TEMPLATE_ELO_1 = require("./races/TEMPLATE_ELO");
const TEMPLATE_GRACI_1 = require("./races/TEMPLATE_GRACI");
const TEMPLATE_HUMANS_1 = require("./races/TEMPLATE_HUMANS");
const TEMPLATE_RATS_1 = require("./races/TEMPLATE_RATS");
const TEMPLATE_OTHERS_1 = require("./races/TEMPLATE_OTHERS");
const data_id_1 = require("./data/data_id");
const data_objects_1 = require("./data/data_objects");
const LUMP_OF_MONEY = 1000;
const TONS_OF_MONEY = 30000;
var Template;
(function (Template) {
    let Character;
    (function (Character) {
        function Base(template, name, model, location, faction_id) {
            if (faction_id != undefined)
                location = data_id_1.DataID.Faction.spawn(faction_id);
            if (location == undefined) {
                console.log("attempt to generate character without location");
                return undefined;
            }
            let character = events_1.Event.new_character(template, name, location, model);
            if (faction_id != undefined) {
                character.home_location_id = data_id_1.DataID.Faction.spawn(faction_id);
            }
            if (faction_id != undefined)
                data_id_1.DataID.Reputation.set(character.id, faction_id, "member");
            return character;
        }
        function GenericHuman(name, faction) {
            let human = Base(TEMPLATE_HUMANS_1.HumanTemplate, name, undefined, undefined, faction);
            human._skills[4 /* SKILL.WOODWORKING */] += 10;
            human._skills[2 /* SKILL.COOKING */] += 15;
            human._skills[13 /* SKILL.HUNTING */] += 10;
            human._skills[15 /* SKILL.FISHING */] += 10;
            human._skills[17 /* SKILL.TRAVELLING */] += 10;
            human._skills[14 /* SKILL.GATHERING */] += 10;
            human._skills[24 /* SKILL.UNARMED */] += 10;
            return human;
        }
        Character.GenericHuman = GenericHuman;
        function HumanSteppe(name) {
            let human = GenericHuman(name, 'steppe_humans');
            human._skills[13 /* SKILL.HUNTING */] += 20;
            human._skills[3 /* SKILL.SKINNING */] += 10;
            human._skills[2 /* SKILL.COOKING */] += 10;
            human._skills[17 /* SKILL.TRAVELLING */] += 30;
            human._skills[14 /* SKILL.GATHERING */] += 40;
            human._skills[16 /* SKILL.WOODCUTTING */] += 10;
            human._skills[18 /* SKILL.RANGED */] += 20;
            human._skills[24 /* SKILL.UNARMED */] += 10;
            return human;
        }
        Character.HumanSteppe = HumanSteppe;
        function Lumberjack(name) {
            let human = HumanSteppe(name);
            human._skills[17 /* SKILL.TRAVELLING */] += 20;
            human._skills[14 /* SKILL.GATHERING */] += 20;
            human._skills[16 /* SKILL.WOODCUTTING */] += 40;
            human._skills[21 /* SKILL.ONEHANDED */] += 20;
            human.ai_map = 'lumberjack';
            let cutting_tool = data_objects_1.Data.Items.create_weapon(100, [], 3 /* WEAPON.DAGGER_BONE_RAT */);
            cutting_tool.durability = 200;
            human.equip.weapon_id = cutting_tool.id;
            return human;
        }
        Character.Lumberjack = Lumberjack;
        function Peasant(name) {
            let human = HumanCity(name);
            human._skills[14 /* SKILL.GATHERING */] = 90;
            return human;
        }
        Character.Peasant = Peasant;
        function Fisherman(name) {
            let human = HumanCity(name);
            human._skills[17 /* SKILL.TRAVELLING */] += 20;
            human._skills[15 /* SKILL.FISHING */] += 40;
            human.ai_map = 'fisherman';
            return human;
        }
        Character.Fisherman = Fisherman;
        function HumanStrong(location, name) {
            let human = Base(TEMPLATE_HUMANS_1.HumanStrongTemplate, name, undefined, location, undefined);
            return human;
        }
        Character.HumanStrong = HumanStrong;
        function HumanCity(name) {
            let human = GenericHuman(name, 'city');
            human._skills[15 /* SKILL.FISHING */] += 20;
            human._skills[24 /* SKILL.UNARMED */] += 5;
            return human;
        }
        Character.HumanCity = HumanCity;
        function HumanSpearman(name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(name);
                    break;
                }
                case "city": {
                    var human = HumanCity(name);
                    break;
                }
            }
            human._skills[23 /* SKILL.POLEARMS */] += 60;
            human._skills[19 /* SKILL.EVASION */] += 10;
            human._skills[20 /* SKILL.BLOCKING */] += 10;
            human._skills[18 /* SKILL.RANGED */] += 20;
            human._perks[8 /* PERK.PRO_FIGHTER_POLEARMS */] = 1;
            let spear = data_objects_1.Data.Items.create_weapon(100, [], 2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */);
            spear.durability = 200;
            let bow = data_objects_1.Data.Items.create_weapon(100, [], 0 /* WEAPON.BOW_WOOD */);
            let armour = data_objects_1.Data.Items.create_armour(100, [], 5 /* ARMOUR.MAIL_LEATHER_RAT */);
            let pants = data_objects_1.Data.Items.create_armour(100, [], 10 /* ARMOUR.PANTS_LEATHER_RAT */);
            let boots = data_objects_1.Data.Items.create_armour(100, [], 12 /* ARMOUR.BOOTS_LEATHER_RAT */);
            let hat = data_objects_1.Data.Items.create_armour(100, [], 2 /* ARMOUR.HELMET_LEATHER_RAT */);
            human.equip.weapon_id = spear.id;
            human.equip.data.slots[3 /* EQUIP_SLOT.MAIL */] = armour.id;
            human.equip.data.slots[13 /* EQUIP_SLOT.PANTS */] = pants.id;
            human.equip.data.slots[8 /* EQUIP_SLOT.BOOTS */] = boots.id;
            human.equip.data.slots[9 /* EQUIP_SLOT.HELMET */] = hat.id;
            human.equip.data.slots[1 /* EQUIP_SLOT.SECONDARY */] = bow.id;
            return human;
        }
        Character.HumanSpearman = HumanSpearman;
        function EquipClothesBasic(character) {
            character.equip.data.slots[3 /* EQUIP_SLOT.MAIL */] = data_objects_1.Data.Items.create_armour(100, [], 6 /* ARMOUR.MAIL_TEXTILE */).id;
            character.equip.data.slots[8 /* EQUIP_SLOT.BOOTS */] = data_objects_1.Data.Items.create_armour(100, [], 12 /* ARMOUR.BOOTS_LEATHER_RAT */).id;
            character.equip.data.slots[13 /* EQUIP_SLOT.PANTS */] = data_objects_1.Data.Items.create_armour(100, [], 11 /* ARMOUR.PANTS_TEXTILE */).id;
            character.equip.data.slots[12 /* EQUIP_SLOT.SHIRT */] = data_objects_1.Data.Items.create_armour(100, [], 23 /* ARMOUR.SHIRT_TEXTILE */).id;
            return character;
        }
        Character.EquipClothesBasic = EquipClothesBasic;
        function EquipClothesRich(character) {
            EquipClothesBasic(character);
            character.equip.data.slots[11 /* EQUIP_SLOT.ROBE */] = data_objects_1.Data.Items.create_armour(100, [], 21 /* ARMOUR.ROBE_LEATHER_RAT */).id;
            character.equip.data.slots[7 /* EQUIP_SLOT.GAUNTLET_RIGHT */] = data_objects_1.Data.Items.create_armour(100, [], 14 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */).id;
            character.equip.data.slots[6 /* EQUIP_SLOT.GAUNTLET_LEFT */] = data_objects_1.Data.Items.create_armour(100, [], 16 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */).id;
            character.equip.data.slots[9 /* EQUIP_SLOT.HELMET */] = data_objects_1.Data.Items.create_armour(100, [], 1 /* ARMOUR.HELMET_TEXTILE */).id;
            return character;
        }
        Character.EquipClothesRich = EquipClothesRich;
        function HumanRatHunter(name) {
            let human = HumanSpearman(name, 'steppe');
            human.ai_map = 'rat_hunter';
            human._skills[3 /* SKILL.SKINNING */] += 20;
            human._skills[13 /* SKILL.HUNTING */] += 20;
            return human;
        }
        Character.HumanRatHunter = HumanRatHunter;
        function HumanCook(name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(name);
                    break;
                }
                case "city": {
                    var human = HumanCity(name);
                    break;
                }
            }
            human.savings.inc(500);
            human._skills[2 /* SKILL.COOKING */] = 70;
            human._perks[0 /* PERK.PRO_BUTCHER */] = 1;
            return human;
        }
        Character.HumanCook = HumanCook;
        function HumanFletcher(name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(name);
                    break;
                }
                case "city": {
                    var human = HumanCity(name);
                    break;
                }
            }
            human._skills[4 /* SKILL.WOODWORKING */] = 80;
            human._skills[9 /* SKILL.BONE_CARVING */] = 30;
            human._perks[3 /* PERK.PRO_FLETCHER */] = 1;
            human._skills[8 /* SKILL.FLETCHING */] = 70;
            human.savings.inc(500);
            return human;
        }
        Character.HumanFletcher = HumanFletcher;
        function HumanCityGuard(name) {
            let human = HumanSpearman(name, 'city');
            human.ai_map = 'urban_guard';
            human._skills[23 /* SKILL.POLEARMS */] += 10;
            return human;
        }
        Character.HumanCityGuard = HumanCityGuard;
        function Tanner(name) {
            let human = HumanCity(name);
            human._skills[12 /* SKILL.TANNING */] += 50;
            human.savings.inc(500);
            return human;
        }
        Character.Tanner = Tanner;
        function HumanLocalTrader(name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(name);
                    break;
                }
                case "city": {
                    var human = HumanCity(name);
                    break;
                }
            }
            human.ai_map = 'urban_trader';
            human.savings.inc(TONS_OF_MONEY);
            human.stash.inc(34 /* MATERIAL.STEEL */, 10);
            return human;
        }
        Character.HumanLocalTrader = HumanLocalTrader;
        function GenericRat(name) {
            let rat = Base(TEMPLATE_RATS_1.RatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            return rat;
        }
        Character.GenericRat = GenericRat;
        function MageRat(name) {
            let rat = Base(TEMPLATE_RATS_1.MageRatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            rat._perks[14 /* PERK.MAGIC_BOLT */] = 1;
            rat._perks[11 /* PERK.MAGIC_INITIATION */] = 1;
            rat.stash.inc(30 /* MATERIAL.ZAZ */, 5);
            return rat;
        }
        Character.MageRat = MageRat;
        function BerserkRat(name) {
            let rat = Base(TEMPLATE_RATS_1.BerserkRatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            rat._perks[17 /* PERK.BATTLE_CHARGE */] = 1;
            rat._skills[24 /* SKILL.UNARMED */] = 40;
            return rat;
        }
        Character.BerserkRat = BerserkRat;
        function BigRat(name) {
            let rat = Base(TEMPLATE_RATS_1.BigRatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            rat._skills[24 /* SKILL.UNARMED */] = 40;
            return rat;
        }
        Character.BigRat = BigRat;
        function MageElo(name) {
            let elo = Base(TEMPLATE_ELO_1.ElodinoTemplate, name, undefined, undefined, 'elodino_free');
            elo._perks[14 /* PERK.MAGIC_BOLT */] = 1;
            elo._perks[11 /* PERK.MAGIC_INITIATION */] = 1;
            elo._skills[26 /* SKILL.MAGIC */] = 30;
            elo._skills[2 /* SKILL.COOKING */] = 20;
            elo.stash.inc(30 /* MATERIAL.ZAZ */, 20);
            return elo;
        }
        Character.MageElo = MageElo;
        function Elo(name) {
            let elo = Base(TEMPLATE_ELO_1.ElodinoTemplate, name, undefined, undefined, 'elodino_free');
            if (elo == undefined)
                return undefined;
            return elo;
        }
        Character.Elo = Elo;
        function Graci(name) {
            let graci = Base(TEMPLATE_GRACI_1.GraciTemplate, name, undefined, undefined, 'graci');
            graci._skills[17 /* SKILL.TRAVELLING */] = 70;
            return graci;
        }
        Character.Graci = Graci;
        function Mage(name, faction) {
            let mage = GenericHuman(name, faction);
            mage._skills[26 /* SKILL.MAGIC */] = 100;
            mage._perks[11 /* PERK.MAGIC_INITIATION */] = 1;
            mage._skills[29 /* SKILL.BATTLE_MAGIC */] = 60;
            mage._perks[14 /* PERK.MAGIC_BOLT */] = 1;
            let item = data_objects_1.Data.Items.create_weapon_simple(2 /* WEAPON.SPEAR_WOOD_RED_BONE_RAT */);
            item.affixes.push({ tag: 'of_power' });
            item.affixes.push({ tag: 'of_power' });
            mage.equip.weapon_id = item.id;
            return mage;
        }
        Character.Mage = Mage;
        function BloodMage(name, faction) {
            const mage = Mage(name, faction);
            mage._perks[13 /* PERK.MAGIC_BLOOD */] = 1;
            return mage;
        }
        Character.BloodMage = BloodMage;
        function Alchemist(name, faction) {
            let alchemist = GenericHuman(name, faction);
            alchemist._skills[26 /* SKILL.MAGIC */] = 60;
            alchemist._perks[11 /* PERK.MAGIC_INITIATION */] = 1;
            alchemist._perks[12 /* PERK.PRO_ALCHEMIST */] = 1;
            alchemist.stash.inc(30 /* MATERIAL.ZAZ */, 5);
            alchemist.savings.inc(5000);
            return alchemist;
        }
        Character.Alchemist = Alchemist;
        function ArmourMaster(name) {
            let master = HumanCity(name);
            master._skills[0 /* SKILL.CLOTHIER */] = 100;
            master._skills[5 /* SKILL.LEATHERWORKING */] = 100;
            master._perks[4 /* PERK.PRO_LEATHERWORK */] = 1;
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.ArmourMaster = ArmourMaster;
        function Shoemaker(name) {
            let master = HumanCity(name);
            master._skills[5 /* SKILL.LEATHERWORKING */] = 50;
            master._skills[10 /* SKILL.CORDWAINING */] = 100;
            master._perks[6 /* PERK.PRO_CORDWAINER */] = 1;
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.Shoemaker = Shoemaker;
        function WeaponMasterWood(name, faction) {
            let master = GenericHuman(name, faction);
            master._skills[4 /* SKILL.WOODWORKING */] = 100;
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.WeaponMasterWood = WeaponMasterWood;
        function WeaponMasterBone(name, faction) {
            let master = GenericHuman(name, faction);
            master._skills[9 /* SKILL.BONE_CARVING */] = 100;
            master._perks[2 /* PERK.PRO_BONEWORK */] = 1;
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.WeaponMasterBone = WeaponMasterBone;
        function MasterUnarmed(name, faction) {
            let master = GenericHuman(name, faction);
            master._skills[24 /* SKILL.UNARMED */] = 100;
            master._perks[16 /* PERK.BATTLE_DODGE */] = 1;
            master._perks[7 /* PERK.PRO_FIGHTER_UNARMED */] = 1;
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.MasterUnarmed = MasterUnarmed;
        function Ball(location, name) {
            return Base(TEMPLATE_OTHERS_1.BallTemplate, name, undefined, location, undefined);
        }
        Character.Ball = Ball;
    })(Character = Template.Character || (Template.Character = {}));
})(Template || (exports.Template = Template = {}));
