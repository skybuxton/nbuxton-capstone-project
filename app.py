from flask import Flask, render_template, request, redirect
# from bokeh.embed import components

app = Flask(__name__)

# Routes
@app.route('/')
def index():
  return redirect("/static/index.html")

if __name__ == '__main__':
  app.run(port=33507)

