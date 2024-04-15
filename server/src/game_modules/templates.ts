import { money } from "@custom_types/common"
import { location_id } from "@custom_types/ids"
import { Event } from "./events/events"
import { ItemSystem } from "./systems/items/item_system"
import { ElodinoTemplate } from "./races/TEMPLATE_ELO"
import { GraciTemplate } from "./races/TEMPLATE_GRACI"
import { HumanStrongTemplate, HumanTemplate } from "./races/TEMPLATE_HUMANS"
import { BerserkRatTemplate, BigRatTemplate, MageRatTemplate, RatTemplate } from "./races/TEMPLATE_RATS"
import { CharacterTemplate, ModelVariant } from "./types"
import { BallTemplate } from "./races/TEMPLATE_OTHERS"
import { Character } from "./character/character"
import { DataID } from "./data/data_id"
import { Data } from "./data/data_objects"
import { ARMOUR, EQUIP_SLOT, MATERIAL, WEAPON } from "@content/content"

const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money

export namespace Template {
    export namespace Character {


        function Base(
            template:CharacterTemplate,
            name: string|undefined,
            model: ModelVariant|undefined,
            location: location_id,
            faction_id: string|undefined
        ): Character
        function Base(
            template:CharacterTemplate,
            name: string|undefined,
            model: ModelVariant|undefined,
            location: location_id|undefined,
            faction_id: string
        ): Character
        function Base(
            template:CharacterTemplate,
            name: string|undefined,
            model: ModelVariant|undefined,
            location: location_id|undefined,
            faction_id: string|undefined
        ): Character|undefined
        function Base(
            template:CharacterTemplate,
            name: string|undefined,
            model: ModelVariant|undefined,
            location: location_id|undefined,
            faction_id: string|undefined
        ): Character|undefined {
            if (faction_id != undefined)
                location = DataID.Faction.spawn(faction_id)

            if (location == undefined) {
                console.log("attempt to generate character without location")
                return undefined
            }

            let character = Event.new_character(template, name, location, model)

            if (faction_id != undefined) {
                character.home_location_id = DataID.Faction.spawn(faction_id)
            }

            if (faction_id != undefined) DataID.Reputation.set(character.id, faction_id, "member")
            return character
        }

        export function GenericHuman(name:string|undefined, faction: string) {
            let human = Base(HumanTemplate, name, undefined, undefined, faction)
            human._skills.woodwork += 10
            human._skills.cooking += 15
            human._skills.hunt += 5
            human._skills.fishing += 5
            human._skills.travelling += 5
            human._skills.noweapon += 10
            return human
        }

        export function HumanSteppe(name:string|undefined) {
            let human = GenericHuman(name, 'steppe_humans')
            human._skills.hunt += 20
            human._skills.skinning += 10
            human._skills.cooking += 10
            human._skills.travelling += 30
            human._skills.ranged += 20
            human._skills.noweapon += 10
            return human
        }

        export function Lumberjack(name: string) {
            let human = HumanSteppe(name)


            human._skills.travelling += 20
            human.ai_map = 'lumberjack'

            let cutting_tool = Data.Items.create_weapon(100, [], WEAPON.DAGGER_BONE_RAT)
            cutting_tool.durability = 200
            human.equip.weapon = cutting_tool

            return human
        }

        export function Fisherman(name: string) {
            let human = HumanSteppe(name)


            human._skills.travelling += 20
            human._skills.fishing += 40
            human.ai_map = 'fisherman'

            return human
        }

        export function HumanStrong(location: location_id, name: string|undefined) {
            let human = Base(HumanStrongTemplate, name, undefined, location, undefined)


            return human
        }

        export function HumanCity(name: string|undefined) {
            let human = GenericHuman(name, 'city')

            human._skills.fishing += 20
            human._skills.noweapon += 5
            return human
        }

