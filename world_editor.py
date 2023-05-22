"""
World editor for the game.
"""
import tkinter as tk
import functools as ft

import sys

from world_editor_types import CanvasMode
from world_editor_canvas_manipulation import GameMap

import world_editor_layer_terrain as Terrain
import world_editor_layer_forest as Forest
import world_editor_layer_factions as Factions
import world_editor_layer_markets as Markets

from world_editor_data import export_world, import_world, FACTION_COLOR
from world_editor_main_callback import MapInteraction

sys.setrecursionlimit(10000)
root = tk.Tk()
canvas = tk.Canvas(root, bg="white", height=1000, width=1000)
world_size = tk.StringVar(root, "????")
current_terrain_brush = tk.StringVar(root, "void")
current_faction_brush = tk.StringVar(root, "void")
mode_variable = tk.Variable(root, CanvasMode.PAINT)
map_layer_variable = tk.StringVar(root, "terrain")

CurrentGameMap = GameMap(canvas, {}, (0, 0)) #type: ignore
MapInteractor = MapInteraction()
MapInteractor.init_canvas(CurrentGameMap,
                          current_terrain_brush,
                          current_faction_brush,
                          mode_variable,
                          map_layer_variable)


MODE: CanvasMode = CanvasMode.PAINT

def print_current_brush(variable: tk.Variable):
    """
    Generates callback for printing selected brush
    """
    def res():
        print(variable.get())
    return res

def new_brush_option(brush_list: tk.Frame, option: str, variable: tk.StringVar):
    """
    Creates new option in given frame
    """
    tk.Radiobutton(brush_list,
                   text=option,
                   variable=variable,
                   value=option,
                   command=print_current_brush(variable)).pack(anchor='w')

def render_map(game_map: GameMap, layer: tk.StringVar):
    """Renders selected layer"""
    selected_layer = layer.get()
    match selected_layer:
        case 'terrain':
            game_map.render_layer(Terrain.render_pixel)
        case 'forest':
            game_map.render_layer(Forest.render_pixel)
        case 'markets':
            game_map.render_layer(Markets.render_pixel)
        case 'factions':
            game_map.render_layer(Factions.render_pixel)

def loader(game_map: GameMap,
           brush_list: tk.Frame,
           faction_brushes: tk.Frame,
           brush_variable: tk.StringVar,
           faction_variable: tk.StringVar,
           layer_variable: tk.StringVar):
    """Generates world loading callback"""
    def load_world():
        with open('./default_world/description.txt', encoding="utf-8") as file:
            inputs = file.read()
            game_map.size = tuple(map(int, inputs.split()))
            world_size.set(inputs)
            game_map.generate_grid()
            import_world(game_map)

        with open('./default_world/terrain.txt', encoding="utf-8") as file:
            for line in file.readlines():
                new_brush_option(brush_list, line.strip(), brush_variable)

        with open('./default_world/factions.txt', encoding="utf-8") as file:
            for line in file.readlines():
                tag, name, color = line.strip().split(';')
                print(tag, name)
                new_brush_option(faction_brushes, tag, faction_variable)
                FACTION_COLOR[tag] = color

        render_map(game_map, layer_variable)


    return load_world

data_frame = tk.Frame(root)

world_size_label = tk.Label(data_frame, textvariable=world_size)
brushes_frame = tk.Frame(data_frame)
faction_brushes_frame = tk.Frame(data_frame)

button = tk.Button(data_frame, text="Export World",
                   command=ft.partial(export_world, CurrentGameMap))

def show_layer(game_map: GameMap, layer: str):
    """
    Generates callback for setting current layer and rendering
    """
    def show():
        map_layer_variable.set(layer)
        render_map(game_map, map_layer_variable)
    return show

button_terrain = tk.Button(data_frame,
                           text="Terrain",
                           command=show_layer(CurrentGameMap, 'terrain'))
button_forest = tk.Button(data_frame,
                          text="Forest",
                          command=show_layer(CurrentGameMap, 'forest'))
button_markets = tk.Button(data_frame,
                           text="Market",
                           command=show_layer(CurrentGameMap, 'markets'))
button_markets = tk.Button(data_frame,
                           text="Factions",
                           command=show_layer(CurrentGameMap, 'factions'))

tk.Label(brushes_frame, text="Select brush: ").pack()

tk.Label(faction_brushes_frame, text="Select faction").pack()

loader(CurrentGameMap,
       brushes_frame,
       faction_brushes_frame,
       current_terrain_brush,
       current_faction_brush,
       map_layer_variable)()


button.pack(padx=5,pady=5,)
button_terrain.pack(padx=5,pady=5,)
button_forest.pack(padx=5,pady=5,)
button_markets.pack(padx=5,pady=5)
world_size_label.pack(padx=5,pady=5,)

brushes_frame.pack()
faction_brushes_frame.pack()

mode_frame = tk.Frame(data_frame)

tk.Radiobutton(mode_frame,
               text="Fill",
               variable=mode_variable,
               value=CanvasMode.FILL,
               command=print_current_brush(mode_variable)).pack()
tk.Radiobutton(mode_frame,
               text="Paint",
               variable=mode_variable,
               value=CanvasMode.PAINT,
               command=print_current_brush(mode_variable)).pack()


mode_frame.pack()
canvas.pack(padx=5, pady=5, side="right")
data_frame.pack(padx=5, pady=5, side='left', expand=True)

root.mainloop()
