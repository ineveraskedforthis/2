"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMaster = void 0;
const data_1 = require("./data");
const effects_1 = require("./events/effects");
const materials_manager_1 = require("./manager_classes/materials_manager");
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
            const mayor = templates_1.Template.Character.HumanCity(x, y, 'Mayor');
            mayor.savings.inc(TONS_OF_MONEY);
            data_1.Data.World.set_faction_leader(faction, mayor.id);
            const mayor_house = effects_1.Effect.new_building(cell_id, "human_house" /* LandPlotType.HumanHouse */, 200);
            data_1.Data.Buildings.set_ownership(mayor.id, mayor_house);
            // creation of first colonists
            const cook = templates_1.Template.Character.HumanCook(x, y, "Cook", 'city');
            const shoemaker = templates_1.Template.Character.HumanCity(x, y, "Bootmaker");
            shoemaker.skills.clothier = 100;
            shoemaker.perks.shoemaker = true;
            shoemaker.stash.inc(materials_manager_1.RAT_SKIN, 50);
            shoemaker.savings.inc(LUMP_OF_MONEY);
            const fletcher = templates_1.Template.Character.HumanFletcher(x, y, "Fletcher", 'city');
            const armourer = templates_1.Template.Character.HumanCity(x, y, "Armourer");
            armourer.skills.clothier = 100;
            armourer.perks.shoemaker = true;
            armourer.stash.inc(materials_manager_1.RAT_SKIN, 50);
            armourer.savings.inc(LUMP_OF_MONEY);
            const hunter_1 = templates_1.Template.Character.HumanRatHunter(x, y, "Hunter 1");
            const hunter_2 = templates_1.Template.Character.HumanRatHunter(x, y, "Hunter 2");
            // innkeeper
            const innkeeper = templates_1.Template.Character.HumanCity(x, y, "Innkeeper");
            const inn = effects_1.Effect.new_building(cell_id, "inn" /* LandPlotType.Inn */, 200);
            data_1.Data.Buildings.set_ownership(innkeeper.id, inn);
        }
    }
    GameMaster.spawn_faction = spawn_faction;
})(GameMaster = exports.GameMaster || (exports.GameMaster = {}));
