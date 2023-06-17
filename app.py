"""
Very simple server to update the game when github webhook activates
TODO
"""

import os
import multiprocessing
import subprocess
from flask import Flask
from flask import request
from markupsafe import escape

app = Flask(__name__)

@app.route("/")
def hello_world():
    """
    Test function to check if the server is running
    """
    return "<p>Hello, World!</p>"

@app.post('/webhook')
def webhook():
    """
    Listens to github webhook, restarts game if needed and applies update
    TODO
    """
    print(str(request.json))
    return "<p>Hello, World!</p>"
