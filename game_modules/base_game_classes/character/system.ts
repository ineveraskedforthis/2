import { cell_id, char_id } from "../../types";
import { Character } from "./character";
import { CharacterTemplate } from "./templates";

var last_character_id = 0
var character_list:Character[]                  = []
var characters_dict:{[_ in char_id]: Character} = {}


export namespace CharacterSystem {
    export function template_to_character(template: CharacterTemplate, name: string|undefined, cell_id: cell_id) {
        last_character_id = last_character_id + 1
        if (name == undefined) name = template.name_generator()
        let character = new Character(last_character_id, -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp)
        character.stats.base_resists.add_object(template.base_resists)
        characters_dict[character.id] = character
        character_list.push(character)
        return character
    }

    export function id_to_character(id: char_id): Character {
        return characters_dict[id]
    }
}