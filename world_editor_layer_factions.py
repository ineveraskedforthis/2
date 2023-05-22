"""
Handles Factions layer operations
"""
from world_editor_types import Coordinate
from world_editor_canvas_manipulation import GameMap, PreGameMap
from world_editor_data import FACTION_COLOR, FACTIONS, SPAWN_POINTS, TERRAIN

def render_pixel(game_map: PreGameMap, coord: Coordinate):
    """Renders pixel on map"""
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    terrain = TERRAIN.get(coord, None)
    if terrain == 'sea':
        game_map.display_coord(coord, 'blue')
        return
    if terrain is None:
        game_map.display_coord(coord, 'black')
        return
    faction = FACTIONS.get(coord, None)
    if faction is None:
        game_map.display_coord(coord, 'black')
        return
    game_map.display_coord(coord, FACTION_COLOR[faction])
    spawn_point = SPAWN_POINTS.get(faction, None)
    if coord == spawn_point:
        game_map.display_border(coord, 'black')

def paint_pixel(game_map: GameMap, coord: Coordinate, faction: str):
    """
    Renders pixel on map
    """
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    FACTIONS[coord] = faction

def set_spawn(game_map: GameMap, coord: Coordinate):
    """Sets spawn point of faction"""
    if not((0 <= coord[0] < game_map.size[0]) and (0 <= coord[1] < game_map.size[1])):
        return
    faction = FACTIONS.get(coord, None)
    if faction is None:
        return
    SPAWN_POINTS[faction] = coord
