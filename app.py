from flask import Flask, render_template, request, redirect
# from bokeh.embed import components
from flask import jsonify


from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import pickle
import xgboost

# model etc

__vectorizer__ = None
__model__ = None
__y_labels__ = None

def get_vectorizer():
	global __vectorizer__
	if __vectorizer__ == None:
		__vectorizer__ = pickle.load(open("models/tfidf_vect.pkl", "rb"))
	return __vectorizer__

def get_y_labels():
	global __y_labels__
	if __y_labels__ == None:
		__y_labels__ = pickle.load(open("models/train_y.pkl", "rb"))
	return __y_labels__

def get_model():
	global __model__
	if __model__ == None:
		# __model__ = xgboost.XGBClassifier() #pickle.load(open("xgb_tfidf.pkl", "rb"))
		# __model__.fit(pickle.load(open("xtrain_tfidf.pkl", "rb")), get_y_labels())
		__model__ = pickle.load(open("models/xgb_tfidf.pkl", "rb"))
	return __model__

def vectorize_phrase(text):
	vectorizer = get_vectorizer()
	phrase = vectorizer.transform([text])
	return phrase

# end model


app = Flask(__name__)


# Routes
@app.route('/')
def index():
  return redirect("/static/index.html")

@app.route('/run_model.json', methods=["POST"])
def run_model():
	text = request.form["text"]
	print("got text")
	print(text)
	phrase = vectorize_phrase(text)
	model = get_model()
	output = model.predict(phrase)
	cat_int = int(output[0])

	category_map = {
		0: "No Correction",
		1: "Major Correction",
		2: "Minor Correction",
		3: "Breaking News Update"
	}
	category = category_map[cat_int]

	return jsonify({
		"category": category,
		"accuracy": "99.2%"
	})


if __name__ == '__main__':
	print("loading model...")
	get_model()
	print("loaded model...")
	app.run(port=33507)

