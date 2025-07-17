import google.generativeai as ai
from PIL import Image
from gtts import gTTS
from langdetect import detect
from deep_translator import GoogleTranslator
from dotenv import load_dotenv
import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from waitress import serve
import io

app = Flask(__name__)
CORS(app)

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
ai.configure(api_key=api_key)
model = ai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return "<h1>PixTale</h1> <p>Welcome to the AI Image and Text Processing API!</p>"

# @app.route('/translate', methods=['POST'])
def translate_text(text, target_language='en'):
    if text is None:
        return None
    try:
        translated_text = GoogleTranslator(source='auto', target=target_language).translate(text)
        return translated_text
    except Exception as e:
        return str(e)

@app.route('/generate_story', methods=['POST'])
def generate_story():
    file = request.files['image']
    lang = request.form.get('language', 'en')
    
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
        
        if lang != 'en':
            try:
                story = translate_text(story, target_language=lang)
                moral = translate_text(moral, target_language=lang)
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        return jsonify({
            "caption": caption,
            "story": story,
            "moral": moral
        }), 200

    except Exception as e:
        return jsonify({"res": res, "error": str(e)})


# @app.route('/get_audio', methods=['POST'])
def text_to_speech(text, moral, filename='output.mp3'):
    if text is None or moral is None:
        return None
    try:
        full_text = text + "\nMoral of the story: " + moral
        language = detect(full_text)
        tts = gTTS(full_text, lang=language)
        audio_io = io.BytesIO()
        tts.write_to_fp(audio_io)
        audio_io.seek(0)
        print('Audio generated successfully')
        return audio_io  # Return the audio file as a BytesIO object
    except Exception as e:
        return None

@app.route('/get_audio', methods=['POST'])
def get_audio():
    try:
        text = request.form.get('story')
        moral = request.form.get('moral')

        audio_io = text_to_speech(text, moral)
        if audio_io is None:
            return jsonify({"error": "TTS generation failed"}), 500
        print('Ok')
        return send_file(
            audio_io,
            mimetype='audio/mpeg',
            as_attachment=False
        )
    except Exception as e:
        print(f"Error generating audio: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000)