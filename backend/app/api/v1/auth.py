from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.ngo import NGO
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserResponse, RefreshTokenRequest
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    hashed_pw = get_password_hash(data.password)
    new_user = User(
        email=data.email,
        hashed_password=hashed_pw,
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If Provider, create provider profile
    provider_id = None
    if data.role == UserRole.PROVIDER:
        provider = Provider(
            user_id=new_user.id,
            business_name=data.business_name or f"{data.full_name}'s Kitchen",
            business_type=data.business_type or "Restaurant",
            fssai_license=data.fssai_license,
            address=data.address or "Bangalore, India",
            city=data.city or "Bangalore",
            latitude=data.latitude or 12.9716,
            longitude=data.longitude or 77.5946
        )
        db.add(provider)
        db.commit()
        db.refresh(provider)
        provider_id = provider.id

    # If NGO, create NGO profile
    ngo_id = None
    if data.role == UserRole.NGO:
        ngo = NGO(
            user_id=new_user.id,
            org_name=data.org_name or f"{data.full_name} Foundation",
            registration_number=data.registration_number or "NGO-REG-2025-01",
            contact_person=data.contact_person or data.full_name,
            daily_meal_capacity=data.daily_meal_capacity or 100,
            address=data.address or "Bangalore, India",
            latitude=data.latitude or 12.9716,
            longitude=data.longitude or 77.5946
        )
        db.add(ngo)
        db.commit()
        db.refresh(ngo)
        ngo_id = ngo.id

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        provider_id=provider_id,
        ngo_id=ngo_id
    )

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")

    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.value)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name
    )

@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is invalid or inactive.")

    new_access_token = create_access_token(subject=user.id, role=user.role.value)
    new_refresh_token = create_refresh_token(subject=user.id, role=user.role.value)

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider_id = user.provider_profile.id if user.provider_profile else None
    ngo_id = user.ngo_profile.id if user.ngo_profile else None
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        provider_id=provider_id,
        ngo_id=ngo_id
    )
