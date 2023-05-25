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
            human.skills.woodwork += 10;
            human.skills.cooking += 15;
            human.skills.hunt += 5;
            human.skills.fishing += 5;
            human.skills.travelling += 5;
            human.skills.noweapon += 10;
            return human;
        }
        Character.GenericHuman = GenericHuman;
        function HumanSteppe(x, y, name) {
            let human = GenericHuman(x, y, name, 'steppe_humans');
            human.skills.hunt += 20;
            human.skills.skinning += 10;
            human.skills.cooking += 10;
            human.skills.travelling += 30;
            human.skills.ranged += 20;
            human.skills.noweapon += 10;
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
            human.skills.fishing += 20;
            human.skills.noweapon += 5;
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
            human.skills.polearms = 60;
            human.skills.evasion += 10;
            human.skills.blocking += 10;
            human.perks.advanced_polearm = true;
            let spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
            spear.durability = 200;
            let armour = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
            let pants = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_PANTS_ARGUMENT);
            human.equip.data.weapon = spear;
            human.equip.data.armour.body = armour;
            human.equip.data.armour.legs = pants;
            return human;
        }
        Character.HumanSpearman = HumanSpearman;
        function HumanRatHunter(x, y, name) {
            let human = HumanSpearman(x, y, name, 'steppe');
            human.archetype.ai_map = 'rat_hunter';
            human.skills.skinning += 20;
            human.skills.hunt += 20;
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
            human.skills.cooking = 70;
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
            human.skills.woodwork = 80;
            human.perks.fletcher = true;
            human.skills.ranged = 30;
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
            human.skills.polearms += 10;
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
            rat.skills.noweapon = 40;
            return rat;
        }
        Character.BerserkRat = BerserkRat;
        function BigRat(x, y, name) {
            let rat = Base(rat_1.BigRatTemplate, name, undefined, x, y, 'rats');
            rat.perks.claws = true;
            rat.skills.noweapon = 40;
            return rat;
        }
        Character.BigRat = BigRat;
        function MageElo(x, y, name) {
            let elo = Base(elo_1.EloTemplate, name, undefined, x, y, 'elodino_free');
            elo.perks.magic_bolt = true;
            elo.perks.mage_initiation = true;
            elo.skills.magic_mastery = 20;
            elo.skills.cooking = 20;
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
            graci.skills.travelling = 70;
            return graci;
        }
        Character.Graci = Graci;
    })(Character = Template.Character || (Template.Character = {}));
})(Template = exports.Template || (exports.Template = {}));
