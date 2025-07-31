from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
    )


class TimestampSchema(BaseSchema):
    """Schema mixin for timestamp fields."""
    created_at: datetime
    updated_at: datetime


class BaseCreateSchema(BaseSchema):
    """Base schema for create operations."""
    pass


class BaseUpdateSchema(BaseSchema):
    """Base schema for update operations."""
    pass


class BaseInDBSchema(TimestampSchema):
    """Base schema for database models."""
    id: int


class ResponseSchema(BaseSchema):
    """Standard API response schema."""
    message: str
    success: bool = True
    data: Optional[dict] = None


class PaginationSchema(BaseSchema):
    """Pagination parameters schema."""
    page: int = 1
    size: int = 10
    total: Optional[int] = None
    pages: Optional[int] = None


class PaginatedResponseSchema(BaseSchema):
    """Paginated response schema."""
    items: list
    pagination: PaginationSchema