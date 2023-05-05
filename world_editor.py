import tkinter as tk 


root = tk.Tk()

world_size = tk.StringVar()
world_size.set("????")

def loader(world_size: tk.StringVar):
    def load_world():
        with open('./default_world/description.txt') as file:
            world_size.set(file.read())
            # print(file.read())

    return load_world

button = tk.Button(root, text="Load Local World", command=loader(world_size))
button.pack(padx=20,pady=20)

world_size = tk.Label(root, textvariable=world_size)
world_size.pack(padx=20,pady=20)

label = tk.Label(root, text="Hello World!") # Create a text label
label.pack(padx=20, pady=20) # Pack it into the window

root.mainloop()