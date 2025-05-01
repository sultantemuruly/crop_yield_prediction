# type: ignore

from pydantic import BaseModel
from typing import Optional


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


class InfoBase(BaseModel):
    area: str
    item: str
    rainfall: int
    pesticides: int
    temp: int
    year: int
    yield_value: Optional[int] = None


class InfoCreate(InfoBase):
    pass


class InfoResponse(InfoBase):
    id: int

    class Config:
        orm_mode = True  # Tells Pydantic to read data from SQLAlchemy model
