import { constants } from "../static_data/constants";
import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { money, Savings } from "../base_game_classes/savings";
import { EntityManager } from "../manager_classes/entity_manager";
import { SocketManager } from "../manager_classes/socket_manager";
import { affix, Armour, ArmourConstructorArgument, Weapon, WeaponConstructorArgument } from "../static_data/item_tags";
import { PgPool } from "../world";
import { OrderItemSocketData } from "../../shared/market_order_data";

const common = require("../common.js");

const hour = 1000 * 60 * 60;
const time_intervals = [1000 * 60, hour * 12, hour * 24, hour * 48];


export type auction_id = number & { __brand: "auction_id"}
export type auction_order_id = number & { __brand: "auction_order_id"}
export type auction_order_id_raw = number & { __brand: "auction_order_id", __brand2: "raw"}

function nodb_mode_id():number|undefined {
    // @ts-ignore: Unreachable code error
    if (global.flag_nodb) {
        // @ts-ignore: Unreachable code error
        global.last_id += 1
        // @ts-ignore: Unreachable code error
        return global.last_id
    }
    return undefined
}

export function nodb_mode_check():boolean {
    // @ts-ignore: Unreachable code error
    return global.flag_nodb
}

enum AuctionResponce {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    NO_SUCH_ORDER = 'no_such_order',
    OK = 'ok',
    NOT_ENOUGH_MONEY = 'not_enough_money',
    INVALID_ORDER = 'invalid_order'
}
    

export namespace AuctionOrderManagement {
    export async function build_order(pool: PgPool, owner: CharacterGenericPart, latest_bidder: CharacterGenericPart, item: Weapon|Armour, buyout_price: money, starting_price: money, end_time: number, cell_id: number, flags: OrderFlags) {
        let order_id = await AuctionOrderManagement.insert_to_db( pool, 
                                                            item,
                                                            owner.id,
                                                            buyout_price,
                                                            starting_price,
                                                            owner.id,
                                                            end_time,
                                                            cell_id)
        let order = new OrderItem(item, owner, latest_bidder, buyout_price, starting_price, end_time, order_id, flags)
        return order
    }

    export async function insert_to_db(pool: PgPool,
                                       item: Weapon|Armour, 
                                       owner_id: number, 
                                       buyout_price: money, 
                                       current_price: money, 
                                       latest_bidder: number, 
                                       end_time: number, 
                                       cell_id: number): Promise<auction_order_id> {
        let nodb = nodb_mode_id()
        if (nodb != undefined) {
            return nodb as auction_order_id
        }

        let result = await common.send_query(pool, constants.insert_item_order_query, [item.get_json(), owner_id, buyout_price, current_price, latest_bidder, end_time, cell_id]);
        return result.rows[0].id as auction_order_id;
    }
    
    export function order_to_json(order: OrderItem) {
        let responce:OrderItemJson = {
            id: order.id,
            item: order.item.get_json(),
            owner_id: order.owner_id,
            owner_name: order.owner.name,
            buyout_price: order.buyout_price,
            current_price: order.current_price,
            latest_bidder_id: order.latest_bidder.id,
            latest_bidder_name: order.latest_bidder.name,
            end_time: order.end_time,
            cell_id: order.owner.cell_id,
            flags: order.flags
        }
        return responce
    }

    export function order_to_socket_data(order: OrderItem):OrderItemSocketData {
        return {
            seller_name: order.owner.name,
            price: order.buyout_price,
            item_name: order.item.get_tag(),
            affixes: [],
            id: order.id
        }
    }

    export function json_to_order(data: OrderItemJson, entity_manager:EntityManager) {
        let item_data = data.item
        let item = null
        switch(item_data.item_type) {
            case 'armour': item = new Armour(data.item as ArmourConstructorArgument);
            case 'weapon': item = new Weapon(data.item as WeaponConstructorArgument)
        }

        let owner = entity_manager.chars[data.owner_id]
        let latest_bidder = entity_manager.chars[data.latest_bidder_id]

        let order = new OrderItem(item, owner, latest_bidder, data.buyout_price, data.current_price, data.end_time, data.id, data.flags)

        return order
    }

    export async function save_db(pool: PgPool, order: OrderItem) {
        await common.send_query(pool, constants.update_item_order_query, [order.id, order.current_price, order.latest_bidder.id])
    }

    export async function delete_db(pool: PgPool, order: OrderItem) {
        await common.send_query(pool, constants.delete_item_order_query, [order.id]);
    }
}

export namespace AuctionManagement {

    export async function sell(pool: PgPool, entity_manager: EntityManager, socket_manager: SocketManager, seller: CharacterGenericPart, type: 'armour'|'weapon', backpack_id: number, buyout_price: money, starting_price:money): Promise<{ responce: AuctionResponce; }> {
        // if (auction.cell_id != seller.cell_id) {
        //     return {responce: AuctionResponce.NOT_IN_THE_SAME_CELL}
        // }
        let cell = seller.cell_id
        let item = null
        switch(type){
            case 'armour': {item = seller.equip.data.backpack.armours[backpack_id];break};
            case 'weapon': {item = seller.equip.data.backpack.weapons[backpack_id];break};
        }
        

        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }

        switch(type){
            case 'armour': {seller.equip.data.backpack.armours[backpack_id] = undefined;break};
            case 'weapon': {seller.equip.data.backpack.weapons[backpack_id] = undefined;break};
        }

        let time = Date.now() + time_intervals[1]

        let order = await AuctionOrderManagement.build_order(   pool, 
                                                                seller, 
                                                                seller, 
                                                                item, 
                                                                buyout_price, 
                                                                starting_price, 
                                                                time, 
                                                                cell, 
                                                                {   
                                                                    finished: false, 
                                                                    // item_sent:false, 
                                                                    // profit_sent: false
                                                                })
        
        console.log(AuctionOrderManagement.order_to_json(order))
        entity_manager.add_item_order(order)
        socket_manager.send_item_market_update(order.owner.cell_id)

