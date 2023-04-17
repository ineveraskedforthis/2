"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fish = exports.hunt = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const events_1 = require("../events/events");
const effects_1 = require("../events/effects");
exports.hunt = {
    duration(char) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_hunt()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let skill = char.skills.hunt;
        let skinning = char.skills.skinning;
        effects_1.Effect.Change.fatigue(char, 10);
        let amount_meat = Math.floor(skill / 10) + 1;
        let amount_skin = Math.max(Math.floor(skill / 20));
        if (Math.random() < 0.1) {
            amount_meat += 10;
            amount_skin += 1;
        }
        if (Math.random() * Math.random() > skill / 100) {
            effects_1.Effect.Change.skill(char, 'hunt', 1);
            effects_1.Effect.Change.stress(char, 1);
        }
        if (amount_skin * Math.random() > skinning / 20) {
            effects_1.Effect.Change.skill(char, 'skinning', 1);
        }
        events_1.Event.change_stash(char, materials_manager_1.MEAT, amount_meat);
        events_1.Event.change_stash(char, materials_manager_1.RAT_SKIN, amount_skin);
    },
    start: function (char, data) {
    },
};
exports.fish = {
    duration(char) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.fishing) / 100;
    },
    check: function (char, data) {
        if (!char.in_battle()) {
            let cell = systems_communication_1.Convert.character_to_cell(char);
            if (cell == undefined) {
                return 6 /* CharacterActionResponce.INVALID_CELL */;
            }
            if (cell.can_fish()) {
                return 1 /* CharacterActionResponce.OK */;
            }
            else {
                return 3 /* CharacterActionResponce.NO_RESOURCE */;
            }
        }
        else
            return 2 /* CharacterActionResponce.IN_BATTLE */;
    },
    result: function (char, data) {
        let skill = char.skills.fishing;
        effects_1.Effect.Change.fatigue(char, 10);
        let amount = Math.floor(skill / 20) + 1;
        if (Math.random() < 0.01) {
            amount += 10;
        }
        if (Math.random() < 0.0001) {
            amount += 100;
        }
        if (Math.random() * Math.random() > skill / 100) {
            effects_1.Effect.Change.skill(char, 'fishing', 1);
            effects_1.Effect.Change.stress(char, 1);
        }
        events_1.Event.change_stash(char, materials_manager_1.FISH, amount);
    },
    start: function (char, data) {
    },
};
