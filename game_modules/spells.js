module.exports = {
    'kinetic_bolt': (result) => {
        let damage = {};
        damage.blunt = 5;
        damage.slice = 0;
        damage.pierce = 0;
        damage.fire = 0;
        result.damage = damage;
        return result;
    },
    'charge': (result) => {
        let damage = {};
        damage.blunt = 1;
        damage.slice = 0;
        damage.pierce = 0;
        damage.fire = 0;
        result.damage = damage;
        result.close_distance = true;
        result.rage = 20;
        return result;
    }
}