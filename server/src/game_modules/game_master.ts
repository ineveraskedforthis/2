import { Terrain, money } from "@custom_types/common";
import { cell_id, location_id } from "@custom_types/ids";
import { Template } from "./templates";
import { Data } from "./data/data_objects";
import { DataID } from "./data/data_id";
import { CellData } from "./map/cell_interface";
import { SkillConfiguration, SkillStorage } from "@content/content";
import { ms } from "@custom_types/battle_data";

// steppe_humans 9 9
// city 2 6
// rats 12 16
// graci 17 13
// elodino_free 24 20
// big_humans 10 28
const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money

const GREAT_CITIES = ["ITH", "URB", "URBA", "LAURB", "SUB", "GIR", "ZIR", "FAOG", "IRB", "MHA", "TRE"]

type occupation =
    "warrior"
    |"merchant"
    |"artisan"
    |"peasant"
    |"mage"
    |"ruler"


const allowed_prefix = ["", "", "", "q", "z", "s"]
const allowed_start = ["Al","Ol","Us","Es","Ul"]
const allowed_center = ["o", "ou", "eu", "ae"]
const allowed_end = ["", "p", "kep", "sep", "rup"]

export function generate_human_given_name() {
    const dices = [
        Math.floor(Math.random() * allowed_prefix.length),
        Math.floor(Math.random() * allowed_start.length),
        Math.floor(Math.random() * allowed_center.length),
        Math.floor(Math.random() * allowed_end.length),
    ]

    return allowed_prefix[dices[0]] + allowed_start[dices[1]] + allowed_center[dices[2]] + allowed_end[dices[3]]
}

export function generate_human_name(citizen_flag: boolean, occupation: occupation, home_city?: string) {
    let result = ""
    if (citizen_flag) result += "G'"
    if (home_city)
        result += home_city + "'"
    else {
        const dice = Math.floor(Math.random() * GREAT_CITIES.length)
        result += GREAT_CITIES[dice] + "'"
    }

    switch(occupation) {
        case "ruler":{result += "AEU"; break}
        case "warrior":{result += "Ar'";break}
        case "merchant":{result += "Ub'"; break}
        case "artisan":{result += "Ab'"; break}
        case "peasant":{result += "Om'"; break}
        case "mage":{result += "Og'";break}
    }

    result += " " + generate_human_given_name()

    return result
}


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
            const mayor = Template.Character.EquipClothesRich(Template.Character.HumanCity(generate_human_name(true, "ruler")))
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

            // creation of remaining colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanLocalTrader(generate_human_name(true, "merchant", "ITH"), 'city'))

            Template.Character.EquipClothesBasic(Template.Character.Tanner(generate_human_name(true, "artisan")))

            for (let i = 1; i < 4; i++) {
                Template.Character.Fisherman(generate_human_name(false, "peasant"))
            }

            // colony mages
            Template.Character.EquipClothesRich(Template.Character.Alchemist(generate_human_name(true, "mage"), 'city'))
            Template.Character.EquipClothesRich(Template.Character.Mage(generate_human_name(true, "mage"), 'city'))

            //guards
            for (let i = 0; i <= 5; i++) {
                const guard = Template.Character.HumanCityGuard(generate_human_name(true, "warrior"))
                guard.savings.inc(500 as money)
            }

            // innkeeper
            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanCity(generate_human_name(true, "merchant")))
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

            const innkeeper = Template.Character.EquipClothesRich(Template.Character.HumanSteppe(generate_human_name(true, "merchant")))

            DataID.Connection.set_location_owner(innkeeper.id, inn.id)
            DataID.Connection.set_character_home(innkeeper.id, inn.id)

            // creation of local colonists
            Template.Character.EquipClothesBasic(Template.Character.HumanCook(generate_human_name(false, "artisan"), 'steppe'))
            Template.Character.EquipClothesBasic(Template.Character.WeaponMasterBone(generate_human_name(false, "artisan"), faction))
            Template.Character.EquipClothesBasic(Template.Character.BloodMage(generate_human_name(false, "mage"), faction))
            Template.Character.EquipClothesBasic(Template.Character.MasterUnarmed(generate_human_name(false, "warrior"), faction))

            Template.Character.Lumberjack(generate_human_name(false, "peasant"))
            Template.Character.Lumberjack(generate_human_name(false, "peasant"))

            //hunters
            for (let i = 0; i <= 10; i++) {
                const hunter = Template.Character.HumanRatHunter(generate_human_name(false, "peasant"))
                hunter.savings.inc(10 as money)
            }
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

    export function update(dt: ms) {
        let num_rats = 0
        let num_elos = 0
        let num_balls = 0
        let num_humans = 0
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
            if ((character.race == 'human' && (!character.dead()))) {
                num_humans ++;
            }
        })

        // migration to the city
        const speed = (10 / (1 + num_humans) / (1 + num_humans))
        if (Math.random() < speed * dt) {
            const occupation_dice = Math.random()

            if (occupation_dice < 0.01) {
                Template.Character.HumanLocalTrader(generate_human_name(false, "merchant"), "city")
            } else if (occupation_dice < 0.7) {
                Template.Character.HumanCity(generate_human_name(false, "peasant"))
            } else if (occupation_dice < 0.9) {
                const master = Template.Character.HumanCity(generate_human_name(true, "artisan"))
                for (const skill of SkillConfiguration.SKILL) {
                    if (SkillStorage.get(skill).crafting) {
                        if (Math.random() < 0.05) {
                            master._skills[skill] = 90
                        } else if (Math.random() < 0.1) {
                            master._skills[skill] = 50
                        } else if (Math.random() < 0.2) {
                            master._skills[skill] = 10
                        }
                    }
                }
            } else {
                Template.Character.HumanCityGuard(generate_human_name(false, "warrior"))
            }
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