from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.redis_cache import cache_service
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.ngo import NGO

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    
    return user

def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[r.value for r in allowed_roles]}, user role: {current_user.role.value}"
            )
        return current_user
    return role_checker

def get_current_provider(
    current_user: User = Depends(require_roles([UserRole.PROVIDER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
) -> Provider:
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found for this user.")
    return provider

def get_current_ngo(
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN])),
    db: Session = Depends(get_db)
) -> NGO:
    ngo = db.query(NGO).filter(NGO.user_id == current_user.id).first()
    if not ngo and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO profile not found for this user.")
    return ngo

def rate_limiter(limit: int = 60, window_seconds: int = 60):
    def check_limit(request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"{client_ip}:{request.url.path}"
        if not cache_service.check_rate_limit(key, limit=limit, window_seconds=window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down."
            )
    return check_limit
