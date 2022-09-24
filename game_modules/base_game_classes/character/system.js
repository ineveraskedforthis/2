"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterSystem = void 0;
const character_1 = require("./character");
var last_character_id = 0;
var character_list = [];
var characters_dict = {};
var CharacterSystem;
(function (CharacterSystem) {
    function template_to_character(template, name, cell_id) {
        last_character_id = last_character_id + 1;
        if (name == undefined)
            name = template.name_generator();
        let character = new character_1.Character(last_character_id, -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp);
        character.stats.base_resists.add_object(template.base_resists);
        characters_dict[character.id] = character;
        character_list.push(character);
        return character;
    }
    CharacterSystem.template_to_character = template_to_character;
    function id_to_character(id) {
        return characters_dict[id];
    }
    CharacterSystem.id_to_character = id_to_character;
})(CharacterSystem = exports.CharacterSystem || (exports.CharacterSystem = {}));
