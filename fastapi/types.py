# type: ignore

from pydantic import BaseModel


class PredictionInput(BaseModel):
    area: str
    item: str
    rainfall: float
    pesticides: float
    temp: float
    year: int


class TrainingInput(BaseModel):
    area: str
    item: str
    rainfall: float
    pesticides: float
    temp: float
    year: int
    yield_value: float
