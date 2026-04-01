from flask import Flask, render_template, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import cv2

app = Flask(__name__)

# Load model
model = load_model("brain_model", compile=False)

classes = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]

# Preprocessing function
def preprocess(img):
    img = img.resize((128,128))
    
    # ✅ Force RGB (3 channels)
    img = img.convert("RGB")
    
    img = np.array(img)
    img = img / 255.0
    
    # ✅ Shape becomes (1, 128, 128, 3)
    img = img.reshape(1,128,128,3)

    return img

# Home route (just UI)
@app.route("/")
def index():
    return render_template("index.html")

# Prediction route (IMPORTANT)
@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]
    img = Image.open(file)

    processed = preprocess(img)

    prediction = model.predict(processed)
    result = classes[np.argmax(prediction)]
    confidence = float(np.max(prediction)) * 100

    return jsonify({
        "result": result,
        "confidence": round(confidence, 2)
    })

import os

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))