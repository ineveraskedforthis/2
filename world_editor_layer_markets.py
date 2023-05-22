"""
Handles Market layer operations
"""
from world_editor_types import Coordinate
from world_editor_canvas_manipulation import GameMap, PreGameMap

from world_editor_data import MARKETS, TERRAIN

def paint_pixel(game_map: GameMap, coord: Coordinate):
    """
    Sets pixel on map
    """
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    MARKETS[coord] = not MARKETS.get(coord, False)

def render_pixel(game_map: PreGameMap, coord: Coordinate):
    """
    Renders pixel on map
    """
    value = MARKETS.get(coord, 0)
    terrain = TERRAIN.get(coord, None)
    if terrain == 'sea':
        game_map.display_coord(coord, 'blue')
        return
    if terrain is None:
        game_map.display_coord(coord, 'black')
        return
    game_map.display_coord(coord, '#' + str(9 * value) + '00000')
