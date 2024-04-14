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
            human._skills.woodwork += 10;
            human._skills.cooking += 15;
            human._skills.hunt += 5;
            human._skills.fishing += 5;
            human._skills.travelling += 5;
            human._skills.noweapon += 10;
            return human;
        }
        Character.GenericHuman = GenericHuman;
        function HumanSteppe(name) {
            let human = GenericHuman(name, 'steppe_humans');
            human._skills.hunt += 20;
            human._skills.skinning += 10;
            human._skills.cooking += 10;
            human._skills.travelling += 30;
            human._skills.ranged += 20;
            human._skills.noweapon += 10;
            return human;
        }
        Character.HumanSteppe = HumanSteppe;
        function Lumberjack(name) {
            let human = HumanSteppe(name);
            human._skills.travelling += 20;
            human.ai_map = 'lumberjack';
            let cutting_tool = data_objects_1.Data.Items.create_weapon(100, [], 3 /* WEAPON.DAGGER_BONE_RAT */);
            cutting_tool.durability = 200;
            human.equip.weapon = cutting_tool;
            return human;
        }
        Character.Lumberjack = Lumberjack;
        function Fisherman(name) {
            let human = HumanSteppe(name);
            human._skills.travelling += 20;
            human._skills.fishing += 40;
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
            human._skills.fishing += 20;
            human._skills.noweapon += 5;
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
            human._skills.polearms = 60;
            human._skills.evasion += 10;
            human._skills.blocking += 10;
            human._skills.ranged += 20;
            human._perks.advanced_polearm = true;
            let spear = data_objects_1.Data.Items.create_weapon(100, [], 2 /* WEAPON.SPEAR_WOOD_BONE */);
            spear.durability = 200;
            let bow = data_objects_1.Data.Items.create_weapon(100, [], 0 /* WEAPON.BOW_WOOD */);
            let armour = data_objects_1.Data.Items.create_armour(100, [], 5 /* ARMOUR.MAIL_LEATHER_RAT */);
            let pants = data_objects_1.Data.Items.create_armour(100, [], 8 /* ARMOUR.PANTS_LEATHER_RAT */);
            let boots = data_objects_1.Data.Items.create_armour(100, [], 10 /* ARMOUR.BOOTS_LEATHER_RAT */);
            let hat = data_objects_1.Data.Items.create_armour(100, [], 2 /* ARMOUR.HELMET_LEATHER_RAT */);
            human.equip.weapon = spear;
            human.equip.data.slots[3 /* EQUIP_SLOT.MAIL */] = armour.id;
            human.equip.data.slots[13 /* EQUIP_SLOT.PANTS */] = pants.id;
            human.equip.data.slots[8 /* EQUIP_SLOT.BOOTS */] = boots.id;
            human.equip.data.slots[9 /* EQUIP_SLOT.HELMET */] = hat.id;
            human.equip.data.slots[1 /* EQUIP_SLOT.SECONDARY */] = bow.id;
            human.stash.inc(0 /* MATERIAL.ARROW_BONE */, 60);
            return human;
        }
        Character.HumanSpearman = HumanSpearman;
        function EquipClothesBasic(character) {
            character.equip.data.slots[3 /* EQUIP_SLOT.MAIL */] = data_objects_1.Data.Items.create_armour(100, [], 6 /* ARMOUR.MAIL_TEXTILE */).id;
            character.equip.data.slots[8 /* EQUIP_SLOT.BOOTS */] = data_objects_1.Data.Items.create_armour(100, [], 10 /* ARMOUR.BOOTS_LEATHER_RAT */).id;
            character.equip.data.slots[13 /* EQUIP_SLOT.PANTS */] = data_objects_1.Data.Items.create_armour(100, [], 9 /* ARMOUR.PANTS_TEXTILE */).id;
            character.equip.data.slots[12 /* EQUIP_SLOT.SHIRT */] = data_objects_1.Data.Items.create_armour(100, [], 21 /* ARMOUR.SHIRT_TEXTILE */).id;
            return character;
        }
        Character.EquipClothesBasic = EquipClothesBasic;
        function EquipClothesRich(character) {
            EquipClothesBasic(character);
            character.equip.data.slots[11 /* EQUIP_SLOT.ROBE */] = data_objects_1.Data.Items.create_armour(100, [], 19 /* ARMOUR.ROBE_LEATHER_RAT */).id;
            character.equip.data.slots[7 /* EQUIP_SLOT.GAUNTLET_RIGHT */] = data_objects_1.Data.Items.create_armour(100, [], 12 /* ARMOUR.GAUNTLET_RIGHT_TEXTILE */).id;
            character.equip.data.slots[6 /* EQUIP_SLOT.GAUNTLET_LEFT */] = data_objects_1.Data.Items.create_armour(100, [], 14 /* ARMOUR.GAUNTLET_LEFT_TEXTILE */).id;
            character.equip.data.slots[9 /* EQUIP_SLOT.HELMET */] = data_objects_1.Data.Items.create_armour(100, [], 1 /* ARMOUR.HELMET_TEXTILE */).id;
            return character;
        }
        Character.EquipClothesRich = EquipClothesRich;
        function HumanRatHunter(name) {
            let human = HumanSpearman(name, 'steppe');
            human.ai_map = 'rat_hunter';
            human._skills.skinning += 20;
            human._skills.hunt += 20;
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
            human.stash.inc(27 /* MATERIAL.FISH_OKU_FRIED */, 10);
            human.stash.inc(19 /* MATERIAL.MEAT_RAT_FRIED */, 10);
            human.savings.inc(500);
            human._skills.cooking = 70;
            human._perks.meat_master = true;
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
            human._skills.woodwork = 80;
            human._skills.bone_carving = 30;
            human._perks.fletcher = true;
            human._skills.ranged = 30;
            human.stash.inc(0 /* MATERIAL.ARROW_BONE */, 50);
            human.stash.inc(4 /* MATERIAL.SMALL_BONE_RAT */, 3);
            human.stash.inc(31 /* MATERIAL.WOOD_RED */, 1);
            human.savings.inc(500);
            return human;
        }
        Character.HumanFletcher = HumanFletcher;
        function HumanCityGuard(name) {
            let human = HumanSpearman(name, 'city');
            human.ai_map = 'urban_guard';
            human._skills.polearms += 10;
            return human;
        }
        Character.HumanCityGuard = HumanCityGuard;
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
            human.savings.inc(800);
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
            rat._perks.magic_bolt = true;
            rat._perks.mage_initiation = true;
            rat.stash.inc(30 /* MATERIAL.ZAZ */, 5);
            return rat;
        }
        Character.MageRat = MageRat;
        function BerserkRat(name) {
            let rat = Base(TEMPLATE_RATS_1.BerserkRatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            rat._perks.charge = true;
            rat._skills.noweapon = 40;
            return rat;
        }
        Character.BerserkRat = BerserkRat;
        function BigRat(name) {
            let rat = Base(TEMPLATE_RATS_1.BigRatTemplate, name, undefined, undefined, 'rats');
            rat._traits.claws = true;
            rat._skills.noweapon = 40;
            return rat;
        }
        Character.BigRat = BigRat;
        function MageElo(name) {
            let elo = Base(TEMPLATE_ELO_1.ElodinoTemplate, name, undefined, undefined, 'elodino_free');
            elo._perks.magic_bolt = true;
            elo._perks.mage_initiation = true;
            elo._skills.magic_mastery = 20;
            elo._skills.cooking = 20;
            elo.stash.inc(30 /* MATERIAL.ZAZ */, 30);
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
            graci._skills.travelling = 70;
            return graci;
        }
        Character.Graci = Graci;
        function Mage(faction) {
            let mage = GenericHuman('Mage', faction);
            mage._skills.magic_mastery = 100;
            mage._perks.mage_initiation = true;
            mage._perks.magic_bolt = true;
            let item = data_objects_1.Data.Items.create_weapon_simple(1 /* WEAPON.SPEAR_WOOD */);
            item.affixes.push({ tag: 'of_power' });
            item.affixes.push({ tag: 'of_power' });
            mage.equip.weapon = item;
            return mage;
        }
        Character.Mage = Mage;
        function BloodMage(faction) {
            const mage = Mage(faction);
            mage._perks.blood_mage = true;
            return mage;
        }
        Character.BloodMage = BloodMage;
        function Alchemist(faction) {
            let alchemist = GenericHuman('Alchemist', faction);
            alchemist._skills.magic_mastery = 60;
            alchemist._perks.mage_initiation = true;
            alchemist._perks.alchemist = true;
            alchemist.stash.inc(30 /* MATERIAL.ZAZ */, 5);
            alchemist.savings.inc(5000);
            return alchemist;
        }
        Character.Alchemist = Alchemist;
        function ArmourMaster() {
            let master = HumanCity('Armourer');
            master._skills.clothier = 100;
            master._perks.skin_armour_master = true;
            master.stash.inc(14 /* MATERIAL.LEATHER_RAT */, 50);
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.ArmourMaster = ArmourMaster;
        function Shoemaker() {
            let master = HumanCity('Shoemaker');
            master._skills.clothier = 100;
            master._perks.shoemaker = true;
            master.stash.inc(14 /* MATERIAL.LEATHER_RAT */, 50);
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.Shoemaker = Shoemaker;
        function WeaponMasterWood(faction) {
            let master = GenericHuman('Weapons maker', faction);
            master._skills.woodwork = 100;
            master._perks.weapon_maker = true;
            master.stash.inc(31 /* MATERIAL.WOOD_RED */, 15);
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.WeaponMasterWood = WeaponMasterWood;
        function WeaponMasterBone(faction) {
            let master = GenericHuman('Weapons maker', faction);
            master._skills.bone_carving = 100;
            master._perks.weapon_maker = true;
            master.stash.inc(7 /* MATERIAL.BONE_RAT */, 40);
            master.savings.inc(TONS_OF_MONEY);
            return master;
        }
        Character.WeaponMasterBone = WeaponMasterBone;
        function MasterUnarmed(faction) {
            let master = GenericHuman('Monk', faction);
            master._skills.noweapon = 100;
            master._perks.dodge = true;
            master._perks.advanced_unarmed = true;
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
