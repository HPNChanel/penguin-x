# Analytics & Event Tracking Schema

## Overview

Penguin X implements a comprehensive analytics system that respects user privacy while providing valuable insights into application usage, performance, and user behavior. This document outlines the event schema, privacy considerations, and implementation details.

## Event Schema

### Core Event Structure

All events follow a consistent schema:

```typescript
interface UserEvent {
  name: EventName                    // Standardized event name from EVENT_MAP
  properties?: Record<string, any>   // Event-specific properties
  timestamp: number                  // Unix timestamp in milliseconds
  sessionId: string                  // Unique session identifier
  userId?: string                    // User ID (if authenticated)
  metadata?: {                       // Automatic metadata
    page: string                     // Current page path
    component?: string               // Component name (if applicable)
    feature?: string                 // Feature category
    userAgent: string                // User agent string
    viewport: string                 // Viewport dimensions
  }
}
```

### Consent Categories

The system supports granular consent management:

```typescript
interface ConsentSettings {
  analytics: boolean     // User behavior tracking
  performance: boolean   // Performance monitoring (essential)
  functional: boolean    // Core functionality (essential)
  marketing: boolean     // Personalization and targeting
  lastUpdated: number    // Timestamp of last consent update
}
```

## Event Map

### Navigation Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `page_view` | User views a page | `path`, `search`, `hash`, `title`, `referrer`, `loadTime` |
| `route_change` | SPA route change | `from`, `to`, `method` |

### Dashboard Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `view_dashboard` | Dashboard page viewed | `widgets_visible`, `layout_type` |
| `dashboard_tab_change` | Tab switched in dashboard | `from_tab`, `to_tab`, `time_on_previous` |
| `widget_interact` | Widget interaction | `widget_type`, `action`, `position` |

### Financial Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `add_transaction` | New transaction created | `type`, `category`, `amount_range`, `method` |
| `edit_transaction` | Transaction modified | `field_changed`, `transaction_age` |
| `delete_transaction` | Transaction removed | `transaction_age`, `category` |
| `view_transaction_details` | Transaction details viewed | `transaction_type`, `age` |
| `export_transactions` | Data export initiated | `format`, `date_range`, `count` |

### Investment Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `view_portfolio` | Portfolio page accessed | `tab`, `time_range` |
| `add_investment` | New investment added | `asset_type`, `allocation_range` |
| `update_investment` | Investment modified | `field_changed`, `asset_type` |
| `view_investment_details` | Investment details viewed | `asset_type`, `performance_period` |

### Academy Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `view_academy` | Academy page visited | `section`, `user_level` |
| `start_lesson` | Lesson/course started | `lesson_id`, `category`, `difficulty` |
| `complete_lesson` | Lesson finished | `lesson_id`, `duration`, `completion_rate` |
| `download_resource` | Resource downloaded | `resource_type`, `format`, `lesson_id` |

### UI/UX Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `change_theme` | Theme preference changed | `from_theme`, `to_theme`, `high_contrast`, `system_theme` |
| `toggle_sidebar` | Sidebar state changed | `action`, `page`, `viewport_size` |
| `mobile_nav_toggle` | Mobile navigation toggled | `action`, `page` |
| `search_query` | Search performed | `query_length`, `results_count`, `category` |

### Authentication Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `login_attempt` | Login form submitted | `method`, `remember_me` |
| `login_success` | Successful authentication | `method`, `time_to_login` |
| `login_failure` | Failed authentication | `error_type`, `attempt_count` |
| `logout` | User logged out | `session_duration`, `manual` |
| `register_attempt` | Registration form submitted | `source`, `marketing_consent` |
| `register_success` | Account created | `verification_method`, `time_to_complete` |

### Error Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `error_boundary` | React error boundary triggered | `component`, `error_type`, `user_action` |
| `api_error` | API request failed | `endpoint`, `status_code`, `retry_count` |
| `form_validation_error` | Form validation failed | `form_type`, `field`, `error_type` |

### Performance Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `slow_component_render` | Component took >100ms to render | `component`, `render_time`, `props_count` |
| `large_bundle_load` | Bundle size exceeded threshold | `bundle_name`, `size`, `load_time` |

### Engagement Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `session_start` | New session began | `user_agent`, `viewport`, `language`, `timezone` |
| `session_end` | Session terminated | `duration`, `last_activity`, `reason` |
| `feature_discovery` | User discovered new feature | `feature`, `method`, `time_to_discover` |
| `help_accessed` | Help/support accessed | `section`, `search_query`, `context` |

### Privacy Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `consent_updated` | Privacy consent changed | `settings`, `previous_settings`, `source` |
| `privacy_settings_viewed` | Privacy page accessed | `source`, `consent_status` |

## Data Privacy & Security

### PII Protection

The analytics system automatically sanitizes personally identifiable information:

- **Email addresses** → `[REDACTED]`
- **Credit card numbers** → `[REDACTED]`
- **SSN patterns** → `[REDACTED]`
- **IP addresses** → `[REDACTED]`
- **Sensitive form fields** → `[REDACTED]`

### Data Minimization

- Only collect data necessary for the specified purpose
- Automatically expire session data after 24 hours
- Remove detailed event data after 90 days (keep aggregates)
- Hash user identifiers for long-term storage

### Consent Management

- **Granular consent** for different data types
- **Opt-in by default** for non-essential analytics
- **Easy withdrawal** of consent at any time
- **Consent inheritance** for new features

## Implementation Architecture

### Client-Side Components

