"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const data_1 = require("./data");
const events_1 = require("./events/events");
// import { Factions } from "./factions"
const items_set_up_1 = require("./items/items_set_up");
const system_1 = require("./items/system");
const materials_manager_1 = require("./manager_classes/materials_manager");
const elo_1 = require("./races/elo");
const graci_1 = require("./races/graci");
const human_1 = require("./races/human");
const rat_1 = require("./races/rat");
const others_1 = require("./races/others");
const LUMP_OF_MONEY = 1000;
const TONS_OF_MONEY = 30000;
var Template;
(function (Template) {
    let Character;
    (function (Character) {
        function Base(template, name, model, x, y, faction_id) {
            const cell = data_1.Data.World.coordinate_to_id([x, y]);
            let character = events_1.Event.new_character(template, name, cell, model);
            if (faction_id != undefined)
                data_1.Data.Reputation.set(faction_id, character.id, "member");
            return character;
        }
        function GenericHuman(x, y, name, faction) {
            let human = Base(human_1.HumanTemplate, name, undefined, x, y, faction);
            human._skills.woodwork += 10;
            human._skills.cooking += 15;
            human._skills.hunt += 5;
            human._skills.fishing += 5;
            human._skills.travelling += 5;
            human._skills.noweapon += 10;
            return human;
        }
        Character.GenericHuman = GenericHuman;
        function HumanSteppe(x, y, name) {
            let human = GenericHuman(x, y, name, 'steppe_humans');
            human._skills.hunt += 20;
            human._skills.skinning += 10;
            human._skills.cooking += 10;
            human._skills.travelling += 30;
            human._skills.ranged += 20;
            human._skills.noweapon += 10;
            return human;
        }
        Character.HumanSteppe = HumanSteppe;
        function HumanStrong(x, y, name) {
            let human = Base(human_1.HumanStrongTemplate, name, undefined, x, y, undefined);
            return human;
        }
        Character.HumanStrong = HumanStrong;
        function HumanCity(x, y, name) {
            let human = GenericHuman(x, y, name, 'city');
            human._skills.fishing += 20;
            human._skills.noweapon += 5;
            return human;
        }
        Character.HumanCity = HumanCity;
        function HumanSpearman(x, y, name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(x, y, name);
                    break;
                }
                case "city": {
                    var human = HumanCity(x, y, name);
                    break;
                }
            }
            human._skills.polearms = 60;
            human._skills.evasion += 10;
            human._skills.blocking += 10;
            human._skills.ranged += 20;
            human.perks.advanced_polearm = true;
            let spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
            spear.durability = 200;
            let bow = system_1.ItemSystem.create(items_set_up_1.BASIC_BOW_ARGUMENT);
            let armour = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
            let pants = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT);
            let boots = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT);
            let hat = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_HELMET_ARGUMENT);
            human.equip.data.weapon = spear;
            human.equip.data.armour.body = armour;
            human.equip.data.armour.legs = pants;
            human.equip.data.armour.foot = boots;
            human.equip.data.armour.head = hat;
            human.equip.data.secondary = bow;
            human.stash.inc(materials_manager_1.ARROW_BONE, 60);
            return human;
        }
        Character.HumanSpearman = HumanSpearman;
        function HumanRatHunter(x, y, name) {
            let human = HumanSpearman(x, y, name, 'steppe');
            human.archetype.ai_map = 'rat_hunter';
            human._skills.skinning += 20;
            human._skills.hunt += 20;
            return human;
        }
        Character.HumanRatHunter = HumanRatHunter;
        function HumanCook(x, y, name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(x, y, name);
                    break;
                }
                case "city": {
                    var human = HumanCity(x, y, name);
                    break;
                }
            }
            human.stash.inc(materials_manager_1.FOOD, 10);
            human.savings.inc(500);
            human._skills.cooking = 70;
            human.perks.meat_master = true;
            return human;
        }
        Character.HumanCook = HumanCook;
        function HumanFletcher(x, y, name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(x, y, name);
                    break;
                }
                case "city": {
                    var human = HumanCity(x, y, name);
                    break;
                }
            }
            human._skills.woodwork = 80;
            human._skills.bone_carving = 30;
            human.perks.fletcher = true;
            human._skills.ranged = 30;
            human.stash.inc(materials_manager_1.ARROW_BONE, 50);
            human.stash.inc(materials_manager_1.RAT_BONE, 3);
            human.stash.inc(materials_manager_1.WOOD, 1);
            human.savings.inc(500);
            return human;
        }
        Character.HumanFletcher = HumanFletcher;
        function HumanCityGuard(x, y, name) {
            let human = HumanSpearman(x, y, name, 'city');
            human.archetype.ai_map = 'urban_guard';
            human._skills.polearms += 10;
            return human;
        }
        Character.HumanCityGuard = HumanCityGuard;
        function HumanLocalTrader(x, y, name, faction) {
            switch (faction) {
                case "steppe": {
                    var human = HumanSteppe(x, y, name);
                    break;
                }
                case "city": {
                    var human = HumanCity(x, y, name);
                    break;
                }
            }
            human.archetype.ai_map = 'urban_trader';
            human.savings.inc(800);
        }
        Character.HumanLocalTrader = HumanLocalTrader;
        function GenericRat(x, y, name) {
            let rat = Base(rat_1.RatTemplate, name, undefined, x, y, 'rats');
            rat.perks.claws = true;
            return rat;
        }
        Character.GenericRat = GenericRat;
        function MageRat(x, y, name) {
            let rat = Base(rat_1.MageRatTemplate, name, undefined, x, y, 'rats');
            rat.perks.claws = true;
            rat.perks.magic_bolt = true;
            rat.perks.mage_initiation = true;
            rat.stash.inc(materials_manager_1.ZAZ, 5);
            return rat;
        }
        Character.MageRat = MageRat;
        function BerserkRat(x, y, name) {
            let rat = Base(rat_1.BerserkRatTemplate, name, undefined, x, y, 'rats');
            rat.perks.claws = true;
            rat.perks.charge = true;
            rat._skills.noweapon = 40;
            return rat;
        }
        Character.BerserkRat = BerserkRat;
        function BigRat(x, y, name) {
            let rat = Base(rat_1.BigRatTemplate, name, undefined, x, y, 'rats');
            rat.perks.claws = true;
            rat._skills.noweapon = 40;
            return rat;
        }
        Character.BigRat = BigRat;
        function MageElo(x, y, name) {
            let elo = Base(elo_1.EloTemplate, name, undefined, x, y, 'elodino_free');
            elo.perks.magic_bolt = true;
            elo.perks.mage_initiation = true;
            elo._skills.magic_mastery = 20;
            elo._skills.cooking = 20;
            elo.stash.inc(materials_manager_1.ZAZ, 30);
            return elo;
        }
        Character.MageElo = MageElo;
        function Elo(x, y, name) {
            let elo = Base(elo_1.EloTemplate, name, undefined, x, y, 'elodino_free');
            return elo;
        }
        Character.Elo = Elo;
        function Graci(x, y, name) {
            let graci = Base(graci_1.GraciTemplate, name, undefined, x, y, 'graci');
            graci._skills.travelling = 70;
            return graci;
        }
        Character.Graci = Graci;
        function Mage(x, y, faction) {
            let mage = GenericHuman(x, y, 'Mage', faction);
            // let mage = Event.new_character(HumanTemplate, 'Mage', cell, dummy_model)
            mage._skills.magic_mastery = 100;
            mage.perks.mage_initiation = true;
            mage.perks.magic_bolt = true;
            return mage;
        }
        Character.Mage = Mage;
        function BloodMage(x, y, faction) {
            const blood_mage = Mage(x, y, faction);
            blood_mage.perks.blood_mage = true;
            return blood_mage;
        }
        Character.BloodMage = BloodMage;
        function Alchemist(x, y, faction) {
            let alchemist = GenericHuman(x, y, 'Alchemist', faction);
            alchemist._skills.magic_mastery = 60;
            alchemist.perks.mage_initiation = true;
            alchemist.perks.alchemist = true;
            alchemist.stash.inc(materials_manager_1.ZAZ, 5);
            alchemist.savings.inc(5000);
            return alchemist;
        }
        Character.Alchemist = Alchemist;
        function ArmourMaster(x, y) {
            let master = HumanCity(x, y, 'Armourer');
            master._skills.clothier = 100;
            master.perks.skin_armour_master = true;
            master.stash.inc(materials_manager_1.RAT_SKIN, 50);
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.ArmourMaster = ArmourMaster;
        function Shoemaker(x, y) {
            let master = HumanCity(x, y, 'Shoemaker');
            master._skills.clothier = 100;
            master.perks.shoemaker = true;
            master.stash.inc(materials_manager_1.RAT_SKIN, 50);
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.Shoemaker = Shoemaker;
        function WeaponMasterWood(x, y, faction) {
            let master = GenericHuman(x, y, 'Weapons maker', faction);
            master._skills.woodwork = 100;
            master.perks.weapon_maker = true;
            master.stash.inc(materials_manager_1.WOOD, 15);
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.WeaponMasterWood = WeaponMasterWood;
        function WeaponMasterBone(x, y, faction) {
            let master = GenericHuman(x, y, 'Weapons maker', faction);
            master._skills.bone_carving = 100;
            master.perks.weapon_maker = true;
            master.stash.inc(materials_manager_1.RAT_BONE, 40);
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.WeaponMasterBone = WeaponMasterBone;
        function MasterUnarmed(x, y, faction) {
            let master = GenericHuman(x, y, 'Monk', faction);
            master._skills.noweapon = 100;
            master.perks.dodge = true;
            master.perks.advanced_unarmed = true;
            master.savings.inc(LUMP_OF_MONEY);
            return master;
        }
        Character.MasterUnarmed = MasterUnarmed;
        function Ball(x, y, name) {
            return Base(others_1.BallTemplate, name, undefined, x, y, undefined);
        }
        Character.Ball = Ball;
    })(Character = Template.Character || (Template.Character = {}));
})(Template = exports.Template || (exports.Template = {}));
