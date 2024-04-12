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