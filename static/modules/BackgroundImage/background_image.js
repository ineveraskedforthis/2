import { elementById } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
export function image_url(terrain, forest, house_level, urbanisation) {
    if (house_level == 0) {
        if (forest > 40) {
            return 'url("/static/img/bg/forest.png")';
        }
        if (urbanisation > 6) {
            return 'url("/static/img/bg/urban_3.png")';
        }
        if (urbanisation > 3) {
            return 'url("/static/img/bg/urban_2.png")';
        }
        switch (terrain) {
            case 0 /* Terrain.void */: {
                return 'url("/static/img/bg/forest.png")';
            }
            case 1 /* Terrain.steppe */: {
                if (urbanisation == 0) {
                    return 'url("/static/img/bg/red_steppe.png")';
                }
                return 'url("/static/img/bg/urban_1.png")';
            }
            case 2 /* Terrain.sea */: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
            case 3 /* Terrain.coast */: {
                return 'url("/static/img/bg/coast.png")';
            }
            case 4 /* Terrain.rupture */: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
            case 5 /* Terrain.ashlands */: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
        }
    }
    return 'url("/static/img/bg/house.png")';
}
export class BackgroundImage {
    constructor(locations_list) {
        this.locations_table = locations_list;
    }
    update_display() {
        let div = elementById('actual_game_scene');
        const current_location = globals.character_data?.location_id;
        if (current_location == undefined)
            return;
        let location_data = undefined;
        for (const item of this.locations_table.data) {
            if (item.id == current_location.value) {
                location_data = item;
            }
        }
        if (location_data == undefined)
            return;
        div.style.backgroundImage = image_url(location_data.terrain, location_data.forest, location_data.house_level, location_data.urbanisation);
    }
}
