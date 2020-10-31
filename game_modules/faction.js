class Faction {
    constructor(world, tag, starting_position, control_in_cells, unit) {
        this.world = world;
        this.tag = tag
        this.starting_position = starting_position
        this.control_in_cells = control_in_cells
        this.unit = unit
    }
}

module.exports = {
    Faction: Faction
}