from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="BookFair GenrAI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = 'model.pkl'
GENRES_PATH = 'genres.pkl'

model = None
all_genres = []

def load_artifacts():
    global model, all_genres
    if os.path.exists(MODEL_PATH) and os.path.exists(GENRES_PATH):
        model = joblib.load(MODEL_PATH)
        all_genres = joblib.load(GENRES_PATH)
        print("Model and genres loaded successfully.")
    else:
        print("WARNING: Model artifacts not found. Please run train_model.py first.")

load_artifacts()

class StallInput(BaseModel):
    x: float
    y: float
    stall_size: str 

class PredictionRequest(BaseModel):
    stalls: List[StallInput]

class PredictionResponse(BaseModel):
    top_genres: List[str]

SIZE_MAP = {'SMALL': 1, 'MEDIUM': 2, 'LARGE': 3}

def prepare_features(stall: StallInput):
    size_encoded = SIZE_MAP.get(stall.stall_size.upper(), 1)
    dist = np.sqrt(stall.x**2 + stall.y**2)
    return [stall.x, stall.y, size_encoded, dist]


@app.get("/")
def read_root():
    return {"message": "Welcome to BookFair GenrAI Service", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict-genres", response_model=PredictionResponse)
def predict_genres(request: PredictionRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.stalls:
        return {"top_genres": []}

    try:
        # Prepare batch input
        features_list = [prepare_features(s) for s in request.stalls]
        X_input = pd.DataFrame(features_list, columns=['x', 'y', 'size_encoded', 'dist_entrance'])
        
        # Get probabilities for each stall: (n_samples, n_classes)
        probs = model.predict_proba(X_input)
        
        # Average probabilities across all selected stalls
        avg_probs = np.mean(probs, axis=0)
        
        # Map back to genre names and rank
        # model.classes_ contains the genre names in order corresponding to columns
        class_labels = model.classes_
        
        # Create (Genre, Score) pairs
        genre_scores = list(zip(class_labels, avg_probs))
        
        # Sort by score descending
        genre_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get top 3
        top_3 = [g[0] for g in genre_scores[:3]]
        
        return {"top_genres": top_3}

    except Exception as e:
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
