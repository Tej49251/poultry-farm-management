"""
Unit tests for user authentication, password hashing, and JWT tokens.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.schemas.auth import LoginRequest, UserCreate
from app.api.auth import login, register, seed_default_users


@pytest.fixture(scope="function")
def db_session():
    """Create an in-memory SQLite database session for testing."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_password_hashing():
    password = "FarmSecurePassword2026!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_decode():
    token = create_access_token(subject="farmer_ravi", role="Owner")
    assert isinstance(token, str)
    
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "farmer_ravi"
    assert payload["role"] == "Owner"


def test_seed_default_users(db_session):
    seed_default_users(db_session)
    users = db_session.query(User).all()
    assert len(users) == 2
    usernames = {u.username for u in users}
    assert "owner" in usernames
    assert "supervisor" in usernames


def test_login_success(db_session):
    seed_default_users(db_session)
    req = LoginRequest(username="owner", password="admin123")
    res = login(login_req=req, db=db_session)
    assert res.token_type == "bearer"
    assert res.access_token is not None
    assert res.user.username == "owner"
    assert res.user.role == "Owner"


def test_login_invalid_password(db_session):
    seed_default_users(db_session)
    req = LoginRequest(username="owner", password="wrongpassword")
    with pytest.raises(Exception):
        login(login_req=req, db=db_session)


def test_register_new_user(db_session):
    user_data = UserCreate(
        username="shed_worker_1",
        email="worker1@farm.com",
        password="workerpass123",
        full_name="Ramesh Kumar",
        role="Worker",
    )
    res = register(user_in=user_data, db=db_session)
    assert res.username == "shed_worker_1"
    assert res.role == "Worker"
    assert res.is_active is True

    # Check persistence in database
    db_user = db_session.query(User).filter(User.username == "shed_worker_1").first()
    assert db_user is not None
    assert verify_password("workerpass123", db_user.hashed_password) is True
