import google.generativeai as ai
from PIL import Image
from gtts import gTTS
from langdetect import detect
from deep_translator import GoogleTranslator
from dotenv import load_dotenv
import os
from flask import Flask, jsonify
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
def generate_story(imag):
    prompt = """
            1. First, describe what you see in this image in one sentence.
            2. Then, create an engaging children's story (200-300 words) based on what you see.
            Make the story suitable for ages 5-12, using simple language and a clear narrative.
            
            Format your response as:
            Caption: [your one-sentence description]
            Story: [your story]
            Moral: [your moral from the story]
            """
    response = model.generate_content([prompt, imag])
    res = response.text

    try:
        caption = res.split('Caption:')[1].split('\n')[0].strip()
        story = res.split('Story:')[1].split('\n')[0].strip()
        moral = res.split('Moral:')[1].strip()
        return jsonify({
            "caption": caption,
            "story": story,
            "moral": moral
        })

    except:
        return jsonify({"res" : res.strip()})

@app.route('/get_audio', methods=['POST'])
def text_to_speech(text, moral, filename = "output.mp3"):
    if text is None:
        return None
    language = detect(text)
    tts = gTTS(text + "Moral of the story:" + moral, lang=language)
    tts.save(filename)
    return tts

@app.route('/translate', methods=['POST'])
def translate_text(text, target_language='en'):
    if text is None:
        return None
    try:
        translated_text = GoogleTranslator(source='auto', target=target_language).translate(text)
        return translated_text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    app.run(debug=True)