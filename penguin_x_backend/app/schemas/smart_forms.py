"""
Enhanced form schemas for smart form validation and processing.

This module provides Pydantic v2 schemas for dynamic form validation,
smart field processing, and advanced form configuration support.
"""

from typing import Optional, List, Dict, Any, Union, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
import re


class FieldType(str, Enum):
    """Supported field types for smart forms."""
    TEXT = "text"
    EMAIL = "email"
    PASSWORD = "password"
    NUMBER = "number"
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    DATE = "date"
    DATETIME = "datetime"
    TEL = "tel"
    URL = "url"
    TEXTAREA = "textarea"
    SELECT = "select"
    MULTISELECT = "multiselect"
    SWITCH = "switch"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    FILE = "file"


class ValidationOperator(str, Enum):
    """Operators for conditional field validation."""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"


class ConditionalAction(str, Enum):
    """Actions for conditional field behavior."""
    SHOW = "show"
    HIDE = "hide"
    REQUIRE = "require"
    DISABLE = "disable"


class FormattingType(str, Enum):
    """Types of field formatting."""
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    PHONE = "phone"
    DATE = "date"
    NUMBER = "number"
    TEXT = "text"


class SelectOptionCreate(BaseModel):
    """Schema for creating select field options."""
    model_config = ConfigDict(from_attributes=True)
    
    label: str = Field(..., min_length=1, max_length=255)
    value: Union[str, int, float] = Field(...)
    disabled: bool = Field(default=False)
    description: Optional[str] = Field(None, max_length=500)


class SelectOptionRead(SelectOptionCreate):
    """Schema for reading select field options."""
    model_config = ConfigDict(from_attributes=True)


class ConditionalLogicCreate(BaseModel):
    """Schema for creating conditional field logic."""
    model_config = ConfigDict(from_attributes=True)
    
    field: str = Field(..., min_length=1, max_length=100)
    operator: ValidationOperator = Field(...)
    value: Any = Field(...)
    action: ConditionalAction = Field(...)


class ConditionalLogicRead(ConditionalLogicCreate):
    """Schema for reading conditional field logic."""
    model_config = ConfigDict(from_attributes=True)


class FieldValidationCreate(BaseModel):
    """Schema for creating field validation rules."""
    model_config = ConfigDict(from_attributes=True)
    
    required: bool = Field(default=False)
    min: Optional[Union[int, float]] = Field(None)
    max: Optional[Union[int, float]] = Field(None)
    min_length: Optional[int] = Field(None, ge=0)
    max_length: Optional[int] = Field(None, ge=0)
    pattern: Optional[str] = Field(None, max_length=1000)
    custom_message: Optional[str] = Field(None, max_length=500)
    
    @field_validator('pattern')
    @classmethod
    def validate_pattern(cls, v: Optional[str]) -> Optional[str]:
        """Validate regex pattern."""
        if v is not None:
            try:
                re.compile(v)
            except re.error as e:
                raise ValueError(f"Invalid regex pattern: {e}")
        return v


class FieldValidationRead(FieldValidationCreate):
    """Schema for reading field validation rules."""
    model_config = ConfigDict(from_attributes=True)


class FieldFormattingCreate(BaseModel):
    """Schema for creating field formatting rules."""
    model_config = ConfigDict(from_attributes=True)
    
    type: FormattingType = Field(...)
    options: Dict[str, Any] = Field(default_factory=dict)
    
    @field_validator('options')
    @classmethod
    def validate_options(cls, v: Dict[str, Any], info) -> Dict[str, Any]:
        """Validate formatting options based on type."""
        if hasattr(info, 'data') and 'type' in info.data:
            formatting_type = info.data['type']
            
            if formatting_type == FormattingType.CURRENCY:
                allowed_keys = {'currency', 'locale', 'decimals', 'symbol'}
                if not set(v.keys()).issubset(allowed_keys):
                    raise ValueError(f"Invalid currency formatting options. Allowed: {allowed_keys}")
                    
            elif formatting_type == FormattingType.NUMBER:
                allowed_keys = {'decimals', 'thousandsSeparator', 'prefix', 'suffix'}
                if not set(v.keys()).issubset(allowed_keys):
                    raise ValueError(f"Invalid number formatting options. Allowed: {allowed_keys}")
        
        return v


class FieldFormattingRead(FieldFormattingCreate):
    """Schema for reading field formatting rules."""
    model_config = ConfigDict(from_attributes=True)


