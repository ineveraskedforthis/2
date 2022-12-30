"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const data_1 = require("./data");
const events_1 = require("./events/events");
const factions_1 = require("./factions");
const materials_manager_1 = require("./manager_classes/materials_manager");
const system_1 = require("./map/system");
const rat_1 = require("./races/rat");
var Template;
(function (Template) {
    let Character;
    (function (Character) {
        function Base(template, name, model, x, y, faction_id) {
            const cell = system_1.MapSystem.coordinate_to_id(x, y);
            let character = events_1.Event.new_character(template, name, cell, model);
            data_1.Data.Reputation.set(faction_id, character.id, "member");
            return character;
        }
        function MageRat(x, y) {
            let rat = Base(rat_1.MageRatTemplate, undefined, undefined, x, y, factions_1.Factions.Rats.id);
            rat.perks.magic_bolt = true;
            rat.perks.mage_initiation = true;
            rat.stash.inc(materials_manager_1.ZAZ, 5);
            return rat;
        }
        Character.MageRat = MageRat;
    })(Character = Template.Character || (Template.Character = {}));
})(Template = exports.Template || (exports.Template = {}));
