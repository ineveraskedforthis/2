import { cell_id, money } from "@custom_types/common"
import { CharacterTemplate } from "./character/templates"
import { Data } from "./data"
import { Event } from "./events/events"
// import { Factions } from "./factions"
import { BONE_SPEAR_ARGUMENT, RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_PANTS_ARGUMENT } from "./items/items_set_up"
import { ItemSystem } from "./items/system"
import { ARROW_BONE, ELODINO_FLESH, FOOD, GRACI_HAIR, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./manager_classes/materials_manager"
import { MapSystem } from "./map/system"
import { EloTemplate } from "./races/elo"
import { GraciTemplate } from "./races/graci"
import { HumanStrongTemplate, HumanTemplate } from "./races/human"
import { BerserkRatTemplate, BigRatTemplate, MageRatTemplate, RatTemplate } from "./races/rat"
import { ModelVariant } from "./types"
import { EventMarket } from "./events/market"

const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money

export namespace Template {
    export namespace Character {
        function Base(template:CharacterTemplate, name: string|undefined, model: ModelVariant|undefined ,x: number, y: number, faction_id: string|undefined) {
            const cell = Data.World.coordinate_to_id([x, y])
            let character = Event.new_character(template, name, cell, model)
            if (faction_id != undefined) Data.Reputation.set(faction_id, character.id, "member")
            return character
        }

        export function GenericHuman(x: number, y: number, name:string|undefined, faction: string) {
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
            let human = GenericHuman(x, y, name, 'steppe_humans')
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
            let human = GenericHuman(x, y, name, 'city')
            human.skills.fishing += 20
            human.skills.noweapon += 5
            return human
        }

        export function HumanSpearman(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }
            
            human.skills.polearms = 60
            human.skills.evasion += 10
            human.skills.blocking += 10
            human.perks.advanced_polearm = true
            let spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
            spear.durability = 200
            let armour = ItemSystem.create(RAT_SKIN_ARMOUR_ARGUMENT)
            let pants = ItemSystem.create(RAT_SKIN_PANTS_ARGUMENT)
            human.equip.data.weapon = spear
            human.equip.data.armour.body = armour
            human.equip.data.armour.legs = pants
            return human
        }

        export function HumanRatHunter(x: number, y: number, name: string|undefined) {
            let human = HumanSpearman(x, y, name, 'steppe')
            human.archetype.ai_map = 'rat_hunter'
            human.skills.skinning += 20
            human.skills.hunt += 20
            return human
        }

        export function HumanCook(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human.stash.inc(FOOD, 10)
            human.savings.inc(500 as money)
            human.skills.cooking = 70
            human.perks.meat_master = true
            return human
        }

        export function HumanFletcher(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human.skills.woodwork = 80
            human.perks.fletcher = true
            human.skills.ranged = 30

            human.stash.inc(ARROW_BONE, 50)
            human.stash.inc(RAT_BONE, 3)
            human.stash.inc(WOOD, 1)

            human.savings.inc(500 as money)
            return human
        }

        export function HumanCityGuard(x: number, y: number, name: string|undefined) {
            let human = HumanSpearman(x, y, name, 'city')
            human.archetype.ai_map = 'urban_guard'
            human.skills.polearms += 10
            return human
        }

        export function HumanLocalTrader(x: number, y: number, name: string|undefined, faction:'city'|'steppe'){
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human.archetype.ai_map = 'urban_trader'
            human.savings.inc(800 as money)
        }

        export function GenericRat(x: number, y: number, name:string|undefined) {
            let rat = Base(RatTemplate, name, undefined, x, y, 'rats')
            rat.perks.claws = true
            return rat
        }

        export function MageRat(x: number, y: number, name:string|undefined) {
            let rat = Base(MageRatTemplate, name, undefined, x, y, 'rats')
            rat.perks.claws = true
            rat.perks.magic_bolt = true
            rat.perks.mage_initiation = true            
            rat.stash.inc(ZAZ, 5)
            return rat
        }

        export function BerserkRat(x: number, y: number, name:string|undefined) {
            let rat = Base(BerserkRatTemplate, name, undefined, x, y, 'rats')
            rat.perks.claws = true
            rat.perks.charge = true
            rat.skills.noweapon = 40
            return rat
        }

        export function BigRat(x: number, y: number, name: string|undefined) {
            let rat = Base(BigRatTemplate, name, undefined, x, y, 'rats')
            rat.perks.claws = true
            rat.skills.noweapon = 40
            return rat
        }

        export function MageElo(x: number, y: number, name:string|undefined) {
            let elo = Base(EloTemplate, name, undefined, x, y, 'elodino_free')
            elo.perks.magic_bolt = true
            elo.perks.mage_initiation = true
            elo.skills.magic_mastery = 20
            elo.skills.cooking = 20
            elo.stash.inc(ZAZ, 30)
            return elo
        }

        export function Elo(x: number, y: number, name:string|undefined) {
            let elo = Base(EloTemplate, name, undefined, x, y, 'elodino_free')
            return elo
        }

        export function Graci(x: number, y: number, name: string|undefined) {
            let graci = Base(GraciTemplate, name, undefined, x, y, 'graci')
            graci.skills.travelling = 70
            return graci
        }


        export function Mage(x: number, y: number, faction: string) {
            let mage = GenericHuman(x, y, 'Mage', faction)
            // let mage = Event.new_character(HumanTemplate, 'Mage', cell, dummy_model)

            mage.skills.magic_mastery = 100
            mage.perks.mage_initiation = true
            mage.perks.magic_bolt = true

            return mage
        }

        export function BloodMage(x: number, y: number, faction: string) {
            const blood_mage = Mage(x, y, faction)
            blood_mage.perks.blood_mage = true

            return blood_mage
        }

        export function Alchemist(x: number, y: number, faction: string) {
            let alchemist = GenericHuman(x, y, 'Alchemist', faction)

            alchemist.skills.magic_mastery = 60
            alchemist.perks.mage_initiation = true
            alchemist.perks.alchemist = true

            alchemist.stash.inc(ZAZ, 5)
            alchemist.savings.inc(5000 as money)

            return alchemist
        }

        export function ArmourMaster(x: number, y: number) {
            let master = HumanCity(x, y, 'Armourer')
            master.skills.clothier = 100
            master.perks.skin_armour_master = true
            master.stash.inc(RAT_SKIN, 50)
            master.savings.inc(LUMP_OF_MONEY)            
            return master
        }

        export function Shoemaker(x: number, y: number) {
            let master = HumanCity(x, y, 'Shoemaker')
            master.skills.clothier = 100
            master.perks.shoemaker = true
            master.stash.inc(RAT_SKIN, 50)
            master.savings.inc(LUMP_OF_MONEY)            
            return master
        }

        export function WeaponMasterWood(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Weapons maker', faction)

            master.skills.woodwork = 100
            master.perks.weapon_maker = true
            master.stash.inc(WOOD, 15)
            master.savings.inc(LUMP_OF_MONEY)
            
            return master
        }

        export function WeaponMasterBone(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Weapons maker', faction)

            master.skills.bone_carving = 100
            master.perks.weapon_maker = true
            master.stash.inc(RAT_BONE, 40)
            master.savings.inc(LUMP_OF_MONEY)
            
            return master
        }

        export function MasterUnarmed(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Monk', faction)
            master.skills.noweapon = 100
            master.perks.dodge = true
            master.perks.advanced_unarmed = true
            master.savings.inc(LUMP_OF_MONEY)

            return master
        }
    }
}
