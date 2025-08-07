from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.academy import Course, Lesson
from app.schemas.academy import CourseCreate, LessonCreate


async def get_all_courses(db: AsyncSession) -> list[Course]:
    """Get all courses from the database."""
    result = await db.execute(select(Course))
    return list(result.scalars().all())


async def get_course_by_id(db: AsyncSession, course_id: UUID) -> Course | None:
    """Get course by UUID."""
    result = await db.execute(select(Course).where(Course.id == str(course_id)))
    return result.scalar_one_or_none()


async def create_course(db: AsyncSession, course_data: CourseCreate) -> Course:
    """Create a new course."""
    course_dict = course_data.model_dump()
    # Convert UUID to string for the created_by field
    if 'created_by' in course_dict:
        course_dict['created_by'] = str(course_dict['created_by'])
    
    db_course = Course(**course_dict)
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    return db_course


async def get_all_lessons(db: AsyncSession) -> list[Lesson]:
    """Get all lessons from the database."""
    result = await db.execute(select(Lesson))
    return list(result.scalars().all())


async def get_lesson_by_id(db: AsyncSession, lesson_id: UUID) -> Lesson | None:
    """Get lesson by UUID."""
    result = await db.execute(select(Lesson).where(Lesson.id == str(lesson_id)))
    return result.scalar_one_or_none()


async def create_lesson(db: AsyncSession, lesson_data: LessonCreate) -> Lesson:
    """Create a new lesson."""
    lesson_dict = lesson_data.model_dump()
    # Convert UUID to string for the course_id field
    if 'course_id' in lesson_dict:
        lesson_dict['course_id'] = str(lesson_dict['course_id'])
    
    db_lesson = Lesson(**lesson_dict)
    db.add(db_lesson)
    await db.commit()
    await db.refresh(db_lesson)
    return db_lesson
