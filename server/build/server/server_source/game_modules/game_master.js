"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMaster = void 0;
const templates_1 = require("./templates");
const data_objects_1 = require("./data/data_objects");
const data_id_1 = require("./data/data_id");
// steppe_humans 9 9
// city 2 6
// rats 12 16
// graci 17 13
// elodino_free 24 20
// big_humans 10 28
const LUMP_OF_MONEY = 1000;
const TONS_OF_MONEY = 30000;
var GameMaster;
(function (GameMaster) {
    function spawn_faction(cell_id, faction) {
        console.log('spawn ' + faction);
        const [x, y] = data_objects_1.Data.World.id_to_coordinate(cell_id);
        if (faction == 'city') {
            // creation of mayor
            const mayor = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanCity(x, y, 'Mayor'));
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
            // creation of first colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCook(x, y, "Cook", 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.Shoemaker(x, y));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanFletcher(x, y, "Fletcher", 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.ArmourMaster(x, y));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.WeaponMasterWood(x, y, 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanLocalTrader(x, y, "Local Trader", 'city'));
            templates_1.Template.Character.Fisherman(x, y, "Fisherman 1");
            templates_1.Template.Character.Fisherman(x, y, "Fisherman 2");
            templates_1.Template.Character.Fisherman(x, y, "Fisherman 3");
            // colony mages
            templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.Alchemist(x, y, 'city'));
            templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.Mage(x, y, 'city'));
            //hunters
            for (let i = 0; i <= 10; i++) {
                const hunter = templates_1.Template.Character.HumanRatHunter(x, y, "Hunter " + i);
                hunter.savings.inc(500);
            }
            //guards
            for (let i = 0; i <= 5; i++) {
                const guard = templates_1.Template.Character.HumanCityGuard(x, y, "Guard " + i);
                guard.savings.inc(500);
            }
            // innkeeper
            const innkeeper = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanCity(x, y, "Innkeeper"));
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
            data_id_1.DataID.Connection.set_location_owner(innkeeper.id, inn.id);
            data_id_1.DataID.Connection.set_character_home(innkeeper.id, inn.id);
        }
        if (faction == 'steppe_humans') {
            // innkeeper
            const innkeeper = templates_1.Template.Character.EquipClothesRich(templates_1.Template.Character.HumanCity(x, y, "Innkeeper"));
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
            data_id_1.DataID.Connection.set_location_owner(innkeeper.id, inn.id);
            data_id_1.DataID.Connection.set_character_home(innkeeper.id, inn.id);
            // creation of local colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCook(x, y, "Cook", 'steppe'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.WeaponMasterBone(x, y, faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.BloodMage(x, y, faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.MasterUnarmed(x, y, faction));
            templates_1.Template.Character.Lumberjack(x, y, "Lumberjack 1");
            templates_1.Template.Character.Lumberjack(x, y, "Lumberjack 2");
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
                has_rat_lair: true,
                terrain: 1 /* Terrain.steppe */,
                has_house_level: 8
            });
        }
        if (faction == 'graci') {
            for (let i = 1; i <= 30; i++) {
                const cell_obj = data_objects_1.Data.Cells.from_id(cell_id);
                templates_1.Template.Character.Graci(x, y, undefined);
            }
        }
    }
    GameMaster.spawn_faction = spawn_faction;
    function update(dt) {
        let num_rats = 0;
        let num_elos = 0;
        let num_balls = 0;
        let num_hunters = 0;
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
            if ((character.ai_map == 'rat_hunter') && (!character.dead())) {
                num_hunters += 1;
            }
        });
        let spawn = data_id_1.DataID.Faction.spawn('city');
        if (spawn != undefined) {
            let cell = data_objects_1.Data.Cells.from_id(spawn);
            if (num_hunters < 4) {
                templates_1.Template.Character.HumanRatHunter(cell.x, cell.y, "Hunter");
            }
        }
        // console.log('Game master update')
        data_objects_1.Data.Locations.for_each(location => {
            const cell_id = data_id_1.DataID.Location.cell_id(location.id);
            const cell = data_objects_1.Data.Cells.from_id(cell_id);
            if (location.has_rat_lair) {
                cell.rat_scent = 200;
                cell.rat_scent += 5 * dt / 100;
                spawn_rat(num_rats, cell);
            }
            if (cell_id == data_id_1.DataID.Faction.spawn('elodino_free')) {
                spawn_elodino(num_elos, cell);
                spawn_ball(num_balls, cell);
            }
        });
    }
    GameMaster.update = update;
    function spawn_rat(rats_number, cell) {
        if (rats_number < 30) {
            let dice_spawn = Math.random();
            if (dice_spawn > 0.4)
                return;
            let dice = Math.random();
            if (dice < 0.6) {
                templates_1.Template.Character.GenericRat(cell.x, cell.y, undefined);
            }
            else if (dice < 0.8) {
                templates_1.Template.Character.BigRat(cell.x, cell.y, undefined);
            }
            else if (dice < 1) {
                templates_1.Template.Character.MageRat(cell.x, cell.y, undefined);
            }
        }
    }
    GameMaster.spawn_rat = spawn_rat;
    function spawn_elodino(elos_number, cell) {
        if (elos_number < 50) {
            let dice = Math.random();
            if (dice < 0.7) {
                templates_1.Template.Character.Elo(cell.x, cell.y, undefined);
            }
            else {
                templates_1.Template.Character.MageElo(cell.x, cell.y, undefined);
            }
        }
    }
    GameMaster.spawn_elodino = spawn_elodino;
    function spawn_ball(num_balls, cell) {
        if (num_balls < 100) {
            templates_1.Template.Character.Ball(cell.x, cell.y, undefined);
        }
    }
    GameMaster.spawn_ball = spawn_ball;
})(GameMaster = exports.GameMaster || (exports.GameMaster = {}));
