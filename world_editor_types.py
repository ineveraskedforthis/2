"""
Main types for world editor
"""
import typing
from enum import Enum
Coordinate = typing.Tuple[int, int]
class CanvasMode(Enum):
    """
    Options for canvas terrain painting
    """
    FILL = 'FILL'
    PAINT = 'PAINT'
    SECONDARY = 'SECONDARY'
