import { cell_id, money } from "@custom_types/common";
import { Data } from "./data";
import { Effect } from "./events/effects";
import { Cell } from "./map/DATA_LAYOUT_CELL";
import { Template } from "./templates";
import { LandPlotType } from "@custom_types/buildings";
import { character_to_string } from "./strings_management";

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
            // creation of mayor
            const mayor = Template.Character.EquipClothesRich(Template.Character.HumanCity(x, y, 'Mayor'))
            mayor.savings.inc(TONS_OF_MONEY)
            Data.World.set_faction_leader(faction, mayor.id)

            const mayor_house = Effect.new_building(cell_id, LandPlotType.HumanHouse, 200, 50 as money)
            Data.Buildings.set_ownership(mayor.id, mayor_house)

            // creation of first colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanCook(x, y, "Cook", 'city'))
            Template.Character.EquipClothesBasic(Template.Character.Shoemaker(x, y))
            Template.Character.EquipClothesBasic(Template.Character.HumanFletcher(x, y, "Fletcher", 'city'))
            Template.Character.EquipClothesBasic(Template.Character.ArmourMaster(x, y))
            Template.Character.EquipClothesBasic(Template.Character.WeaponMasterWood(x, y, 'city'))
            Template.Character.EquipClothesBasic(Template.Character.HumanLocalTrader(x, y, "Local Trader", 'city'))

            Template.Character.Fisherman(x, y, "Fisherman 1")
            Template.Character.Fisherman(x, y, "Fisherman 2")
            Template.Character.Fisherman(x, y, "Fisherman 3")

            // colony mages
            Template.Character.EquipClothesRich(Template.Character.Alchemist(x, y, 'city'))
            Template.Character.EquipClothesRich(Template.Character.Mage(x, y, 'city'))


            //hunters
            for (let i = 0; i <= 10; i++) {
                const hunter = Template.Character.HumanRatHunter(x, y, "Hunter " + i)
                hunter.savings.inc(500 as money)
            }
            //guards
            for (let i = 0; i <= 5; i++) {
                const guard = Template.Character.HumanCityGuard(x, y, "Guard " + i)
                guard.savings.inc(500 as money)
            }
            // innkeeper
            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanCity(x, y, "Innkeeper"))
            const inn = Effect.new_building(cell_id, LandPlotType.Inn, 200, 10 as money)
            Data.Buildings.set_ownership(innkeeper.id, inn)
        }


        if (faction == 'steppe_humans') {
            // innkeeper
            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanCity(x, y, "Innkeeper"))
            const inn = Effect.new_building(cell_id, LandPlotType.Inn, 200, 10 as money)
            Data.Buildings.set_ownership(innkeeper.id, inn)

            // creation of local colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanCook(x, y, "Cook", 'steppe'))
            Template.Character.EquipClothesBasic(Template.Character.WeaponMasterBone(x, y, faction))
            Template.Character.EquipClothesBasic(Template.Character.BloodMage(x, y, faction))
            Template.Character.EquipClothesBasic(Template.Character.MasterUnarmed(x, y, faction))

            Template.Character.Lumberjack(x, y, "Lumberjack 1")
            Template.Character.Lumberjack(x, y, "Lumberjack 2")
        }        

        if (faction == 'rats') {
            const rat_lair = Effect.new_building(cell_id, LandPlotType.RatLair, 400, 0 as money)
        }

        if (faction == 'elodino_free') {
            const elodino_city = Effect.new_building(cell_id, LandPlotType.ElodinoHouse, 400, 0 as money)
        }

        if (faction == 'graci') {
            for (let i = 1; i <= 30; i++) {
                const cell_obj = Data.Cells.from_id(cell_id)
                Template.Character.Graci(x, y, undefined)
            }
        }
    }

    export function update(dt: number) {
        let num_rats = 0
        let num_elos = 0
        let num_balls = 0
        let num_hunters = 0
        for (const character of Data.CharacterDB.list()) {
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
        }

        let spawn = Data.World.get_faction('city')?.spawn_point
        if (spawn != undefined) {
            let cell = Data.Cells.from_id(spawn)
            if (num_hunters < 4) {
                Template.Character.HumanRatHunter(cell.x, cell.y, "Hunter")
            }
        } 

        // console.log('Game master update')
        for (const cell of Data.Cells.list_ids()) {
            let cell_object = Data.Cells.from_id(cell)
            const buildings = Data.Buildings.from_cell_id(cell)
            if (buildings != undefined) {
                for (const item_id of buildings) {
                    const building = Data.Buildings.from_id(item_id)
                    if (building.type == LandPlotType.RatLair) {
                        cell_object.rat_scent = 200
                        cell_object.rat_scent += 5 * dt / 100
                        spawn_rat(num_rats, cell_object)
                    }

                    if (building.type == LandPlotType.ElodinoHouse) {
                        let cell_object = Data.Cells.from_id(cell)
                        spawn_elodino(num_elos, cell_object)
                        spawn_ball(num_balls, cell_object)
                    }
                }
            }

            let set = Data.Cells.get_characters_set_from_cell(cell)
            if (set != undefined) {
                for (const character_id of set) {
                    let character = Data.CharacterDB.from_id(character_id) 
                    if ((character.race == 'rat') && (character.dead())) {
                        cell_object.rat_scent -= 1 * dt / 50
                    }
                }
            }
        }
    }

    export function spawn_rat(rats_number: number, cell: Cell) {        
        if (rats_number < 30) {
            let dice_spawn = Math.random()
            if (dice_spawn > 0.4) return
            let dice = Math.random()
            if (dice < 0.6) {
                Template.Character.GenericRat(cell.x, cell.y, undefined)
            } else if (dice < 0.8) {
                Template.Character.BigRat(cell.x, cell.y, undefined)
            } else if (dice < 1) {
                Template.Character.MageRat(cell.x, cell.y, undefined)
            }
        }
    }

    export function spawn_elodino(elos_number: number, cell: Cell) {
        if (elos_number < 50) {
            let dice = Math.random()
            if (dice < 0.7) {
                Template.Character.Elo(cell.x, cell.y, undefined)
            } else {
                Template.Character.MageElo(cell.x, cell.y, undefined)
            }
        }
    }

    export function spawn_ball(num_balls: number, cell: Cell) {
        if (num_balls < 100) {
            Template.Character.Ball(cell.x, cell.y, undefined)
        }
    }
}