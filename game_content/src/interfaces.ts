interface ItemBlueprint {
    readonly weight: number,
    readonly size: number,
    readonly model_string: string,
    readonly name: string,
    readonly resists: Record<string, number>,
    readonly magic_power: number
}

const enum IMPACT_TYPE {
    POINT,
    BLADE,
    BLUNT
}

    // 'weapon',
    // 'secondary',
    // 'amulet',
    // 'mail',
    // 'left_pauldron',
    // 'right_pauldron',
    // 'left_gauntlet',
    // 'right_gauntlet',
    // 'boots', 'helmet',
    // 'belt',
    // 'robe',
    // 'shirt',
    // 'pants',
    // 'dress',
    // 'socks'

class BlueprintConfiguration {
    static IMPACT_TYPES : IMPACT_TYPE[] = [IMPACT_TYPE.POINT, IMPACT_TYPE.BLADE, IMPACT_TYPE.BLUNT]
}

interface WeaponBlueprint extends ItemBlueprint {
    readonly impact: IMPACT_TYPE
    readonly length: number
}