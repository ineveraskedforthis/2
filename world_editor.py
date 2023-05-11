import tkinter as tk 
import typing
import math
from enum import Enum
import sys
import random

sys.setrecursionlimit(10000)

Coordinate = typing.Tuple[int, int]

root = tk.Tk()

WORLD_SIZE = [0, 0]
GRID_STEP_X = 10
GRID_STEP_Y = 10

GAME_MAP: typing.DefaultDict[Coordinate, int] = dict()
TERRAIN: typing.DefaultDict[Coordinate, str] = dict()
LAYER_FOREST: typing.DefaultDict[Coordinate, int] = dict()

SIZE = 10

def terrain_to_color(terrain: str) -> str:
    match terrain:
        case 'void':
            return 'black'
        case 'steppe':
            return 'orange3'
        case 'coast':
            return 'yellow'
        case 'sea':
            return 'blue'
        case 'rupture':
            return 'red'

def x_y_to_rect(x: int, y: int, size: Coordinate) -> typing.Tuple[int, int, int, int] :
    z = -x - y
    global GRID_STEP_Y
    global GRID_STEP_X
    global SIZE
    left = x * GRID_STEP_X
    top = (y - z - x * 2) * GRID_STEP_Y / 2 + max(size) * GRID_STEP_Y / 2;

    return left, top, left + SIZE, top + SIZE

def coord_to_x_y(s: int, t: int, size: Coordinate):
    global GRID_STEP_Y
    global GRID_STEP_X
    global SIZE
    x = math.floor(s / GRID_STEP_X)
    # t = (y - z - x * 2 + max(size)) * GRID_STEP_Y / 2
    # z = -x - y
    # t = (y + y + x - x * 2 + max(size) * GRID_STEP_Y / 2)
    # 2y = 2t / GRID_STEP_Y + x - max(size)
    y = math.floor(t / GRID_STEP_Y + (x - max(size)) / 2)

    return x, y

DRAG = False

class CANVAS_MODE(Enum):
    FILL = 'FILL'
    PAINT = 'PAINT'


MODE: CANVAS_MODE = CANVAS_MODE.PAINT
def drag_start(event: tk.Event):
    global DRAG
    DRAG = True
def drag_stop(event: tk.Event):
    global DRAG
    DRAG = False

directions = [[0, 1], [0 ,-1], [1, 0] ,[-1 ,0], [1 ,1], [-1 ,-1]]



def fill_terrain(canvas: tk.Canvas, coord: Coordinate, terrain: str):
    if not((0 <= coord[0] < WORLD_SIZE[0]) and (0 <= coord[1] < WORLD_SIZE[1])):
        return 
    
    try:
        starting_terrain = TERRAIN[coord]
    except:
        starting_terrain = None
    if starting_terrain == terrain: 
        return    

    # print(coord, terrain, starting_terrain)
    paint_terrain(canvas, coord, terrain)
    for direction in directions:
        new_coord = (coord[0] + direction[0], coord[1] + direction[1])

        try:
            next_terrain = TERRAIN[new_coord]
        except: 
            next_terrain = None

        if next_terrain == starting_terrain:
            fill_terrain(canvas, new_coord, terrain)

    

def paint_terrain(canvas: tk.Canvas, coord: Coordinate, terrain: str):
    global WORLD_SIZE
    if not((0 <= coord[0] < WORLD_SIZE[0]) and (0 <= coord[1] < WORLD_SIZE[1])):
        return 
    TERRAIN[coord] = terrain
    paint(canvas, coord, terrain_to_color(terrain))    



def paint_forest(canvas: tk.Canvas, coord: Coordinate, strength: int):
    global WORLD_SIZE
    if not((0 <= coord[0] < WORLD_SIZE[0]) and (0 <= coord[1] < WORLD_SIZE[1])):
        return
    if TERRAIN[coord] == 'sea':
        return
        

    try:
        LAYER_FOREST[coord] = min(LAYER_FOREST[coord] + strength, 9)
    except:
        LAYER_FOREST[coord] = strength
    
    paint(canvas, coord, '#' + str(min(LAYER_FOREST[coord], 9)) + '00000')




def paint(canvas: tk.Canvas, coord: Coordinate, color: str):
    global WORLD_SIZE
    if not((0 <= coord[0] < WORLD_SIZE[0]) and (0 <= coord[1] < WORLD_SIZE[1])):
        return 
    global GAME_MAP
    rect = GAME_MAP[coord]
    canvas.itemconfig(rect, fill = color)


def canvas_callvack(canvas: tk.Canvas, terrain_var: tk.StringVar, mode_var: tk.StringVar, map_layer_variable: tk.StringVar ):
    
    def callback(event: tk.Event):
        global DRAG
        if DRAG:
            global WORLD_SIZE
            MODE = mode_var.get()
            x, y = coord_to_x_y(event.x, event.y, WORLD_SIZE)
            # print(x, y, MODE)
            if map_layer_variable.get() == 'terrain':
                if MODE == 'CANVAS_MODE.PAINT':
                    # print('paint', (x, y))
                    paint_terrain(canvas, (x, y), terrain_var.get())
                elif MODE == 'CANVAS_MODE.FILL':
                    # print('fill', (x, y))
                    fill_terrain(canvas, (x, y), terrain_var.get())
            elif map_layer_variable.get() == 'forest':
                noise = [(random.gauss(0, 30), random.gauss(0, 30)) for i in range(10)]
                
                paint_forest(canvas, (x, y), 2)

                for item in noise:
                    map_coord = coord_to_x_y(event.x + item[0], event.y + item[1], WORLD_SIZE)
                    paint_forest(canvas, map_coord, 1)
                # render_forest(canvas)
            
        return
    
    return callback