class SmartFieldConfigCreate(BaseModel):
    """Schema for creating smart field configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-zA-Z][a-zA-Z0-9_]*$')
    label: str = Field(..., min_length=1, max_length=255)
    type: FieldType = Field(...)
    placeholder: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    default_value: Optional[Any] = Field(None)
    
    validation: Optional[FieldValidationCreate] = Field(None)
    formatting: Optional[FieldFormattingCreate] = Field(None)
    options: List[SelectOptionCreate] = Field(default_factory=list)
    conditional: List[ConditionalLogicCreate] = Field(default_factory=list)
    
    auto_complete: Optional[str] = Field(None, max_length=100)
    disabled: bool = Field(default=False)
    readonly: bool = Field(default=False)
    
    # Grid layout properties
    grid_span: Optional[int] = Field(None, ge=1, le=12)
    grid_row: Optional[int] = Field(None, ge=1)
    grid_col: Optional[int] = Field(None, ge=1)
    
    # Accessibility properties
    aria_label: Optional[str] = Field(None, max_length=255)
    aria_describedby: Optional[str] = Field(None, max_length=255)
    help_text: Optional[str] = Field(None, max_length=500)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate field name follows naming conventions."""
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', v):
            raise ValueError("Field name must start with a letter and contain only letters, numbers, and underscores")
        return v
    
    @field_validator('options')
    @classmethod
    def validate_options(cls, v: List[SelectOptionCreate], info) -> List[SelectOptionCreate]:
        """Validate options are provided for select fields."""
        if hasattr(info, 'data') and 'type' in info.data:
            field_type = info.data['type']
            if field_type in [FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO, FieldType.CHECKBOX]:
                if not v:
                    raise ValueError(f"Options are required for {field_type} field type")
        return v


class SmartFieldConfigRead(BaseModel):
    """Schema for reading smart field configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    label: str
    type: FieldType
    placeholder: Optional[str]
    description: Optional[str]
    default_value: Optional[Any]
    
    validation: Optional[FieldValidationRead]
    formatting: Optional[FieldFormattingRead]
    options: List[SelectOptionRead]
    conditional: List[ConditionalLogicRead]
    
    auto_complete: Optional[str]
    disabled: bool
    readonly: bool
    
    grid_span: Optional[int]
    grid_row: Optional[int]
    grid_col: Optional[int]
    
    aria_label: Optional[str]
    aria_describedby: Optional[str]
    help_text: Optional[str]


class FormLayout(str, Enum):
    """Form layout options."""
    SINGLE = "single"
    TWO_COLUMN = "two-column"
    GRID = "grid"


class FormTheme(str, Enum):
    """Form theme options."""
    DEFAULT = "default"
    MINIMAL = "minimal"
    CARD = "card"


class SmartFormConfigCreate(BaseModel):
    """Schema for creating smart form configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    fields: List[SmartFieldConfigCreate] = Field(..., min_length=1)
    
    layout: FormLayout = Field(default=FormLayout.SINGLE)
    theme: FormTheme = Field(default=FormTheme.DEFAULT)
    submit_text: str = Field(default="Submit", max_length=50)
    reset_text: str = Field(default="Reset", max_length=50)
    show_reset: bool = Field(default=True)
    
    auto_save: bool = Field(default=False)
    real_time_validation: bool = Field(default=True)
    progress_indicator: bool = Field(default=False)
    
    # Rate limiting configuration
    rate_limit_config: Optional[str] = Field(None, max_length=50)
    
    @field_validator('fields')
    @classmethod
    def validate_fields(cls, v: List[SmartFieldConfigCreate]) -> List[SmartFieldConfigCreate]:
        """Validate field names are unique."""
        field_names = [field.name for field in v]
        if len(field_names) != len(set(field_names)):
            raise ValueError("Field names must be unique within a form")
        return v


class SmartFormConfigRead(BaseModel):
    """Schema for reading smart form configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: Optional[str]
    description: Optional[str]
    fields: List[SmartFieldConfigRead]
    
    layout: FormLayout
    theme: FormTheme
    submit_text: str
    reset_text: str
    show_reset: bool
    
    auto_save: bool
    real_time_validation: bool
    progress_indicator: bool
    
    rate_limit_config: Optional[str]
    
    created_at: datetime
    updated_at: datetime


class FormSubmissionCreate(BaseModel):
    """Schema for creating form submission."""
    model_config = ConfigDict(from_attributes=True)
    
    form_config_id: str = Field(..., min_length=1)
    form_data: Dict[str, Any] = Field(...)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @field_validator('form_data')
    @classmethod
    def validate_form_data(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Basic validation of form data structure."""
        if not v:
            raise ValueError("Form data cannot be empty")
        return v


