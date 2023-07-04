import { cell_id, money } from "@custom_types/common"
import { Data } from "./data"
import { Event } from "./events/events"
import { ItemSystem } from "./items/system"
import { ARROW_BONE, ELODINO_FLESH, FOOD, GRACI_HAIR, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./manager_classes/materials_manager"
import { ElodinoTemplate } from "./races/TEMPLATE_ELO"
import { GraciTemplate } from "./races/TEMPLATE_GRACI"
import { HumanStrongTemplate, HumanTemplate } from "./races/TEMPLATE_HUMANS"
import { BerserkRatTemplate, BigRatTemplate, MageRatTemplate, RatTemplate } from "./races/TEMPLATE_RATS"
import { CharacterTemplate, ModelVariant } from "./types"
import { BallTemplate } from "./races/TEMPLATE_OTHERS"
import { Character } from "./character/character"

const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money

export namespace Template {
    export namespace Character {
        function Base(template:CharacterTemplate, name: string|undefined, model: ModelVariant|undefined ,x: number, y: number, faction_id: string|undefined) {
            const cell = Data.World.coordinate_to_id([x, y])
            let character = Event.new_character(template, name, cell, model)
            character.home_cell_id = cell
            if (faction_id != undefined) Data.Reputation.set(faction_id, character.id, "member")
            return character
        }

        export function GenericHuman(x: number, y: number, name:string|undefined, faction: string) {
            let human = Base(HumanTemplate, name, undefined, x, y, faction)
            human._skills.woodwork += 10
            human._skills.cooking += 15
            human._skills.hunt += 5
            human._skills.fishing += 5
            human._skills.travelling += 5
            human._skills.noweapon += 10
            return human
        }

        export function HumanSteppe(x: number, y: number, name:string|undefined) {
            let human = GenericHuman(x, y, name, 'steppe_humans')
            human._skills.hunt += 20
            human._skills.skinning += 10
            human._skills.cooking += 10
            human._skills.travelling += 30
            human._skills.ranged += 20
            human._skills.noweapon += 10
            return human
        }

        export function Lumberjack(x: number, y: number, name: string) {
            let human = HumanSteppe(x, y, name)
            human._skills.travelling += 20
            human.ai_map = 'lumberjack'

            let cutting_tool = ItemSystem.create('bone_dagger', [], 100)
            cutting_tool.durability = 200
            human.equip.data.slots.weapon = cutting_tool

            return human
        }

        export function Fisherman(x: number, y: number, name: string) {
            let human = HumanSteppe(x, y, name)
            human._skills.travelling += 20
            human._skills.fishing += 40
            human.ai_map = 'fisherman'

            return human
        }

        export function HumanStrong(x: number, y: number, name: string|undefined) {
            let human = Base(HumanStrongTemplate, name, undefined, x, y, undefined)
            return human
        }

        export function HumanCity(x: number, y: number, name: string|undefined) {
            let human = GenericHuman(x, y, name, 'city')
            human._skills.fishing += 20
            human._skills.noweapon += 5
            return human
        }

        export function HumanSpearman(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }
            
            human._skills.polearms = 60
            human._skills.evasion += 10
            human._skills.blocking += 10
            human._skills.ranged += 20
            human._perks.advanced_polearm = true
            let spear = ItemSystem.create('bone_spear', [], 100)
            spear.durability = 200
            let bow = ItemSystem.create('bow', [], 100)
            let armour = ItemSystem.create('rat_skin_armour', [], 100)
            let pants = ItemSystem.create('rat_skin_pants', [], 100)
            let boots = ItemSystem.create('rat_skin_boots', [], 100)
            let hat = ItemSystem.create('rat_skin_helmet', [], 100)
            human.equip.data.slots.weapon = spear
            human.equip.data.slots.mail = armour
            human.equip.data.slots.pants = pants
            human.equip.data.slots.boots = boots
            human.equip.data.slots.helmet = hat
            human.equip.data.slots.secondary = bow
            human.stash.inc(ARROW_BONE, 60)
            return human
        }

        export function EquipClothesBasic(character: Character) {
            character.equip.data.slots.mail = ItemSystem.create('cloth_mail', [], 100)
            // character.equip.data.slots.left_gauntlet = ItemSystem.create(CLOTH_GLOVES_ARGUMENT)
            // character.equip.data.slots.right_gauntlet = ItemSystem.create(CLOTH_GLOVES_ARGUMENT)
            character.equip.data.slots.boots = ItemSystem.create('rat_skin_boots', [], 100)
            // character.equip.data.slots.helmet = ItemSystem.create('cloth_helmet', [], 100)
            character.equip.data.slots.pants = ItemSystem.create('rat_skin_pants', [], 100)

            return character
        }

        export function EquipClothesRich(character: Character) {
            EquipClothesBasic(character)

            character.equip.data.slots.robe = ItemSystem.create('rat_robe', [], 100)
            character.equip.data.slots.right_gauntlet = ItemSystem.create('cloth_glove_right', [], 100)
            character.equip.data.slots.left_gauntlet = ItemSystem.create('cloth_glove_left', [], 100)
            character.equip.data.slots.helmet = ItemSystem.create('cloth_helmet', [], 100)

            return character
        }

        export function HumanRatHunter(x: number, y: number, name: string|undefined) {
            let human = HumanSpearman(x, y, name, 'steppe')
            human.ai_map = 'rat_hunter'
            human._skills.skinning += 20
            human._skills.hunt += 20
            return human
        }

        export function HumanCook(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human.stash.inc(FOOD, 10)
            human.savings.inc(500 as money)
            human._skills.cooking = 70
            human._perks.meat_master = true
            return human
        }

        export function HumanFletcher(x: number, y: number, name: string|undefined, faction: 'steppe'|'city') {
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human._skills.woodwork = 80
            human._skills.bone_carving = 30
            human._perks.fletcher = true
            human._skills.ranged = 30

            human.stash.inc(ARROW_BONE, 50)
            human.stash.inc(RAT_BONE, 3)
            human.stash.inc(WOOD, 1)

            human.savings.inc(500 as money)
            return human
        }

        export function HumanCityGuard(x: number, y: number, name: string|undefined) {
            let human = HumanSpearman(x, y, name, 'city')
            human.ai_map = 'urban_guard'
            human._skills.polearms += 10
            return human
        }

        export function HumanLocalTrader(x: number, y: number, name: string|undefined, faction:'city'|'steppe'){
            switch(faction) {
                case "steppe":{var human = HumanSteppe(x,y, name);break}
                case "city":{var human = HumanCity(x, y, name);break}
            }

            human.ai_map = 'urban_trader'
            human.savings.inc(800 as money)
            return human
        }

        export function GenericRat(x: number, y: number, name:string|undefined) {
            let rat = Base(RatTemplate, name, undefined, x, y, 'rats')
            rat._traits.claws = true
            return rat
        }

        export function MageRat(x: number, y: number, name:string|undefined) {
            let rat = Base(MageRatTemplate, name, undefined, x, y, 'rats')
            rat._traits.claws = true
            rat._perks.magic_bolt = true
            rat._perks.mage_initiation = true 
            rat.stash.inc(ZAZ, 5)
            return rat
        }

        export function BerserkRat(x: number, y: number, name:string|undefined) {
            let rat = Base(BerserkRatTemplate, name, undefined, x, y, 'rats')
            rat._traits.claws = true
            rat._perks.charge = true
            rat._skills.noweapon = 40
            return rat
        }

        export function BigRat(x: number, y: number, name: string|undefined) {
            let rat = Base(BigRatTemplate, name, undefined, x, y, 'rats')
            rat._traits.claws = true
            rat._skills.noweapon = 40
            return rat
        }

        export function MageElo(x: number, y: number, name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, x, y, 'elodino_free')
            elo._perks.magic_bolt = true
            elo._perks.mage_initiation = true
            elo._skills.magic_mastery = 20
            elo._skills.cooking = 20
            elo.stash.inc(ZAZ, 30)
            return elo
        }

        export function Elo(x: number, y: number, name:string|undefined) {
            let elo = Base(ElodinoTemplate, name, undefined, x, y, 'elodino_free')
            return elo
        }

        export function Graci(x: number, y: number, name: string|undefined) {
            let graci = Base(GraciTemplate, name, undefined, x, y, 'graci')
            graci._skills.travelling = 70
            return graci
        }


        export function Mage(x: number, y: number, faction: string) {
            let mage = GenericHuman(x, y, 'Mage', faction)
            // let mage = Event.new_character(HumanTemplate, 'Mage', cell, dummy_model)

            mage._skills.magic_mastery = 100
            mage._perks.mage_initiation = true
            mage._perks.magic_bolt = true

            let item = ItemSystem.create('spear', [], 100)
            item.affixes.push({tag: 'of_power'})
            item.affixes.push({tag: 'of_power'})
            mage.equip.data.slots.weapon = item

            return mage
        }

        export function BloodMage(x: number, y: number, faction: string) {
            const blood_mage = Mage(x, y, faction)
            blood_mage._perks.blood_mage = true

            return blood_mage
        }

        export function Alchemist(x: number, y: number, faction: string) {
            let alchemist = GenericHuman(x, y, 'Alchemist', faction)

            alchemist._skills.magic_mastery = 60
            alchemist._perks.mage_initiation = true
            alchemist._perks.alchemist = true

            alchemist.stash.inc(ZAZ, 5)
            alchemist.savings.inc(5000 as money)

            return alchemist
        }

        export function ArmourMaster(x: number, y: number) {
            let master = HumanCity(x, y, 'Armourer')
            master._skills.clothier = 100
            master._perks.skin_armour_master = true
            master.stash.inc(RAT_SKIN, 50)
            master.savings.inc(TONS_OF_MONEY)            
            return master
        }

        export function Shoemaker(x: number, y: number) {
            let master = HumanCity(x, y, 'Shoemaker')
            master._skills.clothier = 100
            master._perks.shoemaker = true
            master.stash.inc(RAT_SKIN, 50)
            master.savings.inc(TONS_OF_MONEY)            
            return master
        }

        export function WeaponMasterWood(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Weapons maker', faction)

            master._skills.woodwork = 100
            master._perks.weapon_maker = true
            master.stash.inc(WOOD, 15)
            master.savings.inc(TONS_OF_MONEY)
            
            return master
        }

        export function WeaponMasterBone(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Weapons maker', faction)

            master._skills.bone_carving = 100
            master._perks.weapon_maker = true
            master.stash.inc(RAT_BONE, 40)
            master.savings.inc(TONS_OF_MONEY)
            
            return master
        }

        export function MasterUnarmed(x: number, y: number, faction: string) {
            let master = GenericHuman(x, y, 'Monk', faction)
            master._skills.noweapon = 100
            master._perks.dodge = true
            master._perks.advanced_unarmed = true
            master.savings.inc(LUMP_OF_MONEY)

            return master
        }

        export function Ball(x: number, y: number, name: string | undefined) {
            return Base(BallTemplate, name, undefined, x, y, undefined)
        }
    }
}
