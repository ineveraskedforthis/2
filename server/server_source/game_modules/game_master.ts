import { Terrain, money } from "@custom_types/common";
import { cell_id, location_id } from "@custom_types/ids";
import { Template } from "./templates";
import { Data } from "./data/data_objects";
import { DataID } from "./data/data_id";
import { CellData } from "./map/cell_interface";

// steppe_humans 9 9
// city 2 6
// rats 12 16
// graci 17 13
// elodino_free 24 20
// big_humans 10 28
const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money


export namespace GameMaster {
    export function spawn_faction(cell_id: cell_id, faction: string) {
        console.log('spawn ' + faction)
        const [x, y] = Data.World.id_to_coordinate(cell_id)
        if (faction == 'city') {
            const inn = Data.Locations.create(cell_id, {
                fish: 0,
                cotton: 0,
                forest: 0,
                berries: 0,
                small_game: 0,

                devastation: 0,

                has_bed: true,

                has_bowmaking_tools: false,
                has_clothier_tools: false,
                has_cooking_tools: true,
                has_cordwainer_tools: false,
                has_tanning_tools: false,
                has_rat_lair: false,

                terrain: Terrain.steppe,

                has_house_level: 3
            })
            DataID.Connection.set_spawn('city', inn.id)

            // creation of mayor
            const mayor = Template.Character.EquipClothesRich(Template.Character.HumanCity('Mayor'))

            mayor.savings.inc(TONS_OF_MONEY)
            Data.Factions.set_faction_leader(faction, mayor.id)

            const mayor_house = Data.Locations.create(cell_id, {
                fish: 0,
                cotton: 0,
                forest: 0,
                berries: 0,
                small_game: 0,

                devastation: 0,

                has_bed: true,

                has_bowmaking_tools: false,
                has_clothier_tools: false,
                has_cooking_tools: true,
                has_cordwainer_tools: false,
                has_tanning_tools: false,
                has_rat_lair: false,

                terrain: Terrain.steppe,

                has_house_level: 5
            })

            DataID.Connection.set_location_owner(mayor.id, mayor_house.id)
            DataID.Connection.set_character_home(mayor.id, mayor_house.id)

            // creation of first colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanCook("Cook", 'city'))
            Template.Character.EquipClothesBasic(Template.Character.Shoemaker())
            Template.Character.EquipClothesBasic(Template.Character.HumanFletcher("Fletcher", 'city'))
            Template.Character.EquipClothesBasic(Template.Character.ArmourMaster())
            Template.Character.EquipClothesBasic(Template.Character.WeaponMasterWood('city'))
            Template.Character.EquipClothesBasic(Template.Character.HumanLocalTrader("Local Trader", 'city'))

            Template.Character.Fisherman("Fisherman 1")
            Template.Character.Fisherman("Fisherman 2")
            Template.Character.Fisherman("Fisherman 3")

            // colony mages
            Template.Character.EquipClothesRich(Template.Character.Alchemist('city'))
            Template.Character.EquipClothesRich(Template.Character.Mage('city'))


            //hunters
            for (let i = 0; i <= 10; i++) {
                const hunter = Template.Character.HumanRatHunter("Hunter " + i)
                hunter.savings.inc(500 as money)
            }
            //guards
            for (let i = 0; i <= 5; i++) {
                const guard = Template.Character.HumanCityGuard("Guard " + i)
                guard.savings.inc(500 as money)
            }
            // innkeeper
            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanCity("Innkeeper"))
            DataID.Connection.set_location_owner(innkeeper.id, inn.id)
            DataID.Connection.set_character_home(innkeeper.id, inn.id)
        }


        if (faction == 'steppe_humans') {
            // innkeeper
            const inn = Data.Locations.create(cell_id, {
                fish: 0,
                cotton: 0,
                forest: 0,
                berries: 0,
                small_game: 0,

                devastation: 0,

                has_bed: true,

                has_bowmaking_tools: false,
                has_clothier_tools: false,
                has_cooking_tools: true,
                has_cordwainer_tools: false,
                has_tanning_tools: false,
                has_rat_lair: false,

                terrain: Terrain.steppe,

                has_house_level: 3
            })

            DataID.Connection.set_spawn('steppe_humans', inn.id)

            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanSteppe("Innkeeper"))

