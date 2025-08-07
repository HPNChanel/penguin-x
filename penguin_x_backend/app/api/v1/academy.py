from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.core.auth.permissions import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.services import academy_service
from app.schemas.academy import (
    CourseCreate, CourseRead,
    LessonCreate, LessonRead
)

router = APIRouter()


# Course endpoints
@router.get("/courses", response_model=List[CourseRead], tags=["Academy"])
async def get_courses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all courses (authenticated users).
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        List[CourseRead]: List of courses
    """
    courses = await academy_service.get_all_courses(db)
    return [CourseRead.model_validate(course) for course in courses]


@router.post("/courses", response_model=CourseRead, tags=["Academy"])
async def create_course(
    course_create: CourseCreate,
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new course (admin only).
    
    Args:
        course_create: Course creation data
        current_user: Current active superuser
        db: Database session
        
    Returns:
        CourseRead: Created course information
        
    Raises:
        HTTPException: If course creation fails
    """
    try:
        course = await academy_service.create_course(db, course_create)
        return CourseRead.model_validate(course)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course creation failed: {str(e)}"
        )


@router.get("/courses/{course_id}", response_model=CourseRead, tags=["Academy"])
async def get_course_by_id(
    course_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get course by ID (authenticated users).
    
    Args:
        course_id: Course UUID
        current_user: Current active user
        db: Database session
        
    Returns:
        CourseRead: Course information
        
    Raises:
        HTTPException: If course not found
    """
    course = await academy_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return CourseRead.model_validate(course)


# Admin routes
@router.get("/admin/courses", response_model=List[CourseRead], tags=["Academy", "Admin"])
async def admin_get_all_courses(
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all courses with admin privileges (superuser only).
    
    Args:
        current_user: Current active superuser
        db: Database session
        
    Returns:
        List[CourseRead]: List of all courses with admin details
    """
    courses = await academy_service.get_all_courses(db)
    return [CourseRead.model_validate(course) for course in courses]


# Lesson endpoints
@router.get("/lessons", response_model=List[LessonRead], tags=["Academy"])
async def get_lessons(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all lessons (authenticated users).
    
    Args:
        current_user: Current active user
        db: Database session
        
    Returns:
        List[LessonRead]: List of lessons
    """
    lessons = await academy_service.get_all_lessons(db)
    return [LessonRead.model_validate(lesson) for lesson in lessons]


@router.post("/lessons", response_model=LessonRead, tags=["Academy"])
async def create_lesson(
    lesson_create: LessonCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new lesson.
    
    Args:
        lesson_create: Lesson creation data
        db: Database session
        
    Returns:
        LessonRead: Created lesson information
        
    Raises:
        HTTPException: If lesson creation fails
    """
    try:
        lesson = await academy_service.create_lesson(db, lesson_create)
        return LessonRead.model_validate(lesson)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lesson creation failed: {str(e)}"
        )


@router.get("/lessons/{lesson_id}", response_model=LessonRead, tags=["Academy"])
async def get_lesson_by_id(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get lesson by ID.
    
    Args:
        lesson_id: Lesson UUID
        db: Database session
        
    Returns:
        LessonRead: Lesson information
        
    Raises:
        HTTPException: If lesson not found
    """
    lesson = await academy_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    return LessonRead.model_validate(lesson)


