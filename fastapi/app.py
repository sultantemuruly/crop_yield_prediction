from fastapi import FastAPI
from fastapi.responses import JSONResponse
from prediction import predict, PredictionInput

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
