import { Terrain } from "@custom_types/common.js";
import { DependencyUI } from "../Types/character.js";
import { elementById } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { List } from "../../widgets/List/list.js";
import { LocationView } from "@custom_types/responses.js";


export function image_url(terrain: Terrain, forest: number, house_level: number, urbanisation: number): string {
    if (house_level == 0) {
        if (forest > 40) {
            return 'url("/static/img/bg/forest.png")';
        }

        switch (terrain) {
            case Terrain.void: {
                return 'url("/static/img/bg/forest.png")';
            }
            case Terrain.steppe: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
            case Terrain.sea: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
            case Terrain.coast: {
                return 'url("/static/img/bg/coast.png")';
            }
            case Terrain.rupture: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
            case Terrain.ashlands: {
                return 'url("/static/img/bg/red_steppe.png")';
            }
        }
    }
    return 'url("/static/img/bg/house.png")';
}

export class BackgroundImage implements DependencyUI {
    locations_table : List<LocationView>

    constructor(locations_list: List<LocationView>) {
        this.locations_table = locations_list
    }

    update_display() {
        let div = elementById('actual_game_scene');

        const current_location = globals.character_data?.location_id

        if (current_location == undefined) return;

        let location_data = undefined

        for (const item of this.locations_table.data) {
            if (item.id == current_location.value) {
                location_data = item
            }
        }

        if (location_data == undefined) return;

        div.style.backgroundImage = image_url(
            location_data.terrain,
            location_data.forest,
            location_data.house_level,
            location_data.urbanisation
        )

        let attachment_0 = elementById("background_attachment_0")
        let attachment_1 = elementById("background_attachment_1")
        let attachment_2 = elementById("background_attachment_2")

        if (location_data.urbanisation > 0) {
            attachment_0.style.backgroundImage = 'url("/static/img/bg/house_central.png")';
        } else {
            attachment_0.style.backgroundImage = '';
        }

        if (location_data.urbanisation > 1) {
            attachment_1.style.backgroundImage = 'url("/static/img/bg/house_right.png")';
        } else {
            attachment_1.style.backgroundImage = '';
        }

        if (location_data.urbanisation > 2) {
            attachment_2.style.backgroundImage = 'url("/static/img/bg/house_left.png")';
        } else {
            attachment_2.style.backgroundImage = '';
        }
    }
}