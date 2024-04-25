import { money } from "@custom_types/common"
import { location_id } from "@custom_types/ids"
import { Event } from "./events/events"
import { ElodinoTemplate } from "./races/TEMPLATE_ELO"
import { GraciTemplate } from "./races/TEMPLATE_GRACI"
import { HumanStrongTemplate, HumanTemplate } from "./races/TEMPLATE_HUMANS"
import { BerserkRatTemplate, BigRatTemplate, MageRatTemplate, RatTemplate } from "./races/TEMPLATE_RATS"
import { CharacterTemplate, ModelVariant } from "./types"
import { BallTemplate } from "./races/TEMPLATE_OTHERS"
import { Character } from "./data/entities/character"
import { DataID } from "./data/data_id"
import { Data } from "./data/data_objects"
import { ARMOUR, EQUIP_SLOT, MATERIAL, PERK, SKILL, WEAPON } from "@content/content"

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
            human._skills[SKILL.WOODWORKING] += 10
            human._skills[SKILL.COOKING] += 15
            human._skills[SKILL.HUNTING] += 5
            human._skills[SKILL.FISHING] += 5
            human._skills[SKILL.TRAVELLING] += 5
            human._skills[SKILL.UNARMED] += 10
            return human
        }

        export function HumanSteppe(name:string|undefined) {
            let human = GenericHuman(name, 'steppe_humans')
            human._skills[SKILL.HUNTING] += 20
            human._skills[SKILL.SKINNING] += 10
            human._skills[SKILL.COOKING] += 10
            human._skills[SKILL.TRAVELLING] += 30
            human._skills[SKILL.RANGED] += 20
            human._skills[SKILL.UNARMED] += 10
            return human
        }

        export function Lumberjack(name: string) {
            let human = HumanSteppe(name)


            human._skills[SKILL.TRAVELLING] += 20
            human.ai_map = 'lumberjack'

            let cutting_tool = Data.Items.create_weapon(100, [], WEAPON.DAGGER_BONE_RAT)
            cutting_tool.durability = 200
            human.equip.weapon_id = cutting_tool.id

            return human
        }

        export function Fisherman(name: string) {
            let human = HumanSteppe(name)


            human._skills[SKILL.TRAVELLING] += 20
            human._skills[SKILL.FISHING] += 40
            human.ai_map = 'fisherman'

            return human
        }

        export function HumanStrong(location: location_id, name: string|undefined) {
            let human = Base(HumanStrongTemplate, name, undefined, location, undefined)


            return human
        }

        export function HumanCity(name: string|undefined) {
            let human = GenericHuman(name, 'city')

            human._skills[SKILL.FISHING] += 20
            human._skills[SKILL.UNARMED] += 5
            return human
        }

        export function HumanSpearman(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human._skills[SKILL.POLEARMS] += 60
            human._skills[SKILL.EVASION] += 10
            human._skills[SKILL.BLOCKING] += 10
            human._skills[SKILL.RANGED] += 20
            human._perks[PERK.PRO_FIGHTER_POLEARMS] = 1
            let spear = Data.Items.create_weapon(100, [], WEAPON.SPEAR_WOOD_RED_BONE_RAT)
            spear.durability = 200
            let bow = Data.Items.create_weapon(100, [], WEAPON.BOW_WOOD)
            let armour = Data.Items.create_armour(100, [], ARMOUR.MAIL_LEATHER_RAT)
            let pants = Data.Items.create_armour(100, [], ARMOUR.PANTS_LEATHER_RAT)
            let boots = Data.Items.create_armour(100, [], ARMOUR.BOOTS_LEATHER_RAT)
            let hat = Data.Items.create_armour(100, [], ARMOUR.HELMET_LEATHER_RAT)
            human.equip.weapon_id = spear.id
            human.equip.data.slots[EQUIP_SLOT.MAIL] = armour.id
            human.equip.data.slots[EQUIP_SLOT.PANTS] = pants.id
            human.equip.data.slots[EQUIP_SLOT.BOOTS] = boots.id
            human.equip.data.slots[EQUIP_SLOT.HELMET] = hat.id
            human.equip.data.slots[EQUIP_SLOT.SECONDARY] = bow.id

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
            human._skills[SKILL.SKINNING] += 20
            human._skills[SKILL.HUNTING] += 20
            return human
        }

        export function HumanCook(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human.savings.inc(500 as money)
            human._skills[SKILL.COOKING] = 70
            human._perks[PERK.PRO_BUTCHER] = 1
            return human
        }

        export function HumanFletcher(name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(name);break}
                case "city":{var human = HumanCity(name);break}
            }


            human._skills[SKILL.WOODWORKING] = 80
            human._skills[SKILL.BONE_CARVING] = 30
            human._perks[PERK.PRO_FLETCHER] = 1
            human._skills[SKILL.FLETCHING] = 70


            human.savings.inc(500 as money)
            return human
        }

        export function HumanCityGuard(name: string|undefined) {
            let human = HumanSpearman(name, 'city')


            human.ai_map = 'urban_guard'
            human._skills[SKILL.POLEARMS] += 10
            return human
        }

        export function Tanner(name: string|undefined) {
            let human = HumanCity(name)
            human._skills[SKILL.TANNING] += 50
            human.savings.inc(500 as money)

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
            rat._perks[PERK.MAGIC_BOLT] = 1
            rat._perks[PERK.MAGIC_INITIATION] = 1
            rat.stash.inc(MATERIAL.ZAZ, 5)
            return rat
        }

        export function BerserkRat(name:string|undefined) {
            let rat = Base(BerserkRatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            rat._perks[PERK.BATTLE_CHARGE] = 1
            rat._skills[SKILL.UNARMED] = 40
            return rat
        }

        export function BigRat(name: string|undefined) {
            let rat = Base(BigRatTemplate, name, undefined, undefined, 'rats')

            rat._traits.claws = true
            rat._skills[SKILL.UNARMED] = 40
            return rat
        }

        export function MageElo(name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, undefined, 'elodino_free')

            elo._perks[PERK.MAGIC_BOLT] = 1
            elo._perks[PERK.MAGIC_INITIATION] = 1
            elo._skills[SKILL.MAGIC] = 30
            elo._skills[SKILL.COOKING] = 20
            elo.stash.inc(MATERIAL.ZAZ, 20)
            return elo
        }

        export function Elo(name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, undefined, 'elodino_free')
            if (elo == undefined) return undefined;

            return elo
        }

        export function Graci(name: string|undefined) {
            let graci = Base(GraciTemplate, name, undefined, undefined, 'graci')

            graci._skills[SKILL.TRAVELLING] = 70
            return graci
        }


        export function Mage(faction: string) {
            let mage = GenericHuman('Mage', faction)

            mage._skills[SKILL.MAGIC] = 100
            mage._perks[PERK.MAGIC_INITIATION] = 1
            mage._skills[SKILL.BATTLE_MAGIC] = 60
            mage._perks[PERK.MAGIC_BOLT] = 1

            let item = Data.Items.create_weapon_simple(WEAPON.SPEAR_WOOD_RED_BONE_RAT)
            item.affixes.push({tag: 'of_power'})
            item.affixes.push({tag: 'of_power'})
            mage.equip.weapon_id = item.id

            return mage
        }

        export function BloodMage(faction: string) {
            const mage = Mage(faction)
            mage._perks[PERK.MAGIC_BLOOD] = 1

            return mage
        }

        export function Alchemist(faction: string) {
            let alchemist = GenericHuman('Alchemist', faction)

            alchemist._skills[SKILL.MAGIC] = 60
            alchemist._perks[PERK.MAGIC_INITIATION] = 1
            alchemist._perks[PERK.PRO_ALCHEMIST] = 1

            alchemist.stash.inc(MATERIAL.ZAZ, 5)
            alchemist.savings.inc(5000 as money)

            return alchemist
        }

        export function ArmourMaster() {
            let master = HumanCity('Armourer')

            master._skills[SKILL.CLOTHIER] = 100
            master._skills[SKILL.LEATHERWORKING] = 100
            master._perks[PERK.PRO_LEATHERWORK] = 1
            master.savings.inc(TONS_OF_MONEY)
            return master
        }

        export function Shoemaker() {
            let master = HumanCity('Shoemaker')

            master._skills[SKILL.LEATHERWORKING] = 50
            master._skills[SKILL.CORDWAINING] = 100
            master._perks[PERK.PRO_CORDWAINER] = 1
            master.savings.inc(TONS_OF_MONEY)
            return master
        }

        export function WeaponMasterWood(faction: string) {
            let master = GenericHuman('Weapons maker', faction)

            master._skills[SKILL.WOODWORKING] = 100
            master.savings.inc(TONS_OF_MONEY)

            return master
        }

        export function WeaponMasterBone(faction: string) {
            let master = GenericHuman('Weapons maker', faction)

            master._skills[SKILL.BONE_CARVING] = 100
            master._perks[PERK.PRO_BONEWORK] = 1
            master.savings.inc(TONS_OF_MONEY)

            return master
        }

        export function MasterUnarmed(faction: string) {
            let master = GenericHuman('Monk', faction)

            master._skills[SKILL.UNARMED] = 100
            master._perks[PERK.BATTLE_DODGE] = 1
            master._perks[PERK.PRO_FIGHTER_UNARMED] = 1
            master.savings.inc(LUMP_OF_MONEY)

            return master
        }

        export function Ball(location: location_id, name: string | undefined) {
            return Base(BallTemplate, name, undefined, location, undefined)
        }
    }
}
