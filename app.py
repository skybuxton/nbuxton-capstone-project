from flask import Flask, render_template, request, redirect
# from bokeh.embed import components
from flask import jsonify

app = Flask(__name__)

# Routes
@app.route('/')
def index():
  return redirect("/static/index.html")

@app.route('/run_model.json', methods=["POST"])
def run_model():
	return jsonify({
		"category": "Minor Correction",
		"accuracy": "99.2%"
	})


if __name__ == '__main__':
  app.run(port=33507)