def print_current_brush(variable: tk.StringVar):
    def res():
        print(variable.get())

    return res


def new_brush_option(brush_list: tk.Frame, option: str, variable: tk.StringVar):
    tk.Radiobutton(brush_list, text=option, variable=variable, value=option, command=print_current_brush(variable)).pack(anchor='w')


def redraw_grid(canvas: tk.Canvas, size: Coordinate):
    for x in range(size[0]):
        for y in range(size[1]):
            left, top, right, bottom = x_y_to_rect(x, y, size)
            rect = canvas.create_rectangle(left, top, right, bottom, fill='purple')
            GAME_MAP[(x,y)] = rect

def render_terrain(canvas: tk.Canvas):
    global WORLD_SIZE
    for x in range(WORLD_SIZE[0]):
        for y in range(WORLD_SIZE[1]):
            paint_terrain(canvas, (x, y), TERRAIN[(x, y)])

def render_forest(canvas: tk.Canvas):
    global WORLD_SIZE
    for x in range(WORLD_SIZE[0]):
        for y in range(WORLD_SIZE[1]):
            if TERRAIN[(x, y)] == 'sea':
                paint_terrain(canvas, (x, y), TERRAIN[(x, y)])
            else:
                try: 
                    value = LAYER_FOREST[(x, y)]
                except:
                    value = 0
                paint(canvas, (x, y), '#' + str(min(value, 9)) + '00000')


def render_map(canvas: tk.Canvas, layer_var: tk.StringVar):
    if layer_var.get() == 'terrain':
        render_terrain(canvas)
        return
    if layer_var.get() == 'forest':
        render_forest(canvas)
        return


def export_world():
    global WORLD_SIZE
    with open('./default_world/map_terrain.txt', 'w') as file:
        for x in range(WORLD_SIZE[0]):
            for y in range(WORLD_SIZE[1]):
                try:
                    terrain = TERRAIN[(x, y)]
                except:
                    terrain = 'void'
                print(terrain, end=' ', file= file)
            print(file = file)

    with open('./default_world/map_forest.txt', 'w') as file:
        for x in range(WORLD_SIZE[0]):
            for y in range(WORLD_SIZE[1]):
                try:
                    forest = LAYER_FOREST[(x, y)]
                except:
                    forest = 0
                print(forest, end=' ', file= file)
            print(file = file)

def import_world(canvas: tk.Canvas):
    global WORLD_SIZE
    try:
        with open('./default_world/map_terrain.txt') as file:
            for x in range(WORLD_SIZE[0]):
                line = file.readline().strip().split()
                for y in range(WORLD_SIZE[1]):
                    paint_terrain(canvas, (x, y), line[y])
    except:
        print('no world terrain found for import')

    try:
        with open('./default_world/map_forest.txt') as file:
            for x in range(WORLD_SIZE[0]):
                line = file.readline().strip().split()
                for y in range(WORLD_SIZE[1]):
                    LAYER_FOREST[(x, y)] = int(line[y])
    except:
        print('no forest file')
        


def loader(world_size: tk.StringVar,
           canvas: tk.Canvas, 
           brush_list: tk.Frame, 
           brush_variable: tk.StringVar):
    
    def load_world():
        with open('./default_world/description.txt') as file:
            inputs = file.read()
            world_size.set(inputs)

            global WORLD_SIZE
            WORLD_SIZE = tuple(map(int, inputs.split()))
            redraw_grid(canvas, WORLD_SIZE)
            import_world(canvas)
                



        with open('./default_world/terrain.txt') as file:
            for line in file.readlines():
                new_brush_option(brush_list, line.strip(), brush_variable)
                

    return load_world

world_size = tk.StringVar(root, "????")
current_brush = tk.StringVar(root, "void")
mode_variable = tk.Variable(root, CANVAS_MODE.PAINT)
map_layer_variable = tk.Variable(root, "terrain")

canvas = tk.Canvas(root, bg="white", height=1000, width=1000)

canvas.bind("<ButtonRelease-1>", drag_stop)
canvas.bind("<Button-1>", drag_start)
canvas.bind("<B1-Motion>", canvas_callvack(canvas, current_brush, mode_variable, map_layer_variable))


data_frame = tk.Frame(root)

world_size_label = tk.Label(data_frame, textvariable=world_size)
brushes_frame = tk.Frame(data_frame)

button = tk.Button(data_frame, text="Export World", 
                   command=export_world)

def show_terrain(canvas: tk.Canvas):
    def show():
        map_layer_variable.set('terrain')
        render_map(canvas, map_layer_variable)

    return show

def show_forest(canvas: tk.Canvas): 
    def show():
        map_layer_variable.set('forest')
        render_map(canvas, map_layer_variable)

    return show

button_terrain = tk.Button(data_frame, text="Terrain", command=show_terrain(canvas))
button_forest = tk.Button(data_frame, text="Forest", command=show_forest(canvas))

tk.Label(brushes_frame, text="Select brush: ").pack()

loader(world_size, canvas, brushes_frame, current_brush)()


button.pack(padx=5,pady=5,)
button_terrain.pack(padx=5,pady=5,)
button_forest.pack(padx=5,pady=5,)
world_size_label.pack(padx=5,pady=5,)

brushes_frame.pack()

mode_frame = tk.Frame(data_frame)

tk.Radiobutton(mode_frame, text="Fill",  variable=mode_variable, value=CANVAS_MODE.FILL, command=print_current_brush(mode_variable)).pack()
tk.Radiobutton(mode_frame, text="Paint", variable=mode_variable, value=CANVAS_MODE.PAINT, command=print_current_brush(mode_variable)).pack()


mode_frame.pack()
canvas.pack(padx=5, pady=5, side="right")
data_frame.pack(padx=5, pady=5, side='left', expand=True)










root.mainloop()