            DataID.Connection.set_location_owner(innkeeper.id, inn.id)
            DataID.Connection.set_character_home(innkeeper.id, inn.id)

            // creation of local colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanCook("Cook", 'steppe'))
            Template.Character.EquipClothesBasic(Template.Character.WeaponMasterBone(faction))
            Template.Character.EquipClothesBasic(Template.Character.BloodMage(faction))
            Template.Character.EquipClothesBasic(Template.Character.MasterUnarmed(faction))

            Template.Character.Lumberjack("Lumberjack 1")
            Template.Character.Lumberjack("Lumberjack 2")
        }

        if (faction == 'rats') {
            const rat_lair = Data.Locations.create(cell_id, {
                fish: 0,
                cotton: 0,
                forest: 0,
                berries: 0,
                small_game: 0,

                devastation: 0,

                has_bed: false,

                has_bowmaking_tools: false,
                has_clothier_tools: false,
                has_cooking_tools: false,
                has_cordwainer_tools: false,
                has_tanning_tools: false,
                has_rat_lair: true,

                terrain: Terrain.steppe,

                has_house_level: 0
            })

            DataID.Connection.set_spawn('rats', rat_lair.id)
        }

        if (faction == 'elodino_free') {
            const elodino_city = Data.Locations.create(cell_id, {
                fish: 0,
                cotton: 0,
                forest: 0,
                berries: 0,
                small_game: 0,

                devastation: 0,

                has_bed: true,

                has_bowmaking_tools: false,
                has_clothier_tools: false,
                has_cooking_tools: true,
                has_cordwainer_tools: false,
                has_tanning_tools: false,
                has_rat_lair: false,

                terrain: Terrain.steppe,

                has_house_level: 8
            })

            DataID.Connection.set_spawn('elodino_free', elodino_city.id)
        }

        if (faction == 'graci') {
            for (let i = 1; i <= 30; i++) {
                const cell_obj = Data.Cells.from_id(cell_id)
                Template.Character.Graci(undefined)
            }
        }
    }

    export function update(dt: number) {
        let num_rats = 0
        let num_elos = 0
        let num_balls = 0
        let num_hunters = 0
        let num_guards = 0
        Data.Characters.for_each(character => {
            if ((character.race == 'rat') && (!character.dead())) {
                num_rats += 1
            }
            if ((character.race == 'elo') && (!character.dead())) {
                num_elos += 1
            }
            if ((character.race == 'ball') && (!character.dead())) {
                num_balls += 1
            }
            if ((character.ai_map == 'rat_hunter') && (!character.dead())) {
                num_hunters += 1
            }

            if ((character.ai_map == 'urban_guard' && (!character.dead()))) {
                num_guards ++;
            }
        })

        if (num_hunters < 4) {
            Template.Character.HumanRatHunter("Hunter")
        }

        if (num_guards < 15) {
            Template.Character.HumanCityGuard("Guard")
        }

        // console.log('Game master update')
        Data.Locations.for_each(location => {
            const cell_id = DataID.Location.cell_id(location.id)
            const cell = Data.Cells.from_id(cell_id)

            if (location.has_rat_lair) {
                cell.rat_scent = 200
                cell.rat_scent += 5 * dt / 100
                spawn_rat(num_rats)
            }

            if (location.id == DataID.Faction.spawn('elodino_free')) {
                spawn_elodino(num_elos)
                spawn_ball(num_balls, location.id)
            }
        });
    }

    export function spawn_rat(rats_number: number) {
        if (rats_number < 30) {
            let dice_spawn = Math.random()
            if (dice_spawn > 0.4) return
            let dice = Math.random()
            if (dice < 0.6) {
                Template.Character.GenericRat(undefined)
            } else if (dice < 0.8) {
                Template.Character.BigRat(undefined)
            } else if (dice < 1) {
                Template.Character.MageRat(undefined)
            }
        }
    }

    export function spawn_elodino(elos_number: number) {
        if (elos_number < 50) {
            let dice = Math.random()
            if (dice < 0.7) {
                Template.Character.Elo( undefined)
            } else {
                Template.Character.MageElo(undefined)
            }
        }
    }

    export function spawn_ball(num_balls: number, location: location_id) {
        if (num_balls < 100) {
            Template.Character.Ball(location, undefined)
        }
    }
}