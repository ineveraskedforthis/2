"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMaster = void 0;
const data_1 = require("./data");
const effects_1 = require("./events/effects");
const templates_1 = require("./templates");
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
        const [x, y] = data_1.Data.World.id_to_coordinate(cell_id);
        if (faction == 'city') {
            // creation of mayor
            const mayor = templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCity(x, y, 'Mayor'));
            mayor.savings.inc(TONS_OF_MONEY);
            data_1.Data.World.set_faction_leader(faction, mayor.id);
            const mayor_house = effects_1.Effect.new_building(cell_id, "human_house" /* LandPlotType.HumanHouse */, 200, 50);
            data_1.Data.Buildings.set_ownership(mayor.id, mayor_house);
            // creation of first colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCook(x, y, "Cook", 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.Shoemaker(x, y));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanFletcher(x, y, "Fletcher", 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.ArmourMaster(x, y));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.WeaponMasterWood(x, y, 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanLocalTrader(x, y, "Local Trader", 'city'));
            templates_1.Template.Character.Fisherman(x, y, "Fisherman 1");
            templates_1.Template.Character.Fisherman(x, y, "Fisherman 2");
            // colony mages
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.Alchemist(x, y, 'city'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.Mage(x, y, 'city'));
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
            const innkeeper = templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCity(x, y, "Innkeeper"));
            const inn = effects_1.Effect.new_building(cell_id, "inn" /* LandPlotType.Inn */, 200, 10);
            data_1.Data.Buildings.set_ownership(innkeeper.id, inn);
        }
        if (faction == 'steppe_humans') {
            // innkeeper
            const innkeeper = templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCity(x, y, "Innkeeper"));
            const inn = effects_1.Effect.new_building(cell_id, "inn" /* LandPlotType.Inn */, 200, 10);
            data_1.Data.Buildings.set_ownership(innkeeper.id, inn);
            // creation of local colonists
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.HumanCook(x, y, "Cook", 'steppe'));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.WeaponMasterBone(x, y, faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.BloodMage(x, y, faction));
            templates_1.Template.Character.EquipClothesBasic(templates_1.Template.Character.MasterUnarmed(x, y, faction));
            templates_1.Template.Character.Lumberjack(x, y, "Lumberjack 1");
            templates_1.Template.Character.Lumberjack(x, y, "Lumberjack 2");
        }
        if (faction == 'rats') {
            const rat_lair = effects_1.Effect.new_building(cell_id, "rat_lair" /* LandPlotType.RatLair */, 400, 0);
        }
        if (faction == 'elodino_free') {
            const elodino_city = effects_1.Effect.new_building(cell_id, "elodino_house" /* LandPlotType.ElodinoHouse */, 400, 0);
        }
        if (faction == 'graci') {
            for (let i = 1; i <= 30; i++) {
                const cell_obj = data_1.Data.Cells.from_id(cell_id);
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
        for (const character of data_1.Data.CharacterDB.list()) {
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
        }
        let spawn = data_1.Data.World.get_faction('city')?.spawn_point;
        if (spawn != undefined) {
            let cell = data_1.Data.Cells.from_id(spawn);
            if (num_hunters < 4) {
                templates_1.Template.Character.HumanRatHunter(cell.x, cell.y, "Hunter");
            }
        }
        // console.log('Game master update')
        for (const cell of data_1.Data.Cells.list_ids()) {
            let cell_object = data_1.Data.Cells.from_id(cell);
            const buildings = data_1.Data.Buildings.from_cell_id(cell);
            if (buildings != undefined) {
                for (const item_id of buildings) {
                    const building = data_1.Data.Buildings.from_id(item_id);
                    if (building.type == "rat_lair" /* LandPlotType.RatLair */) {
                        cell_object.rat_scent = 200;
                        cell_object.rat_scent += 5 * dt / 100;
                        spawn_rat(num_rats, cell_object);
                    }
                    if (building.type == "elodino_house" /* LandPlotType.ElodinoHouse */) {
                        let cell_object = data_1.Data.Cells.from_id(cell);
                        spawn_ball(num_balls, cell_object);
                    }
                }
            }
            let set = data_1.Data.Cells.get_characters_set_from_cell(cell);
            if (set != undefined) {
                for (const character_id of set) {
                    let character = data_1.Data.CharacterDB.from_id(character_id);
                    if ((character.race == 'rat') && (character.dead())) {
                        cell_object.rat_scent -= 1 * dt / 10;
                    }
                }
            }
        }
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