```typescript
// Core analytics class
class EnhancedAnalytics {
  private sessionId: string
  private userId?: string
  private consentSettings: ConsentSettings
  private eventBuffer: UserEvent[]
  
  // Main tracking methods
  trackEvent(name: EventName, properties?: Record<string, any>)
  trackPageView(path?: string)
  trackFeatureUsage(feature: string, action: string)
  trackComponentInteraction(component: string, action: string)
  updateConsent(settings: Partial<ConsentSettings>)
}

// React integration hooks
function useAnalytics() {
  return {
    trackEvent,
    trackPageView,
    trackFeatureUsage,
    trackComponentInteraction,
    updateConsent,
    getConsentSettings
  }
}
```

### Privacy Components

```typescript
// Consent management UI
<PrivacyConsent />      // Full privacy settings dialog
<ConsentBanner />       // Initial consent prompt

// Usage in components
const { trackEvent } = useAnalytics()
trackEvent(EVENT_MAP.CHANGE_THEME, { 
  from_theme: 'light', 
  to_theme: 'dark' 
})
```

### Analytics Dashboard

Internal dashboard for monitoring:

- **Real-time metrics** - Current active users, page views
- **User behavior** - Feature usage, user flows, retention
- **Performance monitoring** - Core Web Vitals, error rates
- **Conversion tracking** - Registration, engagement funnels

## Integration Points

### Component Tracking

```typescript
// Automatic component interaction tracking
const { trackComponentInteraction } = useAnalytics()

const handleButtonClick = () => {
  trackComponentInteraction('navigation-button', 'click', {
    location: 'header',
    destination: '/dashboard'
  })
}
```

### Form Analytics

```typescript
// Form completion tracking
const { trackEvent } = useAnalytics()

const handleFormSubmit = (formType: string, success: boolean) => {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', {
    form_type: formType,
    fields_completed: completedFields.length,
    time_to_complete: Date.now() - formStartTime
  })
}
```

### Performance Monitoring

```typescript
// Automatic performance tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Core Web Vitals automatically tracked
// Custom performance metrics
trackTiming('component_render', startTime, endTime)
```

## Backend Integration

### Event Processing

```python
# Expected backend endpoint structure
POST /api/v1/analytics
{
  "type": "custom",
  "data": {
    "name": "view_dashboard",
    "properties": {...},
    "timestamp": 1234567890,
    "sessionId": "session_123",
    "userId": "user_456"
  },
  "metadata": {...}
}
```

### Data Storage Schema

```sql
-- Events table structure
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  properties JSONB,
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE,
  page_path VARCHAR(500),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_name_timestamp ON analytics_events(event_name, timestamp);
CREATE INDEX idx_events_session ON analytics_events(session_id);
CREATE INDEX idx_events_user ON analytics_events(user_id);
```

## Configuration

### Environment Variables

```bash
# Analytics configuration
VITE_ANALYTICS_ENDPOINT=https://api.penguinx.com
VITE_ANALYTICS_DEBUG=false
VITE_ANALYTICS_BATCH_SIZE=50
VITE_ANALYTICS_FLUSH_INTERVAL=5000
```

### Build-time Configuration

```typescript
// Analytics build configuration
export const analyticsConfig = {
  enableInProduction: true,
  enableInDevelopment: true,
  batchSize: 50,
  flushInterval: 5000,
  enableWebVitals: true,
  enableErrorTracking: true,
  enableUserBehaviorTracking: true
}
```

## Testing & Validation

### Testing Strategy

1. **Unit tests** for analytics functions
2. **Integration tests** for event tracking
3. **E2E tests** for user consent flows
4. **Privacy compliance** validation

### Debugging Tools

```typescript
// Development mode logging
if (import.meta.env.NODE_ENV === 'development') {
  window.__PENGUIN_X_ANALYTICS__ = {
    viewEvents: () => console.table(eventBuffer),
    clearEvents: () => eventBuffer.length = 0,
    simulateEvent: (name, properties) => trackEvent(name, properties),
    getConsent: () => getConsentSettings()
  }
}
```

## Compliance & Legal

### GDPR Compliance

- ✅ Explicit consent for non-essential cookies
- ✅ Right to withdraw consent
- ✅ Right to data portability
- ✅ Right to erasure
- ✅ Data minimization
- ✅ Purpose limitation

### CCPA Compliance

- ✅ Clear privacy notices
- ✅ Opt-out mechanisms
- ✅ Non-discrimination policies
- ✅ Data deletion rights

### Security Measures

- 🔒 **Encryption in transit** (HTTPS)
- 🔒 **Encryption at rest** (Database encryption)
- 🔒 **Data anonymization** (Remove PII)
- 🔒 **Access controls** (Role-based access)
- 🔒 **Audit logging** (Access and modification logs)

## Future Enhancements

### Planned Features

1. **Real-time analytics** - WebSocket-based live updates
2. **Advanced segmentation** - User cohort analysis
3. **Predictive analytics** - ML-based user behavior prediction
4. **Cross-platform tracking** - Mobile app integration
5. **Advanced attribution** - Multi-touch attribution modeling

### Integration Roadmap

- [ ] Google Analytics 4 bridge (optional)
- [ ] Mixpanel integration (optional)
- [ ] Custom dashboard API
- [ ] Data warehouse export
- [ ] Real-time alerting system

---

*Last updated: Phase 16 Implementation*
*Version: 1.0.0*
*Maintainer: Penguin X Development Team*