        export function HumanSpearman(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human._skills.polearms = 60
            human._skills.evasion += 10
            human._skills.blocking += 10
            human._skills.ranged += 20
            human._perks.advanced_polearm = true
            let spear = Data.Items.create_weapon(100, [], WEAPON.SPEAR_WOOD_BONE)
            spear.durability = 200
            let bow = Data.Items.create_weapon(100, [], WEAPON.BOW_WOOD)
            let armour = Data.Items.create_armour(100, [], ARMOUR.MAIL_LEATHER_RAT)
            let pants = Data.Items.create_armour(100, [], ARMOUR.PANTS_LEATHER_RAT)
            let boots = Data.Items.create_armour(100, [], ARMOUR.BOOTS_LEATHER_RAT)
            let hat = Data.Items.create_armour(100, [], ARMOUR.HELMET_LEATHER_RAT)
            human.equip.weapon = spear
            human.equip.data.slots[EQUIP_SLOT.MAIL] = armour.id
            human.equip.data.slots[EQUIP_SLOT.PANTS] = pants.id
            human.equip.data.slots[EQUIP_SLOT.BOOTS] = boots.id
            human.equip.data.slots[EQUIP_SLOT.HELMET] = hat.id
            human.equip.data.slots[EQUIP_SLOT.SECONDARY] = bow.id

            human.stash.inc(MATERIAL.ARROW_BONE, 60)
            return human
        }

        export function EquipClothesBasic(character: Character) {
            character.equip.data.slots[EQUIP_SLOT.MAIL] = Data.Items.create_armour(100, [], ARMOUR.MAIL_TEXTILE).id
            character.equip.data.slots[EQUIP_SLOT.BOOTS] = Data.Items.create_armour(100, [], ARMOUR.BOOTS_LEATHER_RAT).id
            character.equip.data.slots[EQUIP_SLOT.PANTS] = Data.Items.create_armour(100, [], ARMOUR.PANTS_TEXTILE).id
            character.equip.data.slots[EQUIP_SLOT.SHIRT] = Data.Items.create_armour(100, [], ARMOUR.SHIRT_TEXTILE).id

            return character
        }

        export function EquipClothesRich(character: Character) {
            EquipClothesBasic(character)

            character.equip.data.slots[EQUIP_SLOT.ROBE] = Data.Items.create_armour(100, [], ARMOUR.ROBE_LEATHER_RAT).id
            character.equip.data.slots[EQUIP_SLOT.GAUNTLET_RIGHT] = Data.Items.create_armour(100, [], ARMOUR.GAUNTLET_RIGHT_TEXTILE).id
            character.equip.data.slots[EQUIP_SLOT.GAUNTLET_LEFT] = Data.Items.create_armour(100, [], ARMOUR.GAUNTLET_LEFT_TEXTILE).id
            character.equip.data.slots[EQUIP_SLOT.HELMET] = Data.Items.create_armour(100, [], ARMOUR.HELMET_TEXTILE).id

            return character
        }

        export function HumanRatHunter(name: string|undefined) {
            let human = HumanSpearman(name, 'steppe')


            human.ai_map = 'rat_hunter'
            human._skills.skinning += 20
            human._skills.hunt += 20
            return human
        }

        export function HumanCook(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human.stash.inc(MATERIAL.FISH_OKU_FRIED, 10)
            human.stash.inc(MATERIAL.MEAT_RAT_FRIED, 10)
            human.savings.inc(500 as money)
            human._skills.cooking = 70
            human._perks.meat_master = true
            return human
        }

        export function HumanFletcher(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human._skills.woodwork = 80
            human._skills.bone_carving = 30
            human._perks.fletcher = true
            human._skills.ranged = 30

            human.stash.inc(MATERIAL.ARROW_BONE, 50)
            human.stash.inc(MATERIAL.SMALL_BONE_RAT, 3)
            human.stash.inc(MATERIAL.WOOD_RED, 1)

            human.savings.inc(500 as money)
            return human
        }

        export function HumanCityGuard(name: string|undefined) {
            let human = HumanSpearman(name, 'city')


            human.ai_map = 'urban_guard'
            human._skills.polearms += 10
            return human
        }

        export function HumanLocalTrader(name: string|undefined, faction:'city'|'steppe'){
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }

