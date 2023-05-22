"""
Terrain handling
"""
from world_editor_types import Coordinate
from world_editor_canvas_manipulation import GameMap, PreGameMap

from world_editor_data import TERRAIN

directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]]


def terrain_to_color(terrain: str) -> str:
    """
    Converts terrain string to color string
    """
    match terrain:
        case "void":
            return "black"
        case "steppe":
            return "orange3"
        case "coast":
            return "yellow"
        case "sea":
            return "blue"
        case "rupture":
            return "red"
        case "ashlands":
            return "grey"

    return "purple"


def paint_pixel(game_map: GameMap, coord: Coordinate, terrain: str):
    """
    Sets pixel on map
    """
    if not ((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    TERRAIN[coord] = terrain
    # render_pixel(game)
    # game_map.display_coord(coord, terrain_to_color(terrain))


def render_pixel(game_map: PreGameMap, coord: Coordinate):
    """
    Renders pixel on map
    """
    terrain = TERRAIN.get(coord, "void")
    game_map.display_coord(coord, terrain_to_color(terrain))


def fill(game_map: GameMap, coord: Coordinate, terrain: str):
    """
    Fills continous area of terrain with new terrain
    """
    if not ((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return

    starting_terrain = TERRAIN.get(coord, None)
    if starting_terrain == terrain:
        return
    paint_pixel(game_map, coord, terrain)
    render_pixel(game_map, coord)
    for direction in directions:
        new_coord = (coord[0] + direction[0], coord[1] + direction[1])
        next_terrain = TERRAIN.get(new_coord, None)
        if next_terrain == starting_terrain:
            fill(game_map, new_coord, terrain)
