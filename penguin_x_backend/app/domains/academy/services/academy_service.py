from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.services.base import BaseService
from app.models.academy import Course, Lesson, Enrollment
from app.schemas.academy import (
    CourseCreate, CourseRead,
    LessonCreate, LessonRead,
    EnrollmentCreate, EnrollmentRead
)


class CourseService(BaseService[Course, CourseCreate, dict]):
    """Service for course management operations."""
    
    def __init__(self):
        super().__init__(Course)
    
    async def get_by_id(self, db: AsyncSession, *, course_id: UUID) -> Optional[Course]:
        """Get course by UUID."""
        result = await db.execute(
            select(Course).where(Course.id == str(course_id))
        )
        return result.scalar_one_or_none()
    
    async def get_courses_by_creator(
        self, 
        db: AsyncSession, 
        *, 
        creator_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Course]:
        """Get courses created by a specific user."""
        result = await db.execute(
            select(Course)
            .where(Course.created_by == str(creator_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


class LessonService(BaseService[Lesson, LessonCreate, dict]):
    """Service for lesson management operations."""
    
    def __init__(self):
        super().__init__(Lesson)
    
    async def get_by_id(self, db: AsyncSession, *, lesson_id: UUID) -> Optional[Lesson]:
        """Get lesson by UUID."""
        result = await db.execute(
            select(Lesson).where(Lesson.id == str(lesson_id))
        )
        return result.scalar_one_or_none()
    
    async def get_lessons_by_course(
        self, 
        db: AsyncSession, 
        *, 
        course_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Lesson]:
        """Get lessons for a specific course."""
        result = await db.execute(
            select(Lesson)
            .where(Lesson.course_id == str(course_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


class EnrollmentService(BaseService[Enrollment, EnrollmentCreate, dict]):
    """Service for enrollment management operations."""
    
    def __init__(self):
        super().__init__(Enrollment)
    
    async def get_by_id(self, db: AsyncSession, *, enrollment_id: UUID) -> Optional[Enrollment]:
        """Get enrollment by UUID."""
        result = await db.execute(
            select(Enrollment).where(Enrollment.id == str(enrollment_id))
        )
        return result.scalar_one_or_none()
    
    async def get_enrollments_by_user(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Enrollment]:
        """Get enrollments for a specific user."""
        result = await db.execute(
            select(Enrollment)
            .where(Enrollment.user_id == str(user_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_enrollments_by_course(
        self, 
        db: AsyncSession, 
        *, 
        course_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Enrollment]:
        """Get enrollments for a specific course."""
        result = await db.execute(
            select(Enrollment)
            .where(Enrollment.course_id == str(course_id))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def is_user_enrolled(
        self, 
        db: AsyncSession, 
        *, 
        user_id: UUID, 
        course_id: UUID
    ) -> bool:
        """Check if user is enrolled in a course."""
        result = await db.execute(
            select(Enrollment)
            .where(
                (Enrollment.user_id == str(user_id)) & 
                (Enrollment.course_id == str(course_id))
            )
        )
        return result.scalar_one_or_none() is not None


# Create service instances
course_service = CourseService()
lesson_service = LessonService()
enrollment_service = EnrollmentService()
