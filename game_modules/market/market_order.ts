var common = require("../common.js");
import {constants} from "../static_data/constants.js";
import type {World} from "../world";
import type {tag} from "../static_data/type_script_types"
import type { CharacterGenericPart } from "../base_game_classes/character_generic_part.js";

export class MarketOrder {
    world: World;
    id: number;
    typ: 'sell'|'buy'
    tag: tag
    owner_id: number
    owner: CharacterGenericPart|undefined
    amount: number
    price: number
    market_id: number

    constructor(world: World) {
        this.id = -1
        this.world = world;
        this.typ = 'sell'
        this.tag = 'meat'
        this.owner = undefined
        this.owner_id = -1
        this.amount = 0
        this.price = 0
        this.market_id = 0
    }

    async init(pool:any, typ:'sell'|'buy', tag: tag, owner: CharacterGenericPart, amount: number, price: number, market_id: number) {
        this.typ = typ;
        this.tag = tag;
        this.owner_id = owner.id;
        this.owner = owner
        this.amount = amount;
        this.price = price;
        this.market_id = market_id;
        if (constants.logging.market_order.init) {
            console.log('market order init');
        }
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool: any) {
        let result = await common.send_query(pool, constants.insert_market_order_query, [this.typ, this.tag, this.owner_id, this.amount, this.price, this.market_id]);
        return result.rows[0].id;
    }

    async save_to_db(pool: any) {
        await common.send_query(pool, constants.update_market_order_query, [this.id, this.amount]);
    }

    async delete_from_db(pool: any) {
        await common.send_query(pool, constants.delete_market_order_query, [this.id]);
    }

    load_from_json(data: any) {
        this.typ = data.typ;
        this.tag = data.tag;
        this.owner_id = data.owner_id;
        this.owner = this.world.get_char_from_id(this.owner_id);
        this.amount = data.amount;
        this.price = data.price;
        this.id = data.id;
        this.market_id = data.market_id;
        if (this.owner == undefined) {
            return false
        } else {
            return true
        }
    }

    get_json() {
        var tmp: any = {};
        tmp.typ = this.typ;
        tmp.tag = this.tag;
        tmp.owner_id = this.owner_id;
        if (this.owner != undefined) {
            tmp.owner_name = this.owner.name;
            tmp.owner_tag = this.owner.tag;
        }
        tmp.amount = this.amount;
        tmp.price = this.price;
        tmp.id = this.id;
        tmp.market_id = this.market_id;
        return tmp;
    }
}