        return {responce: AuctionResponce.OK}
    }


    export async function load(pool: PgPool, entity_manager: EntityManager) {
        if (nodb_mode_check()) {
            return
        }

        let responce = await common.send_query(pool, constants.load_item_orders_query);

        for (let data of responce.rows) {
            let order = AuctionOrderManagement.json_to_order(data, entity_manager)
            entity_manager.add_item_order(order)
        }
    }
    
    export function cell_id_to_orders_list(manager: EntityManager, cell_id: number): OrderItem[] {
        let tmp = []
        for (let order of manager.item_orders) {
            if (order == undefined) continue;
            if (order.flags.finished) continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(order)
            }
        }
        return tmp
    }

    export function cell_id_to_orders_socket_data_list(manager: EntityManager, cell_id: number): OrderItemSocketData[] {
        let tmp = []
        for (let order of manager.item_orders) {
            if (order == undefined) continue;
            if (order.flags.finished) continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(AuctionOrderManagement.order_to_socket_data(order))
            }
        }
        return tmp
    }

    export function cell_id_to_orders_json_list(manager: EntityManager, cell_id: number): OrderItemJson[] {
        let tmp = []
        for (let order of manager.item_orders) {
            if (order == undefined) continue;
            if (order.flags.finished) continue;
            if (order.owner.cell_id == cell_id) {
                tmp.push(AuctionOrderManagement.order_to_json(order))
            }
        }
        return tmp
    }

    /**  Sends money to seller and sends item to buyer
    * */
    export async function buyout(pool: PgPool, manager: EntityManager, socket_manager: SocketManager, buyer: CharacterGenericPart, id: auction_order_id_raw) {
        let order = manager.raw_id_to_item_order(id)

        if (order == undefined) {
            return AuctionResponce.NO_SUCH_ORDER
        }

        if (order.owner.cell_id != buyer.cell_id) {
            return AuctionResponce.NOT_IN_THE_SAME_CELL
        }

        if (buyer.savings.get() < order.buyout_price) {
            return AuctionResponce.NOT_ENOUGH_MONEY
        }

        if (order.flags.finished) {
            return AuctionResponce.INVALID_ORDER
        }

        // order.return_money()
        order.flags.finished = true
        order.latest_bidder = buyer
        let owner = order.owner
        buyer.savings.transfer(owner.savings, order.buyout_price)
        let item = order.item
        switch(item.item_type) {
            case 'armour': buyer.equip.add_armour(item as Armour);
            case 'weapon': buyer.equip.add_weapon(item as Weapon)
        }
        // order.flags.item_sent = true

        socket_manager.send_savings_update(buyer)
        socket_manager.send_item_market_update(order.owner.cell_id)

        AuctionOrderManagement.delete_db(pool, order)

        return AuctionResponce.OK
    }

    export function cancel_order(pool: PgPool, manager: EntityManager, socket_manager: SocketManager, who: CharacterGenericPart, order_id: auction_order_id_raw) {
        let order = manager.raw_id_to_item_order(order_id)

        if (order == undefined) {
            return AuctionResponce.NO_SUCH_ORDER
        }

        if (order.owner_id != who.id) {
            return AuctionResponce.INVALID_ORDER
        }

        let owner = order.owner

        order.flags.finished = true
        let item = order.item
        switch(item.item_type) {
            case 'armour': owner.equip.add_armour(item as Armour);
            case 'weapon': owner.equip.add_weapon(item as Weapon)
        }

        socket_manager.send_item_market_update(order.owner.cell_id)

        AuctionOrderManagement.delete_db(pool, order)
    }

    export function cancel_order_safe(pool: PgPool, manager: EntityManager, socket_manager: SocketManager, who: CharacterGenericPart, order_id: auction_order_id) {
        let order = manager.get_item_order(order_id)
        let owner = order.owner

        order.flags.finished = true
        let item = order.item
        switch(item.item_type) {
            case 'armour': owner.equip.add_armour(item as Armour);
            case 'weapon': owner.equip.add_weapon(item as Weapon)
        }

        socket_manager.send_item_market_update(order.owner.cell_id)
        AuctionOrderManagement.delete_db(pool, order)
    }
    

    export function cancel_all_orders(pool: PgPool, manager: EntityManager, socket_manager: SocketManager, who: CharacterGenericPart) {
        for (let order of manager.item_orders) {
            if (order == undefined) continue;
            if (order.flags.finished) continue;
            if (order.owner_id = who.id) cancel_order_safe(pool, manager, socket_manager, who, order.id)
        }
    }
}

interface OrderItemJson {
    item: WeaponConstructorArgument|ArmourConstructorArgument;
    owner_id: number;
    buyout_price: money;
    current_price: money;
    latest_bidder_id: number;
    end_time: number;
    id: auction_order_id;
    owner_name: string;
    latest_bidder_name: string;
    cell_id: number;
    flags: OrderFlags
}

interface OrderFlags {
        finished: boolean,
        // profit_sent: boolean,
        // item_sent: boolean
    }

export class OrderItem {
    item: Weapon|Armour;
    owner: CharacterGenericPart;
    owner_id: number;
    buyout_price: money;
    current_price: money;
    latest_bidder: CharacterGenericPart;
    end_time: number;
    id: auction_order_id
    flags: OrderFlags

    constructor(item: Weapon|Armour, owner: CharacterGenericPart, latest_bidder:CharacterGenericPart, buyout_price: money, current_price: money, end_time: number, id: auction_order_id, flags: OrderFlags) {
        this.item = item;
        this.owner = owner;
        this.owner_id = owner.id;
        this.buyout_price = buyout_price;
        this.current_price = current_price;
        this.latest_bidder = latest_bidder;
        this.end_time = end_time;
        this.id = id;
        this.flags = flags
    }
}