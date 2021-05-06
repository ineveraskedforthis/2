module.exports = function generate_empty_attack_result() {
    let result = {}

    result.flags = {
        crit: false,
        evade: false,
        miss: false,
        poison: false,
        blocked: false
    }

    result.defender_status_change = {
        hp: 0,
        rage: 0,
        stress: 0,
        blood: 0
    }

    result.attacker_status_change = {
        hp: 0,
        rage: 0,
        stress: 0,
        blood: 0
    }

    result.total_damage = 0;

    return result
}