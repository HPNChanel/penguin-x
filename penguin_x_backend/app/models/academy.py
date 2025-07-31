"""
Academy models for course management system.

This module contains models for Course, Lesson, and Enrollment
using SQLAlchemy 2.0+ async declarative style.
"""

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
from datetime import datetime
from typing import List, TYPE_CHECKING

from app.db.base_class import Base

# Import for type checking to avoid circular imports
if TYPE_CHECKING:
    from app.models.user import User


class Course(Base):
    """
    Course model for academy system.
    
    Represents a course that can contain multiple lessons
    and can be enrolled by multiple users.
    """
    
    __tablename__ = "courses"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Required fields
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Course title"
    )
    
    # Optional fields
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Course description"
    )
    
    # Foreign key to User
    created_by: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("users.id"),
        nullable=False,
        doc="UUID of user who created the course"
    )
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the course was created"
    )
    
    # Relationships
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson",
        back_populates="course",
        cascade="all, delete-orphan",
        doc="Lessons belonging to this course"
    )
    
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
        doc="Enrollments for this course"
    )
    
    # Relationship to User (creator)
    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        doc="User who created this course"
    )
    
    def __repr__(self) -> str:
        return f"<Course(id='{self.id}', title='{self.title}')>"


class Lesson(Base):
    """
    Lesson model for academy system.
    
    Represents a lesson that belongs to a course.
    """
    
    __tablename__ = "lessons"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Foreign key to Course
    course_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("courses.id"),
        nullable=False,
        doc="UUID of the course this lesson belongs to"
    )
    
    # Required fields
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Lesson title"
    )
    
    # Optional fields
    content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Lesson content"
    )
    
    video_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        doc="URL to lesson video"
    )
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the lesson was created"
    )
    
    # Relationships
    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="lessons",
        doc="Course this lesson belongs to"
    )
    
    def __repr__(self) -> str:
        return f"<Lesson(id='{self.id}', title='{self.title}', course_id='{self.course_id}')>"


class Enrollment(Base):
    """
    Enrollment model for academy system.
    
    Represents a user's enrollment in a course.
    """
    
    __tablename__ = "enrollments"
    
    # UUID Primary Key
    id: Mapped[str] = mapped_column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key"
    )
    
    # Foreign keys
    user_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("users.id"),
        nullable=False,
        doc="UUID of the enrolled user"
    )
    
    course_id: Mapped[str] = mapped_column(
        CHAR(36),
        ForeignKey("courses.id"),
        nullable=False,
        doc="UUID of the enrolled course"
    )
    
    # Timestamp
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the user enrolled"
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        doc="User who enrolled"
    )
    
    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="enrollments",
        doc="Course that was enrolled in"
    )
    
    def __repr__(self) -> str:
        return f"<Enrollment(id='{self.id}', user_id='{self.user_id}', course_id='{self.course_id}')>"