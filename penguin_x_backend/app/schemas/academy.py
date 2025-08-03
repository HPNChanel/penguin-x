"""
Pydantic v2 schemas for academy models.

This module contains schemas for Course, Lesson, and Enrollment models
with proper validation and serialization support.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Course title")
    description: Optional[str] = Field(None, description="Course description")


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    created_by: UUID = Field(..., description="UUID of user creating the course")


class CourseRead(CourseBase):
    """Schema for reading course data (includes ID, timestamps, and relationships)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_by: UUID
    created_at: datetime
    lessons: Optional[List["LessonRead"]] = Field(default=None, description="Course lessons")


class LessonBase(BaseModel):
    """Base lesson schema with common fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Lesson title")
    content: Optional[str] = Field(None, description="Lesson content")
    video_url: Optional[str] = Field(None, max_length=500, description="URL to lesson video")


class LessonCreate(LessonBase):
    """Schema for creating a new lesson."""
    course_id: UUID = Field(..., description="UUID of the course this lesson belongs to")


class LessonRead(LessonBase):
    """Schema for reading lesson data (includes ID and timestamps)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    course_id: UUID
    created_at: datetime


class EnrollmentBase(BaseModel):
    """Base enrollment schema with common fields."""
    user_id: UUID = Field(..., description="UUID of the user enrolling")
    course_id: UUID = Field(..., description="UUID of the course being enrolled in")


class EnrollmentCreate(EnrollmentBase):
    """Schema for creating a new enrollment."""
    pass  # Inherits all fields from EnrollmentBase


class EnrollmentRead(EnrollmentBase):
    """Schema for reading enrollment data (includes ID and timestamps)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    enrolled_at: datetime


# Update forward references for CourseRead
CourseRead.model_rebuild()