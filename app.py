from flask import Flask, render_template, request, redirect
import quandl
import bokeh.plotting
import bokeh.resources
import bokeh.embed
import pandas as pd
# from bokeh.embed import components

app = Flask(__name__)

# Routes
@app.route('/')
def index():
  return "ok"

if __name__ == '__main__':
  app.run(port=33507)

