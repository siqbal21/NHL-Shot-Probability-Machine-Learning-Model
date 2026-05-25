from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

lr_model = joblib.load(os.path.join(BASE_DIR, '../models/lr_model.pkl'))
rf_model = joblib.load(os.path.join(BASE_DIR, '../models/rf_model.pkl'))
xgb_model = joblib.load(os.path.join(BASE_DIR, '../models/xgb_model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, '../models/scaler.pkl'))

class ShotFeatures(BaseModel):
    shotDistance: float
    shotAngleAdjusted: float
    shotRebound: int
    offWing: int
    shootingTeamSkaters: int
    defendingTeamSkaters: int
    period: int
    distanceFromLastEvent: float
    scoreDifferential: int
    shotType: str
    model: str


@app.post('/predict')
def predict(shot: ShotFeatures):
    if shot.model == "lr":
        selected_model = lr_model
    elif shot.model == "rf":
        selected_model = rf_model
    elif shot.model == "xgb":
        selected_model = xgb_model
    else:
        return {"error": "Invalid model selection"}

    shot_types = ['BACK', 'DEFL', 'SLAP', 'SNAP', 'TIP', 'WRAP', 'WRIST']
    shot_type_encoded = {f'shotType_{t}': int(shot.shotType == t) for t in shot_types}
    numeric = [
        shot.shotDistance, shot.shotAngleAdjusted,
        shot.shootingTeamSkaters, shot.defendingTeamSkaters, shot.period,
        shot.distanceFromLastEvent, shot.scoreDifferential
    ]
    binary = [
        shot.shotRebound, shot.offWing,
    ]
    numeric_scaled = scaler.transform([numeric])[0]
    features = np.array(list(numeric_scaled) + list(shot_type_encoded.values())).reshape(1, -1)

    xg = selected_model.predict_proba(features)[0][1]
    return {"xG": float(xg)}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)