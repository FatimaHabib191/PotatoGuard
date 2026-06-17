from fastapi import FastAPI,File,UploadFile
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

MODEL=tf.keras.models.load_model("../saved_models/1.keras")
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)
ClassNames = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']
def read_file_as_image(data) -> np.ndarray:
    image=np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    image_batch=np.expand_dims(image,0)
    prediction = MODEL.predict(image_batch)
    predicted_class=ClassNames[np.argmax(prediction[0])]
    confidence=np.max(prediction[0])
    return {
        'class': predicted_class,
        'confidence':float(confidence) 
    }

 