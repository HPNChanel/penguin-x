"""
Smart Forms API endpoints for dynamic form creation, validation, and submission.

This module provides RESTful endpoints for managing smart forms,
including form configuration, real-time validation, and form submission handling.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
import json
import uuid

from app.db.session import get_db
from app.core.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.smart_forms import (
    SmartFormConfigCreate,
    SmartFormConfigRead,
    FormSubmissionCreate,
    FormSubmissionRead,
    FormValidationRequest,
    FormValidationResponse,
    FieldValidationResult,
    FormAnalyticsCreate,
    FormAnalyticsSummary,
    SmartTransactionCreate,
    SmartTransactionRead,
    SmartInvestmentCreate,
    SmartInvestmentRead
)

router = APIRouter()


# Mock storage for demonstration - in production, use proper database models
form_configs_store: Dict[str, Dict[str, Any]] = {}
form_submissions_store: Dict[str, Dict[str, Any]] = {}
form_analytics_store: List[Dict[str, Any]] = []


@router.post("/configs", response_model=SmartFormConfigRead, status_code=status.HTTP_201_CREATED)
async def create_form_config(
    config: SmartFormConfigCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new smart form configuration.
    
    This endpoint allows users to create reusable form configurations
    with validation rules, conditional logic, and formatting options.
    """
    try:
        config_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Convert Pydantic model to dict and add metadata
        config_data = config.model_dump()
        config_data.update({
            "id": config_id,
            "created_at": now,
            "updated_at": now,
            "user_id": current_user.id
        })
        
        # Add unique IDs to fields
        for i, field in enumerate(config_data["fields"]):
            field["id"] = f"{config_id}_field_{i}"
        
        # Store configuration (in production, save to database)
        form_configs_store[config_id] = config_data
        
        return SmartFormConfigRead(**config_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create form configuration: {str(e)}"
        )


@router.get("/configs", response_model=List[SmartFormConfigRead])
async def get_form_configs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all form configurations for the current user.
    """
    try:
        user_configs = [
            SmartFormConfigRead(**config) 
            for config in form_configs_store.values() 
            if config.get("user_id") == current_user.id
        ]
        return user_configs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve form configurations: {str(e)}"
        )


@router.get("/configs/{config_id}", response_model=SmartFormConfigRead)
async def get_form_config(
    config_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific form configuration by ID.
    """
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    config = form_configs_store[config_id]
    
    # Check ownership (in production, use proper authorization)
    if config.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this form configuration"
        )
    
    return SmartFormConfigRead(**config)


@router.put("/configs/{config_id}", response_model=SmartFormConfigRead)
async def update_form_config(
    config_id: str,
    config_update: SmartFormConfigCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing form configuration.
    """
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    existing_config = form_configs_store[config_id]
    
    # Check ownership
    if existing_config.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this form configuration"
        )
    
    try:
        # Update configuration
        updated_data = config_update.model_dump()
        updated_data.update({
            "id": config_id,
            "created_at": existing_config["created_at"],
            "updated_at": datetime.utcnow(),
            "user_id": current_user.id
        })
        
        # Preserve or update field IDs
        for i, field in enumerate(updated_data["fields"]):
            if i < len(existing_config["fields"]):
                field["id"] = existing_config["fields"][i]["id"]
            else:
                field["id"] = f"{config_id}_field_{i}"
        
        form_configs_store[config_id] = updated_data
        
        return SmartFormConfigRead(**updated_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update form configuration: {str(e)}"
        )


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form_config(
    config_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a form configuration.
    """
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    config = form_configs_store[config_id]
    
    # Check ownership
    if config.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this form configuration"
        )
    
    del form_configs_store[config_id]


