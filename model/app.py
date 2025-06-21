import google.generativeai as ai
from PIL import Image
from gtts import gTTS
from langdetect import detect
from deep_translator import GoogleTranslator
from dotenv import load_dotenv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
ai.configure(api_key=api_key)
model = ai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return "<h1>PixTale</h1> <p>Welcome to the AI Image and Text Processing API!</p>"

@app.route('/generate_story', methods=['POST'])
def generate_story():
    file = request.files['image']
    imag = Image.open(file.stream)

    if imag is None:
        return jsonify({"error": "No image provided"}), 400
    
    prompt = os.getenv("PROMPT")

    response = model.generate_content([prompt, imag])
    res = response.text.strip()

    try:
        caption = res.split("Caption:")[1].split("Story")[0].strip().replace("\n", " ")

        story = res.split("Story (1000-1100 words):")[1].split("Moral:")[0].strip().replace("\n", "")

        moral = res.split("Moral:")[1].strip()

        return jsonify({
            "caption": caption,
            "story": story,
            "moral": moral
        })

    except Exception as e:
        return jsonify({"res": res, "error": str(e)})


@app.route('/get_audio', methods=['POST'])
def text_to_speech():
    text = request.form.get('text')
    moral = request.form.get('moral')
    filename = request.form.get('filename', 'output.mp3')
    if text is None:
        return None
    language = detect(text)
    tts = gTTS(text + "Moral of the story:" + moral, lang=language)
    tts.save(filename)
    return tts

@app.route('/translate', methods=['POST'])
def translate_text():
    text = request.form.get('text')
    target_language = request.form.get('target_language', 'en')
    if text is None:
        return None
    try:
        translated_text = GoogleTranslator(source='auto', target=target_language).translate(text)
        return translated_text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    app.run(debug=True)