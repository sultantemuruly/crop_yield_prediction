# type: ignore

from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse

from model_handler import predict, train_model

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from db_models import Info, Base
from schemas import PredictionInput, TrainingInput, InfoResponse, InfoCreate
from typing import List

from apscheduler.schedulers.background import BackgroundScheduler
import time

app = FastAPI()
Base.metadata.create_all(bind=engine)
scheduler = BackgroundScheduler()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def scheduled_job():
    print(f"[{time.strftime('%X')}] Running scheduled job!")


# Run every 10 seconds
scheduler.add_job(scheduled_job, "interval", seconds=10)
scheduler.start()


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


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


@app.post("/info/", response_model=InfoResponse)
def create_info(info: InfoCreate, db: Session = Depends(get_db)):
    db_info = Info(**info.dict())
    db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info
