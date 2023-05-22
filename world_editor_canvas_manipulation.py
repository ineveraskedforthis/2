"""
Manipulates with canvas rectangles
"""
import tkinter as tk
import typing
import math

from world_editor_types import Coordinate

GRID_STEP_X: typing.Final[int] = 10
GRID_STEP_Y: typing.Final[int] = 10
SIZE: typing.Final[int] = 10


class PreGameMap:
    """Dummy class to use in typing"""

    size: Coordinate

    def display_border(
        self,
        coord: Coordinate,  # pylint: disable=unused-argument
        color: str,  # pylint: disable=unused-argument
    ):
        """renders rect's border"""
        return

    def display_coord(
        self,
        coord: Coordinate,  # pylint: disable=unused-argument
        color: str,  # pylint: disable=unused-argument
    ):
        """renders rect"""
        return


PixelRenderer = typing.Callable[[PreGameMap, Coordinate], None]


class GameMap(PreGameMap):
    """Main class for canvas manupulation"""

    canvas: tk.Canvas
    _game_map: typing.DefaultDict[Coordinate, int]
    size: Coordinate

    def __init__(
        self,
        canvas: tk.Canvas,
        game_map: typing.DefaultDict[Coordinate, int],
        world_size: Coordinate,
    ) -> None:
        self.canvas = canvas
        self._game_map = game_map
        self.size = world_size

    def display_border(self, coord: Coordinate, color: str):
        if not ((0 <= coord[0] < self.size[0]) and (0 <= coord[1] < self.size[1])):
            return
        rect = self._game_map[coord]
        self.canvas.itemconfig(rect, outline=color)

    def display_coord(self, coord: Coordinate, color: str):
        if not ((0 <= coord[0] < self.size[0]) and (0 <= coord[1] < self.size[1])):
            return
        rect = self._game_map[coord]
        self.canvas.itemconfig(rect, fill=color)

    def render_layer(self, renderer: PixelRenderer):
        """Renders layer with provided renderer"""
        for x in range(self.size[0]):  # pylint: disable=invalid-name
            for y in range(self.size[1]):  # pylint: disable=invalid-name
                renderer(self, (x, y))

    def generate_grid(self):
        """Generates rectangles for map rendering"""
        for x in range(self.size[0]):  # pylint: disable=invalid-name
            for y in range(self.size[1]):  # pylint: disable=invalid-name
                left, top, right, bottom = x_y_to_rect(x, y, self.size)
                rect = self.canvas.create_rectangle(
                    left, top, right, bottom, fill="purple"
                )
                self._game_map[(x, y)] = rect


def x_y_to_rect(
    x: int, y: int, size: Coordinate  # pylint: disable=invalid-name
) -> typing.Tuple[float, float, float, float]:
    """Converts rectangle coordinates to rectangle position"""
    z = -x - y  # pylint: disable=invalid-name
    left = x * GRID_STEP_X
    top = (y - z - x * 2) * GRID_STEP_Y / 2 + max(size) * GRID_STEP_Y / 2
    return left, top, left + SIZE, top + SIZE


def coord_to_x_y(s: float, t: float, size: Coordinate):  # pylint: disable=invalid-name
    """Converts coordinate to rectangle coordinate"""
    x = math.floor(s / GRID_STEP_X)  # pylint: disable=invalid-name
    # t = (y - z - x * 2 + max(size)) * GRID_STEP_Y / 2
    # z = -x - y
    # t = (y + y + x - x * 2 + max(size) * GRID_STEP_Y / 2)
    # 2y = 2t / GRID_STEP_Y + x - max(size)
    y = math.floor(  # pylint: disable=invalid-name
        t / GRID_STEP_Y + (x - max(size)) / 2
    )
    return x, y