@router.post("/validate", response_model=FormValidationResponse)
async def validate_form_data(
    validation_request: FormValidationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate form data against a form configuration.
    
    This endpoint provides real-time validation for form fields,
    including formatting suggestions and error messages.
    """
    config_id = validation_request.form_config_id
    
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    config = form_configs_store[config_id]
    field_results = []
    form_errors = []
    overall_valid = True
    
    try:
        # Validate each field
        for field_config in config["fields"]:
            field_name = field_config["name"]
            field_value = validation_request.form_data.get(field_name)
            
            # Skip validation if specific field requested and this isn't it
            if validation_request.field_name and validation_request.field_name != field_name:
                continue
            
            result = validate_field(field_config, field_value, validation_request.form_data)
            field_results.append(result)
            
            if not result.is_valid:
                overall_valid = False
        
        # Cross-field validation
        cross_field_errors = validate_cross_fields(config, validation_request.form_data)
        form_errors.extend(cross_field_errors)
        
        if cross_field_errors:
            overall_valid = False
        
        return FormValidationResponse(
            is_valid=overall_valid,
            field_results=field_results,
            form_errors=form_errors
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        )


@router.post("/submit", response_model=FormSubmissionRead, status_code=status.HTTP_201_CREATED)
async def submit_form(
    submission: FormSubmissionCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit form data after validation.
    
    This endpoint processes form submissions, validates data,
    and stores the submission for further processing.
    """
    config_id = submission.form_config_id
    
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    config = form_configs_store[config_id]
    
    try:
        # Validate form data before submission
        validation_request = FormValidationRequest(
            form_config_id=config_id,
            form_data=submission.form_data
        )
        
        # Use internal validation (avoid recursive API call)
        field_results = []
        for field_config in config["fields"]:
            field_name = field_config["name"]
            field_value = submission.form_data.get(field_name)
            result = validate_field(field_config, field_value, submission.form_data)
            field_results.append(result)
        
        # Check if validation passed
        invalid_fields = [r for r in field_results if not r.is_valid]
        if invalid_fields:
            error_details = [f"{r.field_name}: {r.error_message}" for r in invalid_fields]
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Validation failed: {'; '.join(error_details)}"
            )
        
        # Create submission record
        submission_id = str(uuid.uuid4())
        submission_data = {
            "id": submission_id,
            "form_config_id": config_id,
            "form_data": submission.form_data,
            "metadata": submission.metadata,
            "submitted_at": datetime.utcnow(),
            "user_id": current_user.id
        }
        
        # Store submission (in production, save to database)
        form_submissions_store[submission_id] = submission_data
        
        # Process form submission in background
        background_tasks.add_task(process_form_submission, submission_data, config)
        
        return FormSubmissionRead(**submission_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Form submission failed: {str(e)}"
        )


