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


# 
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import unidecode

stop_words = set(stopwords.words('english'))

for line in open("models/stopwords.txt"):
    stop_words.add(line.strip())

def preprocess_text(text, stem=True, stop_words=[]):
    stemmer = PorterStemmer()
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = unidecode.unidecode(text)
    text = text.replace("\\n", "\n").replace("\\\"", '"').replace("\\'", "'")
#    for p in remove_phrases:
#        text = text.replace(p, "")
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = text.replace("-", " ")
    text = text.replace("\"", "")
    text = text.replace("\\", "")
    text = text.replace("'", "")
    text = text.replace(",", "")
    text = text.replace(".", "")
    text = text.replace(":", "")
    text = text.replace(";", "")
    text = text.replace("(", "")
    text = text.replace(")", "")
    text = text.replace("!", "")
    words = []
    for t in text.split(" "):
        t = t.strip()
        t = t.lower()
        if stem:
            t = stemmer.stem(t)
        if t not in stop_words and t != "":
            words.append(t)
    return " ".join(words)

def vectorize_phrase(text):
	vectorizer = get_vectorizer()
	phrase = vectorizer.transform([text])
	return phrase



# It was in the late 1990s that rumours began circulating about Margaret Thatcher\'s health problems and that it was her devoted husband, Denis, who kept an eye out for her. But it was not until the publication of her daughter Carol\'s memoir in 2008 that it was revealed the former prime minister had begun struggling with her memory as far back as 2000.\n\n\"I almost fell off my chair. Watching her struggle with her words and her memory, I couldn\'t believe it,\" Carol wrote in A Swim-On Part in the Goldfish Bowl: A Memoir. \"She was in her 75th year but I had always thought of her as ageless, timeless and 100% cast-iron damage-proof.\"\n\nThe contrast was all the more striking, she said, because her mother had always had a memory \"like a website\". Gradually, the signs of dementia began to appear. \"Whereas previously you would never have had to say anything to her twice, because she\'d already filed it away in her formidable memory bank, Mum started asking the same questions over and over again, unaware she was doing so,\" she wrote.\n\nThatcher\'s encroaching ill-health did not immediately slow her down. In 2002 she released the second part of her own memoir, Statecraft: Strategies for a Changing World, dedicated to Ronald Reagan. But soon afterwards she suffered a series of small strokes and was advised by her doctors not to perform any more public speaking. On 23 March that year Thatcher announced that she had cancelled all planned speaking engagements and would accept no more.\n\nThatcher\'s inexorable decline worsened after Denis\'s death from pancreatic cancer in 2003. Carol wrote that his death was \"truly awful\" for her mother, \"not least because her dementia meant she kept forgetting he was dead\".\n\n\"I had to keep giving her the bad news over and over again. Every time it finally sank in that she had lost her husband of more than 50 years, she\'d look at me sadly and say \'oh\', as I struggled to compose myself. \'Were we all there?\' she\'d ask softly.\"\n\nIt was her short-term memory that was most affected, and on bad days Thatcher could \"hardly remember the beginning of a sentence by the time she got to the end\". On good days, however, there were flashes of her old self, with a sharpened power of long-term recall of her years in office.\n\nAfter retiring from the public stage in 2002, Thatcher briefly returned to the limelight in September 2007 when she visited Downing Street as a guest of the then prime minister, Gordon Brown, who described her as a \"conviction politician\".\n\nIn 2012 Jonathan Aitken gave an account of how Thatcher \"did not get\" who David Cameron was when the prime minister\'s name was mentioned by another guest at a dinner party he was hosting. \"I had one member of the cabinet [at the table] who asked something about David Cameron,\" he said. \"She obviously didn\'t get who David Cameron was.\"\n\nBut there were, Aitken said, moments of clarity. \"When she came in [to the conversation] there were one or two marvellous moments. She suddenly started to talk about [politician] Keith Joseph, then later about preparations for her wedding.\"\n\nOn 20 March last year, the Mirror published a photograph of Thatcher sitting on a bench in a London park. Looked after by the trained private nurse who has been her cook, dresser and companion at her four-storey London home for the last decade, Thatcher seemed content to passively watch the activity around her. Also with her was another nurse, who was employed six months ago as Thatcher\'s daily needs increased.\n\nThatcher spent her last years living quietly at home, sitting in an armchair in the drawing room, listening to classical music, watching her favourite TV programme, Songs of Praise, and skimming the newspapers. Occasionally, the Mirror reported, she went for lunch at a nearby hotel.\n\nA select group of friends continued to visit the former prime minister, including her former dresser and confidante Cynthia Crawford and her former press secretary Sir Bernard Ingham.\n\nThe woman who grew up above a grocer\'s shop in Grantham ended her days ensconced in the wealth and luxury of London\'s Ritz hotel, where in 2002 she and Denis had dinner to celebrate their 50th wedding anniversary.\n\nIn January it was reported that the former prime minister had decided to convalesce from the effects of bladder surgery in a suite at the five-star Piccadilly landmark rather than endure the stairs of her Belgravia townhouse.\n\nCosting thousands of pounds a week for a suite as well as accommodation for her carers, Thatcher was part of a long tradition of rich and famous guests opting for permanent residence in hotels amid failing health. In the 1970s, the billionaire recluse Howard Hughes spent years in a Las Vegas presidential suite. The great pianist Vladimir Horowitz moved into the upmarket Hotel ElysÃ©e in New York, bringing his own grand piano, for a stay that lasted many years.\n\nAnd so there at the Ritz Thatcher stayed, it seems, until the stroke that ended her life on Monday morning. A glamorous address for a politician who once holidayed in a bungalow near Padstow.\n\nâ€¢ This article was amended on 9 April 2013. The original version wrongly stated that the Mirror had published a picture of Thatcher in a London park last month; in fact it was in March last year.
# end model


app = Flask(__name__)


# Routes
@app.route('/')
def index():
  return redirect("/static/index.html")

@app.route('/run_model.json', methods=["POST"])
def run_model():
	text = request.form["text"]
	phrase = preprocess_text(text, stem=False, stop_words=stop_words)
	phrase = vectorize_phrase(text)
	model = get_model()
	output = model.predict(phrase)
	category_int = int(output[0])

	# These are defined by the label encoder
	# Which came up with different numbers!
	category_map = { 
		0: "Major Correction",
		1: "Minor Correction",
		2: "No Correction",
		3: "Breaking News Update"
	}
	category = category_map[category_int]

	return jsonify({
		"category": category,
		"accuracy": ""
	})


if __name__ == '__main__':
	print("loading model...")
	get_model()
	print("loaded model...")
	app.run(port=33507)