class FormSubmissionRead(BaseModel):
    """Schema for reading form submission."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    form_config_id: str
    form_data: Dict[str, Any]
    metadata: Dict[str, Any]
    
    submitted_at: datetime
    user_id: Optional[str]


class FormValidationRequest(BaseModel):
    """Schema for form validation requests."""
    model_config = ConfigDict(from_attributes=True)
    
    form_config_id: str = Field(..., min_length=1)
    field_name: Optional[str] = Field(None, min_length=1)
    form_data: Dict[str, Any] = Field(...)


class FieldValidationResult(BaseModel):
    """Schema for field validation results."""
    model_config = ConfigDict(from_attributes=True)
    
    field_name: str
    is_valid: bool
    error_message: Optional[str] = None
    formatted_value: Optional[Any] = None
    suggestions: List[str] = Field(default_factory=list)


class FormValidationResponse(BaseModel):
    """Schema for form validation responses."""
    model_config = ConfigDict(from_attributes=True)
    
    is_valid: bool
    field_results: List[FieldValidationResult]
    form_errors: List[str] = Field(default_factory=list)


# Enhanced transaction schemas with smart form support
class SmartTransactionCreate(BaseModel):
    """Enhanced transaction creation schema with smart form validation."""
    model_config = ConfigDict(from_attributes=True)
    
    type: Literal["income", "expense"] = Field(..., description="Transaction type")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Transaction amount")
    category: str = Field(..., min_length=1, max_length=100)
    date: date = Field(..., description="Transaction date")
    description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list)
    
    # Enhanced fields for smart forms
    currency: str = Field(default="USD", max_length=3)
    exchange_rate: Optional[Decimal] = Field(None, gt=0, decimal_places=6)
    reference_number: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    
    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Validate currency code."""
        if len(v) != 3 or not v.isalpha():
            raise ValueError("Currency must be a 3-letter code")
        return v.upper()
    
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate and clean tags."""
        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed")
        
        cleaned_tags = []
        for tag in v:
            if not tag or len(tag.strip()) == 0:
                continue
            if len(tag.strip()) > 50:
                raise ValueError("Tag cannot exceed 50 characters")
            cleaned_tags.append(tag.strip().lower())
        
        return list(set(cleaned_tags))  # Remove duplicates


class SmartTransactionRead(BaseModel):
    """Enhanced transaction read schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    type: str
    amount: Decimal
    category: str
    date: date
    description: Optional[str]
    tags: List[str]
    currency: str
    exchange_rate: Optional[Decimal]
    reference_number: Optional[str]
    location: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    user_id: str


# Enhanced investment schemas with smart form support
class SmartInvestmentCreate(BaseModel):
    """Enhanced investment creation schema with smart form validation."""
    model_config = ConfigDict(from_attributes=True)
    
    symbol: str = Field(..., min_length=1, max_length=10, pattern=r'^[A-Z0-9.-]+$')
    asset_type: Literal["stock", "etf", "mutual_fund", "bond", "crypto", "real_estate", "commodity"] = Field(...)
    shares: Decimal = Field(..., gt=0, decimal_places=6)
    price_per_share: Decimal = Field(..., gt=0, decimal_places=4)
    purchase_date: date = Field(...)
    broker: Optional[str] = Field(None, max_length=100)
    fees: Decimal = Field(default=Decimal('0.00'), ge=0, decimal_places=2)
    notes: Optional[str] = Field(None, max_length=1000)
    
    # Calculated field
    @property
    def total_amount(self) -> Decimal:
        """Calculate total investment amount."""
        return (self.shares * self.price_per_share) + self.fees
    
    @field_validator('symbol')
    @classmethod
    def validate_symbol(cls, v: str) -> str:
        """Validate and normalize symbol."""
        return v.upper().strip()
    
    @field_validator('purchase_date')
    @classmethod
    def validate_purchase_date(cls, v: date) -> date:
        """Validate purchase date is not in the future."""
        if v > date.today():
            raise ValueError("Purchase date cannot be in the future")
        return v


class SmartInvestmentRead(BaseModel):
    """Enhanced investment read schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    symbol: str
    asset_type: str
    shares: Decimal
    price_per_share: Decimal
    total_amount: Decimal
    purchase_date: date
    broker: Optional[str]
    fees: Decimal
    notes: Optional[str]
    
    current_value: Optional[Decimal]
    performance: Optional[Dict[str, Any]]
    
    created_at: datetime
    updated_at: datetime
    user_id: str


# Form analytics schemas
class FormAnalyticsCreate(BaseModel):
    """Schema for form analytics data."""
    model_config = ConfigDict(from_attributes=True)
    
    form_config_id: str = Field(..., min_length=1)
    session_id: str = Field(..., min_length=1)
    event_type: Literal["field_focus", "field_blur", "field_change", "field_error", "form_submit", "form_abandon"] = Field(...)
    field_name: Optional[str] = Field(None)
    event_data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FormAnalyticsRead(BaseModel):
    """Schema for reading form analytics."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    form_config_id: str
    session_id: str
    event_type: str
    field_name: Optional[str]
    event_data: Dict[str, Any]
    timestamp: datetime
    user_id: Optional[str]


class FormAnalyticsSummary(BaseModel):
    """Schema for form analytics summary."""
    model_config = ConfigDict(from_attributes=True)
    
    form_config_id: str
    total_views: int
    total_submissions: int
    completion_rate: float
    average_time_to_complete: Optional[float]
    field_abandonment_rates: Dict[str, float]
    common_errors: List[Dict[str, Any]]
    conversion_funnel: List[Dict[str, Any]]
