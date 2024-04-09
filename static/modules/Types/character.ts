interface ValueInterface {
    id: string;
    value: number;
}

interface LimitedValueInterface extends ValueInterface {
    max_value: number;
}

interface BulkAmountInterface extends ValueInterface {
    material_index: number;
    material_string: string;
}

interface CharacterView {
    id: number;
    name: string;
    dead: boolean;
}

interface BulkOrderView {
    tag: number,
    amount: number,
    price: number,
    id: number,
    typ: string,
    owner_id: number,
    owner_name: string
}

interface CraftItemView {
    id: string
    output_model: string
    input: ItemAmountView[]
}

interface CraftBulkUpdateView {
    tag: string
    value: ItemAmountView[]
}

interface CraftItemUpdateView {
    tag: string
    value: number
}

interface ItemAmountView {
    amount: number,
    material: number
}

interface CraftBulkView {
    id: string
    output: ItemAmountView[]
    input: ItemAmountView[]
}

type DamageTag = 'fire'|'blunt'|'pierce'|'slice'
type PerDamageNumber = Record<DamageTag, number>

interface AttackView {
    damage: PerDamageNumber
}

interface ChatMessage {
    msg: string
    user: string
}

interface BattleLogData {
    role: 'defender'|'attacker',
    attack : AttackView,
    res: PerDamageNumber,

    total: number
}

interface DependencyUI {
    update_display: () => void;
}

interface CharacterDataBasic {
    id: number,
    name: string,
}

interface CharacterDataExpanded extends CharacterDataBasic {
    savings: ValueInterface,
    savings_trade: ValueInterface,
    stash: ValueInterface[]
}