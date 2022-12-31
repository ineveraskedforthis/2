import { ModelVariant } from "./character/character_parts"
import { CharacterTemplate } from "./character/templates"
import { Data } from "./data"
import { Event } from "./events/events"
import { Factions } from "./factions"
import { ZAZ } from "./manager_classes/materials_manager"
import { MapSystem } from "./map/system"
import { EloTemplate } from "./races/elo"
import { MageRatTemplate } from "./races/rat"

export namespace Template {
    export namespace Character {
        function Base(template:CharacterTemplate, name: string|undefined, model: ModelVariant|undefined ,x: number, y: number, faction_id: number) {
            const cell = MapSystem.coordinate_to_id(x, y)
            let character = Event.new_character(template, name, cell, model)
            Data.Reputation.set(faction_id, character.id, "member")
            return character
        }

        export function MageRat(x: number, y: number) {
            let rat = Base(MageRatTemplate, undefined, undefined, x, y, Factions.Rats.id)
            rat.perks.magic_bolt = true
            rat.perks.mage_initiation = true
            rat.stash.inc(ZAZ, 5)
            return rat
        }

        export function MageElo(x: number, y: number) {
            let elo = Base(EloTemplate, undefined, undefined, x, y, Factions.Elodinos.id)
            elo.perks.magic_bolt = true
            elo.perks.mage_initiation = true
            elo.stash.inc(ZAZ, 30)
            return elo
        }
    }
}
