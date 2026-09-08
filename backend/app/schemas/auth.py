from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    full_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    role: UserRole = UserRole.CONSUMER
    
    # Optional Provider specific fields
    business_name: Optional[str] = None
    business_type: Optional[str] = "Restaurant"
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = 12.9716 # default sample lat
    longitude: Optional[float] = 77.5946 # default sample lng
    fssai_license: Optional[str] = None
    
    # Optional NGO specific fields
    org_name: Optional[str] = None
    registration_number: Optional[str] = None
    contact_person: Optional[str] = None
    daily_meal_capacity: Optional[int] = 100

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    provider_id: Optional[int] = None
    ngo_id: Optional[int] = None

    class Config:
        from_attributes = True
