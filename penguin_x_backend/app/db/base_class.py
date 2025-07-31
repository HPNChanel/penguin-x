from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase, declared_attr
from datetime import datetime
from typing import Any


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


class TimestampMixin:
    """Mixin to add timestamp fields to models."""
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the record was created"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        doc="Timestamp when the record was last updated"
    )


class BaseModel(Base, TimestampMixin):
    """Base model with common fields for all entities."""
    __abstract__ = True
    
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
        doc="Primary key"
    )
    
    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        # Convert CamelCase to snake_case and pluralize
        import re
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', cls.__name__)
        name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()
        
        # Simple pluralization
        if name.endswith('y'):
            name = name[:-1] + 'ies'
        elif name.endswith(('s', 'sh', 'ch', 'x', 'z')):
            name = name + 'es'
        else:
            name = name + 's'
            
        return name
    
    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self) -> str:
        """String representation of the model."""
        class_name = self.__class__.__name__
        return f"<{class_name}(id={getattr(self, 'id', None)})>"


class SoftDeleteMixin:
    """Mixin to add soft delete functionality."""
    
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when the record was soft deleted"
    )
    
    @property
    def is_deleted(self) -> bool:
        """Check if the record is soft deleted."""
        return self.deleted_at is not None
    
    def soft_delete(self) -> None:
        """Mark the record as soft deleted."""
        self.deleted_at = datetime.utcnow()
    
    def restore(self) -> None:
        """Restore a soft deleted record."""
        self.deleted_at = None


class AuditMixin:
    """Mixin to add audit fields to models."""
    
    created_by = Column(
        Integer,
        nullable=True,
        doc="ID of user who created the record"
    )
    
    updated_by = Column(
        Integer, 
        nullable=True,
        doc="ID of user who last updated the record"
    )


class VersionMixin:
    """Mixin to add version control to models."""
    
    version = Column(
        Integer,
        default=1,
        nullable=False,
        doc="Version number for optimistic locking"
    )
    
    def increment_version(self) -> None:
        """Increment the version number."""
        self.version += 1