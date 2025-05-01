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


def train_model_logic(training_data: List[TrainingInput], db: Session):
    """
    Core training logic that can be used both for the scheduled job and the /train API.
    Handles empty training data gracefully.
    """
    try:
        if not training_data:
            print("No data found for training.")
            return None  # No data to train, return None or a message

        # Smart batch size: min of data length or 16
        batch_size = min(len(training_data), 16)

        # Call the actual model training function
        train_model(training_data, batch_size=batch_size)

        # Mark items as trained in the database
        for item in training_data:
            db_item = (
                db.query(Info)
                .filter(Info.area == item.area, Info.item == item.item)
                .first()
            )
            if db_item:
                db_item.isTrained = True
        db.commit()

        print(f"Training completed for {len(training_data)} items.")
        return batch_size

    except Exception as e:
        print(f"Error during training: {e}")
        return None


def scheduled_job():
    print(f"[{time.strftime('%X')}] Running scheduled job!")
    db = next(get_db())

    # Fetch untrained items
    untrained_items = db.query(Info).filter(Info.is_trained == False).all()

    if not untrained_items:
        print(f"[{time.strftime('%X')}] No untrained items found.")
        return  # Exit early if no untrained items are found

    training_data = [
        TrainingInput(
            area=item.area,
            item=item.item,
            rainfall=item.rainfall,
            pesticides=item.pesticides,
            temp=item.temperature,
            year=item.year,
            yield_value=item.yield_value,
        )
        for item in untrained_items
    ]

    # Call the core training logic
    batch_size = train_model_logic(training_data, db)

    if batch_size:
        print(
            f"[{time.strftime('%X')}] Training completed for {len(untrained_items)} items."
        )
    else:
        print(f"[{time.strftime('%X')}] No data found for training.")


# Run every 60 seconds
scheduler.add_job(scheduled_job, "interval", seconds=60)
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
def train(training_data: List[TrainingInput], db: Session = Depends(get_db)):
    if not training_data:
        return JSONResponse(
            status_code=400,
            content={"error": "Training data must include at least one record."},
        )

    batch_size = train_model_logic(training_data, db)

    if batch_size is not None:
        return {
            "message": f"Model trained successfully on {len(training_data)} records.",
            "batch_size_used": batch_size,
        }

    return JSONResponse(
        status_code=500,
        content={"error": "An error occurred during training."},
    )


@app.post("/info/", response_model=InfoResponse)  # for testing
def create_info(info: InfoCreate, db: Session = Depends(get_db)):
    db_info = Info(**info.dict())
    db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info


@app.get("/items/untrained", response_model=List[InfoResponse])
def get_untrained_items(db: Session = Depends(get_db)):
    items = db.query(Info).filter(Info.isTrained == False).all()

    if not items:
        return ["No items found for training"]

    return items
