from fastapi import APIRouter

from .user import router as user_router
from .auth import router as auth_router
from .academy import router as academy_router
from .finance import router as finance_router
from .invest import router as invest_router
from .smart_forms import router as smart_forms_router

# Create main API router for v1
api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication"]
)

# Include user routes
api_router.include_router(
    user_router,
    prefix="/users",
    tags=["users"]
)

# Include academy routes
api_router.include_router(
    academy_router,
    prefix="/academy",
    tags=["academy"]
)

# Include finance routes
api_router.include_router(
    finance_router,
    prefix="/finance",
    tags=["finance"]
)

# Include investment routes
api_router.include_router(
    invest_router,
    prefix="/invest",
    tags=["investment"]
)

# Include smart forms routes
api_router.include_router(
    smart_forms_router,
    prefix="/smart-forms",
    tags=["smart-forms"]
)