# app/schemas/community.py
from pydantic import BaseModel
from typing import Optional


class UserLogin(BaseModel):
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    total_praises: int
    class Config:
        from_attributes = True

    
class PrayerCreate(BaseModel):
    title: str
    description: str
    creator_name: Optional[str] = "فاعل خير"
    category: str 
    target_count: Optional[int] = 40

class PrayerResponse(BaseModel):
    id: int
    title: str
    description: str
    creator_name: str
    category: Optional[str] = "فاعل خير"
    current_count: int
    target_count: int
    is_completed: bool

    class Config:
        from_attributes = True