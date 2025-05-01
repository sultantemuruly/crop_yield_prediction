# type: ignore

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from model_handler import predict, train_model

from schemas import PredictionInput, TrainingInput
from typing import List

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hello!"}


@app.post("/predict")
def get_prediction(input_data: PredictionInput):
    try:
        prediction = predict(input_data)
        predicted_value = float(prediction[0][0])
        return {"predicted_yield": predicted_value}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )


@app.post("/train")
def train(training_data: List[TrainingInput]):
    try:
        if not training_data:
            return JSONResponse(
                status_code=400,
                content={"error": "Training data must include at least one record."},
            )

        # Smart batch size: min of data length or 16
        batch_size = min(len(training_data), 16)
        train_model(training_data, batch_size=batch_size)

        return {
            "message": f"Model trained successfully on {len(training_data)} records.",
            "batch_size_used": batch_size,
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )
