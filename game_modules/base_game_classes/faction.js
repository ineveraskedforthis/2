
var common = require("../common.js");
const {constants} = require("../static_data/constants.js");
const { Savings } = require("./savings.js");

module.exports = class Faction {
    constructor(world) {
        this.world = world;
        this.savings = new Savings()
        this.changed = false;
        this.leader_id = -1;
    }

     init(pool, tag) {
        this.tag = tag
        this.id =  this.load_to_db(pool);
        return this.id;
    }

     update(pool) {
        if (this.changed || this.savings.changed) {
            this.save_to_db(pool)
        }
    }

    set_leader(char) {
        this.leader_id = char.id;
        this.changed = true;
    }   

     save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
         common.send_query(pool, constants.update_faction_query, [this.id, this.savings.get_json(), this.leader_id]);
    }

     load_to_db(pool) {
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            // @ts-ignore: Unreachable code error
            global.last_id += 1
            // @ts-ignore: Unreachable code error
            return global.last_id
        }
        let res =  common.send_query(pool, constants.insert_faction_query, [this.tag, this.savings.get_json(), this.leader_id]);
        return res.rows[0].id
    }    

    load_from_json(data) {
        this.tag = data.tag
        this.savings.load_from_json(data.savings)
        this.id = data.id;
        this.leader_id = data.leader_id
    }
}