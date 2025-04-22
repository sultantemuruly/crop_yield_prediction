# type: ignore

from pathlib import Path
import joblib

import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import EarlyStopping

from typing import List
from types import PredictionInput, TrainingInput

from datetime import datetime


base_dir = Path(__file__).resolve().parent

model_dir = base_dir.parent / "model"


def load_joblib_model(filename: str):
    filepath = model_dir / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Model file not found: {filepath}")
    return joblib.load(filepath)


# Load label encoders
le_item = load_joblib_model("label_encoder_item.pkl")
le_area = load_joblib_model("label_encoder_area.pkl")

# Load scaler
scaler_features = load_joblib_model("scaler_features.pkl")
scaler_target = load_joblib_model("scaler_target.pkl")

# Load the model
model = load_model(model_dir / "lstm_yield_model.h5")


def predict(input_data: PredictionInput):
    preprocessed_data = preprocess_input(
        input_data.area,
        input_data.item,
        input_data.rainfall,
        input_data.pesticides,
        input_data.temp,
        input_data.year,
        le_area,
        le_item,
        scaler_features,
    )
    prediction = model.predict(preprocessed_data)
    actual_pred = scaler_target.inverse_transform(prediction)
    return actual_pred


def preprocess_input(
    area, item, rainfall, pesticides, temp, year, le_area, le_item, scaler, seq_length=5
):
    # Encode the area and item (using the pre-trained label encoders)
    area_encoded = le_area.transform([area])[0]
    item_encoded = le_item.transform([item])[0]

    # Prepare the new row (latest input) including the `Year` as a feature
    final_row = [area_encoded, item_encoded, rainfall, pesticides, temp, year]

    # Convert the final_row into a 2D array for scaling
    final_row_array = np.array([final_row])  # Shape: (1, 6) - 6 features now

    # Scale the final row (all 6 features)
    full_sequence_scaled = scaler.transform(final_row_array)

    # Reshape for LSTM input (1, 1, num_features)
    return full_sequence_scaled.reshape(1, 1, final_row_array.shape[1])


def train_model(data: List[TrainingInput], batch_size):
    df = pd.DataFrame([d.dict() for d in data])

    # encode
    df["area"] = le_area.transform(df["area"])
    df["item"] = le_item.transform(df["item"])

    X = df[["area", "item", "rainfall", "pesticides", "temp", "year"]]
    y = df["yield_value"].values.reshape(-1, 1)

    # normalize
    X_scaled = scaler_features.transform(X)
    y_scaled = scaler_target.transform(y)

    X_lstm = X_scaled.reshape((X_scaled.shape[0], 1, X_scaled.shape[1]))

    model.compile(optimizer="adam", loss="mean_squared_error")

    early_stop = EarlyStopping(patience=5, restore_best_weights=True)

    model.fit(
        X_lstm,
        y_scaled,
        epochs=50,
        batch_size=batch_size,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=1,
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model.save(model_dir / f"lstm_yield_model_{timestamp}.h5")
