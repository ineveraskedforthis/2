"""
Handles Forest layer operations
"""
from world_editor_types import Coordinate
from world_editor_canvas_manipulation import GameMap, PreGameMap

from world_editor_data import TERRAIN, FOREST

def paint_pixel(game_map: GameMap, coord: Coordinate, strength: int):
    """
    Sets pixel on map
    """
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    if TERRAIN[coord] == 'sea':
        return
    current = FOREST.get(coord, 0)
    FOREST[coord] = min(current + strength, 9)

def render_pixel(game_map: PreGameMap, coord: Coordinate):
    """
    Renders pixel on map
    """
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    terrain = TERRAIN.get(coord, None)
    if terrain == 'sea':
        game_map.display_coord(coord, 'blue')
        return
    if terrain is None:
        game_map.display_coord(coord, 'black')
        return
    value = FOREST.get(coord, 0)
    game_map.display_coord(coord, '#' + str(min(value, 9)) + '00000')
