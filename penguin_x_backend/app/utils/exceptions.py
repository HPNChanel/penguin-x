from fastapi import HTTPException, status


class PenguinXException(Exception):
    """Base exception for Penguin X application."""
    pass


class ValidationError(PenguinXException):
    """Validation error exception."""
    pass


class NotFoundError(PenguinXException):
    """Resource not found exception."""
    pass


class UnauthorizedError(PenguinXException):
    """Unauthorized access exception."""
    pass


class ForbiddenError(PenguinXException):
    """Forbidden access exception."""
    pass


# HTTP Exception helpers
def not_found_exception(detail: str = "Resource not found"):
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=detail
    )


def unauthorized_exception(detail: str = "Not authenticated"):
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def forbidden_exception(detail: str = "Not enough permissions"):
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail
    )


def validation_exception(detail: str = "Validation error"):
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=detail
    )