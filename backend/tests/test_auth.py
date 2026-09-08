import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.models.user import UserRole

def test_password_hashing():
    raw = "SecureSecretPassword123"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    user_id = 42
    role = UserRole.PROVIDER.value
    token = create_access_token(subject=user_id, role=role)
    
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["role"] == role
    assert payload["type"] == "access"