            human.ai_map = 'urban_trader'
            human.savings.inc(800 as money)
            return human
        }

        export function GenericRat(name:string|undefined) {
            let rat = Base(RatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            return rat
        }

        export function MageRat(name:string|undefined) {
            let rat = Base(MageRatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            rat._perks.magic_bolt = true
            rat._perks.mage_initiation = true
            rat.stash.inc(MATERIAL.ZAZ, 5)
            return rat
        }

        export function BerserkRat(name:string|undefined) {
            let rat = Base(BerserkRatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            rat._perks.charge = true
            rat._skills.noweapon = 40
            return rat
        }

        export function BigRat(name: string|undefined) {
            let rat = Base(BigRatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            rat._skills.noweapon = 40
            return rat
        }

        export function MageElo(name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, undefined, 'elodino_free')

            elo._perks.magic_bolt = true
            elo._perks.mage_initiation = true
            elo._skills.magic_mastery = 20
            elo._skills.cooking = 20
            elo.stash.inc(MATERIAL.ZAZ, 30)
            return elo
        }

        export function Elo(name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, undefined, 'elodino_free')
            if (elo == undefined) return undefined;

            return elo
        }

        export function Graci(name: string|undefined) {
            let graci = Base(GraciTemplate, name, undefined, undefined, 'graci')

            graci._skills.travelling = 70
            return graci
        }


        export function Mage(faction: string) {
            let mage = GenericHuman('Mage', faction)

            mage._skills.magic_mastery = 100
            mage._perks.mage_initiation = true
            mage._perks.magic_bolt = true

            let item = Data.Items.create_weapon_simple(WEAPON.SPEAR_WOOD)
            item.affixes.push({tag: 'of_power'})
            item.affixes.push({tag: 'of_power'})
            mage.equip.weapon = item

            return mage
        }

        export function BloodMage(faction: string) {
            const mage = Mage(faction)
            mage._perks.blood_mage = true

            return mage
        }

        export function Alchemist(faction: string) {
            let alchemist = GenericHuman('Alchemist', faction)

            alchemist._skills.magic_mastery = 60
            alchemist._perks.mage_initiation = true
            alchemist._perks.alchemist = true

            alchemist.stash.inc(MATERIAL.ZAZ, 5)
            alchemist.savings.inc(5000 as money)

            return alchemist
        }

        export function ArmourMaster() {
            let master = HumanCity('Armourer')

            master._skills.clothier = 100
            master._perks.skin_armour_master = true
            master.stash.inc(MATERIAL.LEATHER_RAT, 50)
            master.savings.inc(TONS_OF_MONEY)
            return master
        }

        export function Shoemaker() {
            let master = HumanCity('Shoemaker')

            master._skills.clothier = 100
            master._perks.shoemaker = true
            master.stash.inc(MATERIAL.LEATHER_RAT, 50)
            master.savings.inc(TONS_OF_MONEY)
            return master
        }

        export function WeaponMasterWood(faction: string) {
            let master = GenericHuman('Weapons maker', faction)

            master._skills.woodwork = 100
            master._perks.weapon_maker = true
            master.stash.inc(MATERIAL.WOOD_RED, 15)
            master.savings.inc(TONS_OF_MONEY)

            return master
        }

        export function WeaponMasterBone(faction: string) {
            let master = GenericHuman('Weapons maker', faction)

            master._skills.bone_carving = 100
            master._perks.weapon_maker = true
            master.stash.inc(MATERIAL.BONE_RAT, 40)
            master.savings.inc(TONS_OF_MONEY)

            return master
        }

        export function MasterUnarmed(faction: string) {
            let master = GenericHuman('Monk', faction)

            master._skills.noweapon = 100
            master._perks.dodge = true
            master._perks.advanced_unarmed = true
            master.savings.inc(LUMP_OF_MONEY)

            return master
        }

        export function Ball(location: location_id, name: string | undefined) {
            return Base(BallTemplate, name, undefined, location, undefined)
        }
    }
}
