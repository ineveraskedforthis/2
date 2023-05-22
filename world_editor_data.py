"""
Stores world editor data and loads/saves it
"""
import typing

from world_editor_types import Coordinate
from world_editor_canvas_manipulation import GameMap

TERRAIN: typing.DefaultDict[Coordinate, str] = {} #type: ignore
FOREST: typing.DefaultDict[Coordinate, int] = {} #type: ignore
MARKETS: typing.DefaultDict[Coordinate, bool] = {} #type: ignore
FACTIONS: typing.DefaultDict[Coordinate, str] = {} #type: ignore
SPAWN_POINTS: typing.DefaultDict[str, Coordinate] = {} #type: ignore
FACTION_COLOR: typing.DefaultDict[str, str] = {} #type: ignore

def export_world(game_map: GameMap):
    """Exports world into txt files"""
    with open('./default_world/map_terrain.txt', 'w', encoding='utf-8') as file:
        for x in range(game_map.size[0]):
            for y in range(game_map.size[1]):
                terrain = TERRAIN.get((x, y), 'void')
                print(terrain, end=' ', file= file)
            print(file = file)

    with open('./default_world/map_forest.txt', 'w', encoding='utf-8') as file:
        for x in range(game_map.size[0]):
            for y in range(game_map.size[1]):
                forest = FOREST.get((x, y), 0)
                print(forest, end=' ', file= file)
            print(file = file)

    with open('./default_world/map_markets.txt', 'w', encoding='utf-8') as file:
        for x in range(game_map.size[0]):
            for y in range(game_map.size[1]):
                value = MARKETS.get((x, y), 0) + 0
                print(value, end=' ', file= file)
            print(file = file)


def import_world(game_map: GameMap):
    """Imports world from txt files"""
    try:
        with open('./default_world/map_terrain.txt', encoding='utf-8') as file:
            for x in range(game_map.size[0]):
                line = file.readline().strip().split()
                for y in range(game_map.size[1]):
                    TERRAIN[(x, y)] = line[y]
    except OSError:
        print('no world terrain found for import')

    try:
        with open('./default_world/map_forest.txt', encoding='utf-8') as file:
            for x in range(game_map.size[0]):
                line = file.readline().strip().split()
                for y in range(game_map.size[1]):
                    FOREST[(x, y)] = int(line[y])
    except OSError:
        print('no forest file')

    try:
        with open('./default_world/map_markets.txt', encoding='utf-8') as file:
            for x in range(game_map.size[0]):
                line = file.readline().strip().split()
                for y in range(game_map.size[1]):
                    MARKETS[(x, y)] = bool(int(line[y]))
    except OSError:
        print('no market file')
        