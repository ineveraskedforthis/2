"""
Main game_map.canvas on-click callback generator
"""
import tkinter as tk
import random

import world_editor_layer_terrain as Terrain
import world_editor_layer_forest as Forest
import world_editor_layer_factions as Factions
import world_editor_layer_markets as Markets

from world_editor_canvas_manipulation import GameMap, coord_to_x_y


class MapInteraction:
    """Responsible for callbacks for map actions"""
    def __init__(self):
        self.drag = False

    def init_canvas(self, game_map: GameMap, terrain_brush, faction_brush, mode, layer):
        """Binds callbacks to game_map.canvas"""
        game_map.canvas.bind("<ButtonRelease-1>", self.drag_stop)
        game_map.canvas.bind("<Button-1>",
                    self.bind_button_press(game_map,
                                           terrain_brush,
                                           faction_brush,
                                           mode,
                                           layer))
        game_map.canvas.bind("<B1-Motion>",
                    self.canvas_callback(game_map,
                                         terrain_brush,
                                         faction_brush,
                                         mode,
                                         layer))

    def drag_start(self,
                   event: tk.Event, # pylint: disable=unused-argument
                   ):
        """Start dragging brush"""
        self.drag = True

    def drag_stop(self,
                  event: tk.Event, # pylint: disable=unused-argument
                  ):
        """Stop dragging brush"""
        self.drag  = False

    def bind_button_press(self,
                          game_map: GameMap,
                          current_brush,
                          current_faction_brush,
                          mode_variable,
                          map_layer_variable):
        """Generate callback for button press"""
        def callback(event):
            self.drag_start(event)
            self.canvas_callback(game_map,
                                 current_brush,
                                 current_faction_brush,
                                 mode_variable,
                                 map_layer_variable)(event)

        return callback

    def canvas_callback(self, game_map: GameMap,
                        terrain: tk.StringVar,
                        faction: tk.StringVar, # pylint: disable=unused-argument
                        mode: tk.StringVar,
                        layer: tk.StringVar):
        """
        Creates callback to use in on-click events.
        """
        def callback(event: tk.Event):
            if self.drag:
                selected_mode = mode.get()
                selected_layer = layer.get()
                coord = coord_to_x_y(event.x, event.y, game_map.size)
                # print(x, y, selected_mode)
                if selected_layer  == 'terrain':
                    selected_terrain = terrain.get()
                    if selected_mode == "CanvasMode.PAINT":
                        Terrain.paint_pixel(game_map, coord, selected_terrain)
                        Terrain.render_pixel(game_map, coord)
                    elif selected_mode == "CanvasMode.FILL":
                        Terrain.fill(game_map, coord, selected_terrain)
                elif selected_layer  == 'forest':
                    noise = [(random.gauss(0, 30), random.gauss(0, 30)) for i in range(10)]
                    Forest.paint_pixel(game_map, coord, 2)
                    Forest.render_pixel(game_map, coord)
                    for item in noise:
                        map_coord = coord_to_x_y(event.x + item[0],
                                                 event.y + item[1],
                                                 game_map.size)
                        Forest.paint_pixel(game_map, map_coord, 1)
                        Forest.render_pixel(game_map, map_coord)
                elif selected_layer == 'markets':
                    Markets.paint_pixel(game_map, coord)
                    Markets.render_pixel(game_map, coord)
                elif selected_layer == 'factions':
                    match selected_mode:
                        case "CanvasMode.PAINT":
                            selected_faction = faction.get()
                            Factions.paint_pixel(game_map, coord, selected_faction)
                            Factions.render_pixel(game_map, coord)
                        case "CanvasMode.SECONDARY":
                            Factions.set_spawn(game_map, coord)

        return callback
