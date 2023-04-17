import { CharacterTemplate } from "./character/templates"
import { Data } from "./data"
import { Event } from "./events/events"
import { Factions } from "./factions"
import { ZAZ } from "./manager_classes/materials_manager"
import { MapSystem } from "./map/system"
import { EloTemplate } from "./races/elo"
import { GraciTemplate } from "./races/graci"
import { HumanStrongTemplate, HumanTemplate } from "./races/human"
import { BerserkRatTemplate, BigRatTemplate, MageRatTemplate, RatTemplate } from "./races/rat"
import { ModelVariant } from "./types"

export namespace Template {
    export namespace Character {
        function Base(template:CharacterTemplate, name: string|undefined, model: ModelVariant|undefined ,x: number, y: number, faction_id: number|undefined) {
            const cell = MapSystem.coordinate_to_id(x, y)
            let character = Event.new_character(template, name, cell, model)
            if (faction_id != undefined) Data.Reputation.set(faction_id, character.id, "member")
            return character
        }

        export function GenericHuman(x: number, y: number, name:string|undefined, faction: number) {
            let human = Base(HumanTemplate, name, undefined, x, y, faction)
            human.skills.woodwork += 10
            human.skills.cooking += 15
            human.skills.hunt += 5
            human.skills.fishing += 5
            human.skills.travelling += 5
            human.skills.noweapon += 10
            return human
        }

        export function HumanSteppe(x: number, y: number, name:string|undefined) {
            let human = GenericHuman(x, y, name, Factions.Steppes.id)
            human.skills.hunt += 20
            human.skills.skinning += 10
            human.skills.cooking += 10
            human.skills.travelling += 30
            human.skills.ranged += 20
            human.skills.noweapon += 10
            return human
        }

        export function HumanStrong(x: number, y: number, name: string|undefined) {
            let human = Base(HumanStrongTemplate, name, undefined, x, y, undefined)
            return human
        }

        export function HumanCity(x: number, y: number, name: string|undefined) {
            let human = GenericHuman(x, y, name, Factions.City.id)
            human.skills.fishing += 20
            human.skills.noweapon += 5
            return human
        }

        export function GenericRat(x: number, y: number, name:string|undefined) {
            let rat = Base(RatTemplate, name, undefined, x, y, Factions.Rats.id)
            rat.perks.claws = true
            return rat
        }

        export function MageRat(x: number, y: number, name:string|undefined) {
            let rat = Base(MageRatTemplate, name, undefined, x, y, Factions.Rats.id)
            rat.perks.claws = true
            rat.perks.magic_bolt = true
            rat.perks.mage_initiation = true            
            rat.stash.inc(ZAZ, 5)
            return rat
        }

        export function BerserkRat(x: number, y: number, name:string|undefined) {
            let rat = Base(BerserkRatTemplate, name, undefined, x, y, Factions.Rats.id)
            rat.perks.claws = true
            rat.perks.charge = true
            rat.skills.noweapon = 40
            return rat
        }

        export function BigRat(x: number, y: number, name: string|undefined) {
            let rat = Base(BigRatTemplate, name, undefined, x, y, Factions.Rats.id)
            rat.perks.claws = true
            rat.skills.noweapon = 40
            return rat
        }

        export function MageElo(x: number, y: number, name:string|undefined) {
            let elo = Base(EloTemplate, name, undefined, x, y, Factions.Elodinos.id)
            elo.perks.magic_bolt = true
            elo.perks.mage_initiation = true
            elo.skills.magic_mastery = 20
            elo.skills.cooking = 20
            elo.stash.inc(ZAZ, 30)
            return elo
        }

        export function Elo(x: number, y: number, name:string|undefined) {
            let elo = Base(EloTemplate, name, undefined, x, y, Factions.Elodinos.id)
            return elo
        }

        export function Graci(x: number, y: number, name: string|undefined) {
            let graci = Base(GraciTemplate, name, undefined, x, y, Factions.Graci.id)
            graci.skills.travelling = 70
            return graci
        }
    }
}