@router.get("/submissions", response_model=List[FormSubmissionRead])
async def get_form_submissions(
    config_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get form submissions for the current user.
    """
    try:
        submissions = []
        for submission in form_submissions_store.values():
            if submission.get("user_id") != current_user.id:
                continue
            if config_id and submission.get("form_config_id") != config_id:
                continue
            submissions.append(FormSubmissionRead(**submission))
        
        # Simple pagination
        submissions.sort(key=lambda x: x.submitted_at, reverse=True)
        return submissions[offset:offset + limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve submissions: {str(e)}"
        )


@router.post("/analytics", status_code=status.HTTP_201_CREATED)
async def track_form_analytics(
    analytics: FormAnalyticsCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Track form analytics events.
    
    This endpoint collects analytics data for form interactions,
    helping improve form design and user experience.
    """
    try:
        analytics_data = analytics.model_dump()
        analytics_data.update({
            "id": str(uuid.uuid4()),
            "user_id": current_user.id
        })
        
        # Store analytics (in production, save to database)
        form_analytics_store.append(analytics_data)
        
        return {"message": "Analytics tracked successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to track analytics: {str(e)}"
        )


@router.get("/analytics/{config_id}/summary", response_model=FormAnalyticsSummary)
async def get_form_analytics_summary(
    config_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics summary for a form configuration.
    """
    if config_id not in form_configs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form configuration not found"
        )
    
    config = form_configs_store[config_id]
    
    # Check ownership
    if config.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this form configuration"
        )
    
    try:
        # Filter analytics data for the specified period
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        relevant_analytics = [
            a for a in form_analytics_store
            if a["form_config_id"] == config_id and a["timestamp"] >= cutoff_date
        ]
        
        # Calculate summary metrics
        total_views = len([a for a in relevant_analytics if a["event_type"] == "form_view"])
        total_submissions = len([a for a in relevant_analytics if a["event_type"] == "form_submit"])
        completion_rate = (total_submissions / total_views * 100) if total_views > 0 else 0
        
        # Calculate field abandonment rates
        field_abandonment_rates = {}
        for field_config in config["fields"]:
            field_name = field_config["name"]
            field_focuses = len([a for a in relevant_analytics 
                               if a["event_type"] == "field_focus" and a["field_name"] == field_name])
            field_blurs = len([a for a in relevant_analytics 
                             if a["event_type"] == "field_blur" and a["field_name"] == field_name])
            
            if field_focuses > 0:
                abandonment_rate = ((field_focuses - field_blurs) / field_focuses * 100)
                field_abandonment_rates[field_name] = abandonment_rate
        
        # Get common errors
        error_events = [a for a in relevant_analytics if a["event_type"] == "field_error"]
        common_errors = []
        
        # Calculate average time to complete (simplified)
        submission_times = [a["event_data"].get("time_spent", 0) for a in relevant_analytics 
                          if a["event_type"] == "form_submit" and "time_spent" in a.get("event_data", {})]
        average_time_to_complete = sum(submission_times) / len(submission_times) if submission_times else None
        
        return FormAnalyticsSummary(
            form_config_id=config_id,
            total_views=total_views,
            total_submissions=total_submissions,
            completion_rate=completion_rate,
            average_time_to_complete=average_time_to_complete,
            field_abandonment_rates=field_abandonment_rates,
            common_errors=common_errors,
            conversion_funnel=[]  # Simplified for demo
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics summary: {str(e)}"
        )


# Enhanced transaction endpoints with smart form integration
@router.post("/transactions", response_model=SmartTransactionRead, status_code=status.HTTP_201_CREATED)
async def create_smart_transaction(
    transaction: SmartTransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new transaction using smart form validation.
    """
    try:
        # In production, save to database using actual transaction model
        transaction_data = transaction.model_dump()
        transaction_data.update({
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "user_id": current_user.id
        })
        
        return SmartTransactionRead(**transaction_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create transaction: {str(e)}"
        )


@router.post("/investments", response_model=SmartInvestmentRead, status_code=status.HTTP_201_CREATED)
async def create_smart_investment(
    investment: SmartInvestmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new investment using smart form validation.
    """
    try:
        # In production, save to database using actual investment model
        investment_data = investment.model_dump()
        investment_data.update({
            "id": str(uuid.uuid4()),
            "total_amount": investment.total_amount,
            "current_value": None,
            "performance": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "user_id": current_user.id
        })
        
        return SmartInvestmentRead(**investment_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create investment: {str(e)}"
        )


# Helper functions
def validate_field(field_config: Dict[str, Any], value: Any, form_data: Dict[str, Any]) -> FieldValidationResult:
    """
    Validate a single field based on its configuration.
    """
    field_name = field_config["name"]
    field_type = field_config["type"]
    validation = field_config.get("validation", {})
    
    is_valid = True
    error_message = None
    formatted_value = value
    suggestions = []
    
    try:
        # Required field validation
        if validation.get("required", False) and (value is None or value == ""):
            is_valid = False
            error_message = f"{field_config['label']} is required"
            return FieldValidationResult(
                field_name=field_name,
                is_valid=is_valid,
                error_message=error_message,
                formatted_value=formatted_value,
                suggestions=suggestions
            )
        
        # Skip further validation if field is empty and not required
        if value is None or value == "":
            return FieldValidationResult(
                field_name=field_name,
                is_valid=True,
                error_message=None,
                formatted_value=formatted_value,
                suggestions=suggestions
            )
        
        # Type-specific validation
        if field_type == "email":
            import re
            email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_pattern, str(value)):
                is_valid = False
                error_message = "Please enter a valid email address"
                # Suggest common email domains
                if "@" in str(value) and "." not in str(value).split("@")[-1]:
                    suggestions = ["gmail.com", "yahoo.com", "hotmail.com"]
        
        elif field_type == "number" or field_type == "currency":
            try:
                num_value = float(value)
                if validation.get("min") is not None and num_value < validation["min"]:
                    is_valid = False
                    error_message = f"Value must be at least {validation['min']}"
                elif validation.get("max") is not None and num_value > validation["max"]:
                    is_valid = False
                    error_message = f"Value must not exceed {validation['max']}"
            except (ValueError, TypeError):
                is_valid = False
                error_message = "Please enter a valid number"
        
        elif field_type in ["text", "textarea"]:
            str_value = str(value)
            if validation.get("min_length") and len(str_value) < validation["min_length"]:
                is_valid = False
                error_message = f"Must be at least {validation['min_length']} characters"
            elif validation.get("max_length") and len(str_value) > validation["max_length"]:
                is_valid = False
                error_message = f"Must not exceed {validation['max_length']} characters"
            
            # Pattern validation
            if validation.get("pattern"):
                import re
                if not re.match(validation["pattern"], str_value):
                    is_valid = False
                    error_message = validation.get("custom_message", "Invalid format")
        
        # Apply formatting if validation passed
        if is_valid and field_config.get("formatting"):
            formatted_value = apply_formatting(value, field_config["formatting"])
        
    except Exception as e:
        is_valid = False
        error_message = f"Validation error: {str(e)}"
    
    return FieldValidationResult(
        field_name=field_name,
        is_valid=is_valid,
        error_message=error_message,
        formatted_value=formatted_value,
        suggestions=suggestions
    )


def validate_cross_fields(config: Dict[str, Any], form_data: Dict[str, Any]) -> List[str]:
    """
    Validate cross-field dependencies and relationships.
    """
    errors = []
    
    # Example: Password confirmation validation
    password_fields = [f for f in config["fields"] if f["type"] == "password"]
    if len(password_fields) >= 2:
        password_field = next((f for f in password_fields if "password" in f["name"].lower() and "confirm" not in f["name"].lower()), None)
        confirm_field = next((f for f in password_fields if "confirm" in f["name"].lower()), None)
        
        if password_field and confirm_field:
            password_value = form_data.get(password_field["name"])
            confirm_value = form_data.get(confirm_field["name"])
            
            if password_value and confirm_value and password_value != confirm_value:
                errors.append("Passwords do not match")
    
    return errors


def apply_formatting(value: Any, formatting_config: Dict[str, Any]) -> Any:
    """
    Apply formatting to field values based on configuration.
    """
    formatting_type = formatting_config.get("type")
    options = formatting_config.get("options", {})
    
    if formatting_type == "currency":
        try:
            num_value = float(value)
            # Basic currency formatting (in production, use proper locale formatting)
            return f"${num_value:,.2f}"
        except (ValueError, TypeError):
            return value
    
    elif formatting_type == "percentage":
        try:
            num_value = float(value)
            return f"{num_value}%"
        except (ValueError, TypeError):
            return value
    
    elif formatting_type == "phone":
        # Basic phone formatting for US numbers
        digits = ''.join(filter(str.isdigit, str(value)))
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        return value
    
    return value


async def process_form_submission(submission_data: Dict[str, Any], config: Dict[str, Any]):
    """
    Process form submission in background.
    
    This function handles post-submission processing like sending emails,
    triggering workflows, or integrating with external services.
    """
    # Example processing logic
    print(f"Processing submission {submission_data['id']} for form {config['id']}")
    
    # In production, implement actual processing logic:
    # - Send confirmation emails
    # - Trigger business workflows
    # - Update related data
    # - Send notifications
    pass
