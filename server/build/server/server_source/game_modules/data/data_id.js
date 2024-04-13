"use strict";
// THIS MODULE MUST BE IMPORTED FIRST
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataID = void 0;
var last_id_battle = 0;
var last_id_character = 0;
var last_id_market_order = 0;
var last_id_location = 0;
var last_id_user = 0;
var user_id_list = [];
var user_id_character = [];
var character_id_list = [];
var character_id_location = [];
var character_id_owned_location_set = [];
var character_id_owned_market_order_set = [];
var character_id_faction_id_reputation = [];
var character_id_leader_of = [];
var character_id_battle = [];
var character_id_user = [];
var character_id_home_location = [];
var battle_id_list = [];
//var battle_id_characters                    : Record<battle_id, Set<character_id>>                              = []
var faction_id_list = [];
var faction_id_leader = {};
var faction_id_spawn = {};
var cell_id_list = [];
var cell_id_location_id_list = [];
var cell_id_location_main = [];
var location_id_list = [];
var location_id_cell = [];
var location_id_owner = [];
var location_id_guests = [];
var market_order_id_list = [];
var market_order_id_owner = [];
const empty_set_orders_bulk = new Set();
var DataID;
(function (DataID) {
    let Connection;
    (function (Connection) {
        function set_main_location(cell, location) {
            cell_id_location_main[cell] = location;
        }
        Connection.set_main_location = set_main_location;
        function set_character_location(character, location) {
            let old_location = character_id_location[character];
            character_id_location[character] = location;
            location_id_guests[old_location].delete(character);
            location_id_guests[location].add(character);
            return old_location;
        }
        Connection.set_character_location = set_character_location;
        function set_character_home(character, location) {
            character_id_home_location[character] = location;
        }
        Connection.set_character_home = set_character_home;
        function set_character_battle(character, battle) {
            const old_battle = character_id_battle[character];
            //if (old_battle != undefined) {
            //    battle_id_characters[old_battle].delete(character)
            //}
            character_id_battle[character] = battle;
            //if (battle != undefined)
            //    battle_id_characters[battle].add(character);
        }
        Connection.set_character_battle = set_character_battle;
        function set_character_user(character, user) {
            if (user == undefined) {
                if (character == undefined) {
                    return;
                }
                else {
                    const old_user = character_id_user[character];
                    if (old_user != undefined) {
                        user_id_character[old_user] = undefined;
                    }
                    character_id_user[character] = undefined;
                }
            }
            else {
                const old_character = user_id_character[user];
                if (old_character != undefined) {
                    character_id_user[old_character] = undefined;
                }
                if (character == undefined) {
                    user_id_character[user] = undefined;
                }
                else {
                    const old_user = character_id_user[character];
                    if (old_user != undefined) {
                        user_id_character[old_user] = undefined;
                    }
                    user_id_character[user] = character;
                    character_id_user[character] = user;
                }
            }
        }
        Connection.set_character_user = set_character_user;
        function set_location_owner(new_owner, location) {
            let old_owner = location_id_owner[location];
            location_id_owner[location] = new_owner;
            if (old_owner != undefined) {
                character_id_owned_location_set[old_owner].delete(location);
            }
            if (new_owner != undefined) {
                character_id_owned_location_set[new_owner].add(location);
            }
        }
        Connection.set_location_owner = set_location_owner;
        function set_faction_leader(leader, faction) {
            const old_leader = faction_id_leader[faction];
            if (old_leader != undefined) {
                character_id_leader_of[old_leader].delete(faction);
            }
            if (leader == undefined) {
                faction_id_leader[faction] = undefined;
                return;
            }
            character_id_leader_of[leader].add(faction);
        }
        Connection.set_faction_leader = set_faction_leader;
        function set_spawn(faction, location) {
            faction_id_spawn[faction] = location;
        }
        Connection.set_spawn = set_spawn;
        function is_character_location(location, character) {
            return location_id_guests[location].has(character);
        }
        Connection.is_character_location = is_character_location;
    })(Connection = DataID.Connection || (DataID.Connection = {}));
    let Cells;
    (function (Cells) {
        function register(id) {
            cell_id_list.push(id);
            cell_id_location_id_list[id] = [];
        }
        Cells.register = register;
        function for_each(callback) {
            cell_id_list.forEach((value, index) => {
                callback(value);
            });
        }
        Cells.for_each = for_each;
        function locations(cell) {
            return cell_id_location_id_list[cell];
        }
        Cells.locations = locations;
        function local_character_id_list(cell) {
            let result = [];
            locations(cell).forEach((location) => {
                result = result.concat(Location.guest_list(location));
            });
            return result;
        }
        Cells.local_character_id_list = local_character_id_list;
        function market_order_id_list(cell) {
            let result = [];
            local_character_id_list(cell).forEach((character) => {
                result = result.concat(Array.from(character_id_owned_market_order_set[character]));
            });
            return result;
        }
        Cells.market_order_id_list = market_order_id_list;
        function main_location(cell) {
            return cell_id_location_main[cell];
        }
        Cells.main_location = main_location;
    })(Cells = DataID.Cells || (DataID.Cells = {}));
    let Location;
    (function (Location) {
        function update_last_id(x) {
            last_id_location = Math.max(x, last_id_location);
        }
        Location.update_last_id = update_last_id;
        function set_up(location) {
            location_id_list.push(location);
            location_id_guests[location] = new Set();
        }
        Location.set_up = set_up;
        function new_id(cell) {
            last_id_location++;
            return register(last_id_location, cell);
        }
        Location.new_id = new_id;
        function register(location, cell) {
            set_up(location);
            let cell_location_list = cell_id_location_id_list[cell];
            cell_location_list.push(location);
            location_id_cell[location] = cell;
            return location;
        }
        Location.register = register;
        function cell_id(location) {
            return location_id_cell[location];
        }
        Location.cell_id = cell_id;
        function owner_id(location) {
            return location_id_owner[location];
        }
        Location.owner_id = owner_id;
        function guest_list(location) {
            return Array.from(location_id_guests[location]);
        }
        Location.guest_list = guest_list;
        function for_each_ownership(callback) {
            location_id_list.forEach((value, index) => {
                callback(value, owner_id(value));
            });
        }
        Location.for_each_ownership = for_each_ownership;
        function set_ownership(character, location) {
            Connection.set_location_owner(character, location);
        }
        Location.set_ownership = set_ownership;
        function unset_ownership(location) {
            Connection.set_location_owner(undefined, location);
        }
        Location.unset_ownership = unset_ownership;
        function for_each(callback) {
            location_id_list.forEach((value, index) => {
                callback(value);
            });
        }
        Location.for_each = for_each;
    })(Location = DataID.Location || (DataID.Location = {}));
    let Faction;
    (function (Faction) {
        function register(faction_id, spawn) {
            faction_id_list.push(faction_id);
            faction_id_spawn[faction_id] = spawn;
        }
        Faction.register = register;
        function list_of_id() {
            return faction_id_list;
        }
        Faction.list_of_id = list_of_id;
        function spawn(faction) {
            return faction_id_spawn[faction];
        }
        Faction.spawn = spawn;
    })(Faction = DataID.Faction || (DataID.Faction = {}));
    let Reputation;
    (function (Reputation) {
        function get(character, faction) {
            const reputation = character_id_faction_id_reputation[character][faction];
            if (reputation == undefined) {
                return "neutral";
            }
            return reputation;
        }
        Reputation.get = get;
        function set(character, faction, reputation) {
            console.log(character, 'is now a', reputation, 'of', faction);
            character_id_faction_id_reputation[character][faction] = reputation;
        }
        Reputation.set = set;
        function character(character) {
            const response = [];
            for (const faction of faction_id_list) {
                response.push({
                    faction_id: faction,
                    reputation: get(character, faction)
                });
            }
            return response;
        }
        Reputation.character = character;
        /**
         *
         * @param a his factions are checked
         * @param X reputation level
         * @param b his reputation is checked
         * @returns **true** if b has a reputation level X with one of factions of a and **false** otherwise
         */
        function a_X_b(a, X, b) {
            for (const faction of faction_id_list) {
                if (get(a, faction) == 'member') {
                    if (get(b, faction) == X) {
                        return true;
                    }
                }
            }
            return false;
        }
        Reputation.a_X_b = a_X_b;
        /**
         * sets reputation of b to X with factions of a
         * @param a his factions are checked
         * @param X reputation level
         * @param b his reputation is changed
         * @returns
         */
        function set_a_X_b(a, X, b) {
            for (const faction of faction_id_list) {
                if (get(a, faction) == 'member') {
                    if (get(b, faction) == X) {
                        set(b, faction, X);
                    }
                }
            }
            return false;
        }
        Reputation.set_a_X_b = set_a_X_b;
        function a_is_enemy_of_b(a, b) {
            for (const faction of faction_id_list) {
                if ((get(b, faction) == 'member') || (get(b, faction) == "leader")) {
                    if (get(a, faction) == 'enemy')
                        return true;
                }
            }
            return false;
        }
        Reputation.a_is_enemy_of_b = a_is_enemy_of_b;
    })(Reputation = DataID.Reputation || (DataID.Reputation = {}));
    let Battle;
    (function (Battle) {
        function new_id() {
            last_id_battle++;
            const id = last_id_battle;
            battle_id_list.push(id);
            //battle_id_characters[id] = new Set()
            return last_id_battle;
        }
        Battle.new_id = new_id;
        function register(id, units) {
            update_last_id(id);
            battle_id_list.push(id);
            units.forEach(unit => {
                character_id_battle[unit] = id;
            });
        }
        Battle.register = register;
        function update_last_id(x) {
            last_id_battle = Math.max(x, last_id_battle);
        }
        Battle.update_last_id = update_last_id;
        function for_each(callback) {
            return battle_id_list.forEach(callback);
        }
        Battle.for_each = for_each;
    })(Battle = DataID.Battle || (DataID.Battle = {}));
    let Character;
    (function (Character) {
        function set_up_id(id, location) {
            character_id_list.push(id);
            character_id_faction_id_reputation[id] = {};
            character_id_owned_location_set[id] = new Set();
            character_id_owned_market_order_set[id] = new Set();
            character_id_leader_of[id] = new Set();
            character_id_location[id] = location;
            location_id_guests[location].add(id);
        }
        Character.set_up_id = set_up_id;
        function new_id(location) {
            last_id_character++;
            set_up_id(last_id_character, location);
            return last_id_character;
        }
        Character.new_id = new_id;
        function register(character, location) {
            set_up_id(character, location);
            update_last_id(character);
        }
        Character.register = register;
        function update_last_id(x) {
            last_id_character = Math.max(x, last_id_character);
        }
        Character.update_last_id = update_last_id;
        function unset_all_ownership(character) {
            let locations = character_id_owned_location_set[character];
            for (let id of locations.values()) {
                location_id_owner[id] = undefined;
            }
            character_id_owned_location_set[character].clear();
        }
        Character.unset_all_ownership = unset_all_ownership;
        function list_of_id() {
            return character_id_list;
        }
        Character.list_of_id = list_of_id;
        function battle_id(character) {
            return character_id_battle[character];
        }
        Character.battle_id = battle_id;
        function location_id(character) {
            return character_id_location[character];
        }
        Character.location_id = location_id;
        function home_location_id(character) {
            return character_id_home_location[character];
        }
        Character.home_location_id = home_location_id;
        function user_id(character) {
            return character_id_user[character];
        }
        Character.user_id = user_id;
        function market_orders_list(character) {
            return Array.from(character_id_owned_market_order_set[character]);
        }
        Character.market_orders_list = market_orders_list;
        function for_each(callback) {
            return character_id_list.forEach(callback);
        }
        Character.for_each = for_each;
    })(Character = DataID.Character || (DataID.Character = {}));
    let MarketOrders;
    (function (MarketOrders) {
        function new_id(owner) {
            last_id_market_order++;
            const id = last_id_market_order;
            market_order_id_list.push(id);
            market_order_id_owner[id] = owner;
            character_id_owned_market_order_set[owner].add(id);
            return id;
        }
        MarketOrders.new_id = new_id;
        function register(order, owner) {
            market_order_id_list.push(order);
            market_order_id_owner[order] = owner;
            DataID.MarketOrders.update_last_id(order);
            character_id_owned_market_order_set[owner].add(order);
        }
        MarketOrders.register = register;
        function for_each(callback) {
            return market_order_id_list.forEach(callback);
        }
        MarketOrders.for_each = for_each;
        function list() {
            return market_order_id_list;
        }
        MarketOrders.list = list;
        function update_last_id(x) {
            last_id_market_order = Math.max(x, last_id_market_order);
        }
        MarketOrders.update_last_id = update_last_id;
        function owner(order) {
            return market_order_id_owner[order];
        }
        MarketOrders.owner = owner;
    })(MarketOrders = DataID.MarketOrders || (DataID.MarketOrders = {}));
})(DataID = exports.DataID || (exports.DataID = {}));
