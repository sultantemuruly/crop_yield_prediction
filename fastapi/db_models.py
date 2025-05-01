from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class Info(Base):
    __tablename__ = "info"

    id = Column(Integer, primary_key=True, index=True)  # Auto-incremented
    area = Column(String)
    item = Column(String)
    rainfall = Column(Integer)
    pesticides = Column(Integer)
    temp = Column(Integer)
    year = Column(Integer)
    yield_value = Column(Integer)
    is_trained = Column(Boolean, default=False)
