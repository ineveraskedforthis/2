"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMaster = exports.generate_human_name = exports.generate_human_given_name = void 0;
const templates_1 = require("./templates");
const data_objects_1 = require("./data/data_objects");
const data_id_1 = require("./data/data_id");
const content_1 = require("../.././../game_content/src/content");
// steppe_humans 9 9
// city 2 6
// rats 12 16
// graci 17 13
// elodino_free 24 20
// big_humans 10 28
const LUMP_OF_MONEY = 1000;
const TONS_OF_MONEY = 30000;
const GREAT_CITIES = ["ITH", "URB", "URBA", "LAURB", "SUB", "GIR", "ZIR", "FAOG", "IRB", "MHA", "TRE"];
const allowed_prefix = ["", "", "", "q", "z", "s"];
const allowed_start = ["Al", "Ol", "Us", "Es", "Ul"];
const allowed_center = ["o", "ou", "eu", "ae"];
const allowed_end = ["", "p", "kep", "sep", "rup"];
function generate_human_given_name() {
    const dices = [
        Math.floor(Math.random() * allowed_prefix.length),
        Math.floor(Math.random() * allowed_start.length),
        Math.floor(Math.random() * allowed_center.length),
        Math.floor(Math.random() * allowed_end.length),
    ];
    return allowed_prefix[dices[0]] + allowed_start[dices[1]] + allowed_center[dices[2]] + allowed_end[dices[3]];
}
exports.generate_human_given_name = generate_human_given_name;
function generate_human_name(citizen_flag, occupation, home_city) {
    let result = "";
    if (citizen_flag)
        result += "G'";
    if (home_city)
        result += home_city + "'";
    else {
        const dice = Math.floor(Math.random() * GREAT_CITIES.length);
        result += GREAT_CITIES[dice] + "'";
    }
    switch (occupation) {
        case "ruler": {
            result += "AEU";
            break;
        }
        case "warrior": {
            result += "Ar'";
            break;
        }
        case "merchant": {
            result += "Ub'";
            break;
        }
        case "artisan": {
            result += "Ab'";
            break;
        }
        case "peasant": {
            result += "Om'";
            break;
        }
        case "mage": {
            result += "Og'";
            break;
        }
    }
    result += " " + generate_human_given_name();
    return result;
}
exports.generate_human_name = generate_human_name;
var GameMaster;
(function (GameMaster) {
    function spawn_faction(cell_id, faction) {
        console.log('spawn ' + faction);
        const [x, y] = data_objects_1.Data.World.id_to_coordinate(cell_id);
        if (faction == 'city') {
            const inn = data_objects_1.Data.Locations.create(cell_id, {
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
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 3
            });
            data_id_1.DataID.Connection.set_spawn('city', inn.id);
            // creation of mayor
            const mayor = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanCity(generate_human_name(true, "ruler")));
            mayor.savings.inc(TONS_OF_MONEY);
            data_objects_1.Data.Factions.set_faction_leader(faction, mayor.id);
            const mayor_house = data_objects_1.Data.Locations.create(cell_id, {
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
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 5
            });
            data_id_1.DataID.Connection.set_location_owner(mayor.id, mayor_house.id);
            data_id_1.DataID.Connection.set_character_home(mayor.id, mayor_house.id);
            // creation of remaining colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanLocalTrader(generate_human_name(true, "merchant", "ITH"), 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.Tanner(generate_human_name(true, "artisan")));
            for (let i = 1; i < 4; i++) {
                templates_1.Template.Character.Fisherman(generate_human_name(false, "peasant"));
            }
            // colony mages
            templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.Alchemist(generate_human_name(true, "mage"), 'city'));
            templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.Mage(generate_human_name(true, "mage"), 'city'));
            //guards
            for (let i = 0; i <= 5; i++) {
                const guard = templates_1.Template.Character.HumanCityGuard(generate_human_name(true, "warrior"));
                guard.savings.inc(500);
            }
            // innkeeper
            const innkeeper = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanCity(generate_human_name(true, "merchant")));
            data_id_1.DataID.Connection.set_location_owner(innkeeper.id, inn.id);
            data_id_1.DataID.Connection.set_character_home(innkeeper.id, inn.id);
        }
        if (faction == 'steppe_humans') {
            // innkeeper
            const inn = data_objects_1.Data.Locations.create(cell_id, {
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
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 3
            });
            data_id_1.DataID.Connection.set_spawn('steppe_humans', inn.id);
            const innkeeper = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanSteppe(generate_human_name(true, "merchant")));
            data_id_1.DataID.Connection.set_location_owner(innkeeper.id, inn.id);
            data_id_1.DataID.Connection.set_character_home(innkeeper.id, inn.id);
            // creation of local colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCook(generate_human_name(false, "artisan"), 'steppe'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.WeaponMasterBone(generate_human_name(false, "artisan"), faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.BloodMage(generate_human_name(false, "mage"), faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.MasterUnarmed(generate_human_name(false, "warrior"), faction));
            templates_1.Template.Character.Lumberjack(generate_human_name(false, "peasant"));
            templates_1.Template.Character.Lumberjack(generate_human_name(false, "peasant"));
            //hunters
            for (let i = 0; i <= 10; i++) {
                const hunter = templates_1.Template.Character.HumanRatHunter(generate_human_name(false, "peasant"));
                hunter.savings.inc(10);
            }
        }
        if (faction == 'rats') {
            const rat_lair = data_objects_1.Data.Locations.create(cell_id, {
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
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 0
            });
            data_id_1.DataID.Connection.set_spawn('rats', rat_lair.id);
        }
        if (faction == 'elodino_free') {
            const elodino_city = data_objects_1.Data.Locations.create(cell_id, {
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
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 8
            });
            data_id_1.DataID.Connection.set_spawn('elodino_free', elodino_city.id);
        }
        if (faction == 'graci') {
            for (let i = 1; i <= 30; i++) {
                const cell_obj = data_objects_1.Data.Cells.from_id(cell_id);
                templates_1.Template.Character.Graci(undefined);
            }
        }
    }
    GameMaster.spawn_faction = spawn_faction;
    function update(dt) {
        let num_rats = 0;
        let num_elos = 0;
        let num_balls = 0;
        let num_humans = 0;
        data_objects_1.Data.Characters.for_each(character => {
            if ((character.race == 'rat') && (!character.dead())) {
                num_rats += 1;
            }
            if ((character.race == 'elo') && (!character.dead())) {
                num_elos += 1;
            }
            if ((character.race == 'ball') && (!character.dead())) {
                num_balls += 1;
            }
            if ((character.race == 'human' && (!character.dead()))) {
                num_humans++;
            }
        });
        // migration to the city
        const speed = (1 / (1 + num_humans) / (1 + num_humans));
        if (Math.random() < speed * dt) {
            const occupation_dice = Math.random();
            if (occupation_dice < 0.01) {
                templates_1.Template.Character.HumanLocalTrader(generate_human_name(false, "merchant"), "city");
            }
            else if (occupation_dice < 0.7) {
                const character = templates_1.Template.Character.HumanCity(generate_human_name(false, "peasant"));
                character.savings.inc(50);
            }
            else if (occupation_dice < 0.9) {
                const master = templates_1.Template.Character.HumanCity(generate_human_name(true, "artisan"));
                for (const skill of content_1.SkillConfiguration.SKILL) {
                    if (content_1.SkillStorage.get(skill).crafting) {
                        if (Math.random() < 0.05) {
                            master._skills[skill] = 90;
                        }
                        else if (Math.random() < 0.1) {
                            master._skills[skill] = 50;
                        }
                        else if (Math.random() < 0.2) {
                            master._skills[skill] = 10;
                        }
                    }
                }
                master.savings.inc(4000);
            }
            else {
                const guard = templates_1.Template.Character.HumanCityGuard(generate_human_name(false, "warrior"));
                guard.savings.inc(250);
            }
        }
        // console.log('Game master update')
        data_objects_1.Data.Locations.for_each(location => {
            const cell_id = data_id_1.DataID.Location.cell_id(location.id);
            const cell = data_objects_1.Data.Cells.from_id(cell_id);
            if (location.has_rat_lair) {
                cell.rat_scent = 200;
                cell.rat_scent += 5 * dt / 100;
                spawn_rat(num_rats);
            }
            if (location.id == data_id_1.DataID.Faction.spawn('elodino_free')) {
                spawn_elodino(num_elos);
                spawn_ball(num_balls, location.id);
            }
        });
    }
    GameMaster.update = update;
    function spawn_rat(rats_number) {
        if (rats_number < 30) {
            let dice_spawn = Math.random();
            if (dice_spawn > 0.4)
                return;
            let dice = Math.random();
            if (dice < 0.6) {
                templates_1.Template.Character.GenericRat(undefined);
            }
            else if (dice < 0.8) {
                templates_1.Template.Character.BigRat(undefined);
            }
            else if (dice < 1) {
                templates_1.Template.Character.MageRat(undefined);
            }
        }
    }
    GameMaster.spawn_rat = spawn_rat;
    function spawn_elodino(elos_number) {
        if (elos_number < 50) {
            let dice = Math.random();
            if (dice < 0.7) {
                templates_1.Template.Character.Elo(undefined);
            }
            else {
                templates_1.Template.Character.MageElo(undefined);
            }
        }
    }
    GameMaster.spawn_elodino = spawn_elodino;
    function spawn_ball(num_balls, location) {
        if (num_balls < 100) {
            templates_1.Template.Character.Ball(location, undefined);
        }
    }
    GameMaster.spawn_ball = spawn_ball;
})(GameMaster || (exports.GameMaster = GameMaster = {}));

