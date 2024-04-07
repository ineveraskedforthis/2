interface ValueInterface {
    value: number;
}

interface CharacterView {
    id: number;
    name: string;
    dead: boolean;
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