# User Journey Map: Create Individual Task
## UN-1 - Foundation Story - UX/UI Architecture

**Document Version:** 1.0  
**Created:** July 2, 2026  
**Story:** UN-1: Create individual task  
**User Persona:** Team Member  
**Primary Goal:** Break down project work into manageable task items  

---

## 📊 Primary User Flow: Happy Path

```mermaid
graph TD
    A["👤 User Visits Task List Page"]
    B["Click 'Create New Task' Button"]
    C["Task Create Form Displayed"]
    D["Enter Task Title"]
    E["(Optional) Enter Description"]
    F["(Optional) Select Due Date"]
    G{Form Valid?}
    H["Click 'Create Task' Button"]
    I["Form Shows Loading State"]
    J["Server Creates Task"]
    K["Server Returns 201 Created"]
    L["Success Toast: 'Task Created'"]
    M["Auto-Redirect to Task Detail"]
    N["✅ Task Created Successfully"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> H
    H --> G
    G -->|Yes| I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    G -->|No| C

    style A fill:#e1f5ff
    style N fill:#c8e6c9
    style C fill:#fff9c4
    style I fill:#ffe0b2
```

---

## 🔀 Alternative Flow: Validation Error Recovery

```mermaid
graph TD
    A["User Enters Invalid Data"]
    B{Validation Failed?}
    C["Display Error Message"]
    D["Highlight Invalid Field"]
    E["Show Error Details"]
    F["Field Focused for Edit"]
    G["User Corrects Input"]
    H["Error Clears in Real-Time"]
    I["Submit Form Again"]
    J["✅ Form Submitted Successfully"]
    
    A --> B
    B -->|Yes| C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style H fill:#c8e6c9
```

---

## 🌐 Browser-Based Flow: Authentication & Session

```mermaid
graph TD
    A["👤 User Accesses App"]
    B{Authenticated?}
    C["Redirect to Login"]
    D["User Logs In"]
    E["Session Created"]
    F["Redirect to Task List"]
    G["Task List Loaded"]
    H["User Clicks 'Create Task'"]
    I["Create Form Displayed"]
    J{Form Submitted?}
    K["Send POST to Server"]
    L["Server Validates Session"]
    M{Session Valid?}
    N["Create Task in Database"]
    O["Return Task with ID"]
    P["Update UI with New Task"]
    Q["Show Success Message"]
    R["✅ Task Created"]
    
    A --> B
    B -->|No| C
    C --> D
    D --> E
    E --> F
    B -->|Yes| F
    F --> G
    G --> H
    H --> I
    I --> J
    J -->|Yes| K
    K --> L
    L --> M
    M -->|No| C
    M -->|Yes| N
    N --> O
    O --> P
    P --> Q
    Q --> R
    
    style C fill:#ffcdd2
    style R fill:#c8e6c9
    style B fill:#fff9c4
    style M fill:#fff9c4
```

---

## 📱 Responsive Behavior Flow

```mermaid
graph TD
    A["Device Detects Screen Size"]
    B{Desktop / Tablet / Mobile?}
    C["Desktop: Full Form Layout"]
    D["Tablet: Stacked Form Layout"]
    E["Mobile: Single Column Form"]
    F["User Fills Form"]
    G["Submit Behavior Same"]
    H["Success Message Toast"]
    I["Redirect to Detail Page"]
    J["✅ Task Created"]
    
    A --> B
    B -->|Desktop| C
    B -->|Tablet| D
    B -->|Mobile| E
    C --> F
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    style C fill:#bbdefb
    style D fill:#bbdefb
    style E fill:#bbdefb
    style J fill:#c8e6c9
```

---

## ⏱️ Timeline Flow: Concurrent Submissions

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Fill form & click submit
    Browser->>Browser: Validate form client-side
    Browser->>Server: POST /api/tasks (title, desc, dueDate)
    Note over Browser: Form shows loading state
    Server->>Server: Validate request
    Server->>Database: Begin transaction
    Database->>Database: Create task record
    Database->>Database: Create audit log entry
    Database->>Server: Commit transaction
    Server->>Browser: 201 Created {task}
    Browser->>Browser: Show success toast
    Browser->>Browser: Redirect to /tasks/{id}
    User->>Browser: View created task
```

---

## 🔄 Error Handling Flow

```mermaid
graph TD
    A["User Submits Form"]
    B["Send to Server"]
    C{Server Response}
    D["400 Bad Request"]
    E["Validation Error"]
    F["Show Error Fields"]
    G["User Corrects"]
    H["Retry Submit"]
    
    I["401 Unauthorized"]
    J["Session Expired"]
    K["Redirect to Login"]
    
    L["500 Server Error"]
    M["Server Timeout"]
    N["Show Retry Button"]
    O["User Clicks Retry"]
    P["Retry Request"]
    
    Q["201 Created"]
    R["✅ Success"]
    
    A --> B
    B --> C
    C -->|400| D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> C
    
    C -->|401| I
    I --> J
    J --> K
    
    C -->|500| L
    L --> M
    M --> N
    N --> O
    O --> P
    P --> C
    
    C -->|201| Q
    Q --> R
    
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style I fill:#ffcdd2
    style L fill:#ffcdd2
    style Q fill:#c8e6c9
    style R fill:#c8e6c9
```

---

## 🎯 Task Creation State Machine

```mermaid
stateDiagram-v2
    [*] --> Empty
    
    Empty --> Filled: User enters title
    Filled --> FilledWithDesc: User adds description
    Filled --> FilledWithDate: User selects due date
    FilledWithDesc --> FilledComplete: User adds more fields
    FilledWithDate --> FilledComplete: User adds more fields
    FilledComplete --> FilledComplete: User edits fields
    
    FilledComplete --> Validating: User clicks submit
    Validating --> ValidationError: Invalid title/date
    ValidationError --> Filled: User corrects
    
    Validating --> Submitting: Validation passed
    Submitting --> ServerError: Network/server error
    ServerError --> Validating: User retries
    
    Submitting --> Success: Task created
    Success --> Redirecting: Show success toast
    Redirecting --> [*]
    
    Note right of Empty
        Form empty
        Submit disabled
    End Note
    
    Note right of FilledComplete
        Form ready
        Submit enabled
    End Note
    
    Note right of Validating
        Client validation
        Check title, date
    End Note
    
    Note right of Submitting
        POST request
        Server validation
        Database write
    End Note
    
    Note right of Success
        ✅ Task created
        Show toast 2s
    End Note
```

---

## 🎨 UI State Transitions

### Form States
```mermaid
graph TD
    A["EMPTY STATE"]
    B["FILLED STATE"]
    C["INVALID STATE"]
    D["VALIDATING STATE"]
    E["SUBMITTING STATE"]
    F["SUCCESS STATE"]
    G["ERROR STATE"]
    
    A -->|User enters title| B
    B -->|User clears title| A
    B -->|User enters invalid data| C
    C -->|User corrects data| B
    B -->|User clicks submit| D
    D -->|Validation failed| C
    D -->|Validation passed| E
    E -->|Task created| F
    E -->|Network error| G
    G -->|User clicks retry| D
    F -->|Auto-redirect| A
    
    style A fill:#f5f5f5
    style B fill:#fff9c4
    style C fill:#ffcdd2
    style D fill:#ffe0b2
    style E fill:#ffe0b2
    style F fill:#c8e6c9
    style G fill:#ffcdd2
```

---

## 📋 Field Validation Rules

```mermaid
graph LR
    A["Title Field"]
    B{Rules}
    C["✓ Required"]
    D["✓ 1-255 chars"]
    E["✓ Alphanumeric + special chars"]
    F["✓ Trimmed on submit"]
    
    G["Description Field"]
    H{Rules}
    I["✓ Optional"]
    J["✓ Markdown syntax allowed"]
    K["✓ Max 5000 chars"]
    L["✓ Real-time preview"]
    
    M["Due Date Field"]
    N{Rules}
    O["✓ Optional"]
    P["✓ Must be future date"]
    Q["✓ ISO8601 format"]
    R["✓ Date picker UI"]
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    
    M --> N
    N --> O
    N --> P
    N --> Q
    N --> R
    
    style A fill:#bbdefb
    style G fill:#bbdefb
    style M fill:#bbdefb
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#c8e6c9
    style F fill:#c8e6c9
```

---

## 🎯 Accessibility Flow: Keyboard Navigation

```mermaid
graph TD
    A["Tab: Focus Title Field"]
    B["Type: Enter Title Text"]
    C["Tab: Focus Description Field"]
    D["Type/Ctrl+B: Format Text"]
    E["Tab: Focus Due Date Field"]
    F["Space/Enter: Open Date Picker"]
    G["Arrow Keys: Select Date"]
    H["Tab: Focus Submit Button"]
    I["Enter: Submit Form"]
    J["Tab: Focus Cancel Button"]
    K["Enter: Cancel and Close"]
    L["Shift+Tab: Navigate Backwards"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    J --> K
    I --> L
    L --> A
    
    style I fill:#c8e6c9
    style K fill:#ffcdd2
```

---

## 📊 User Journey Metrics

### Successful Path Metrics
- **Time to Fill Form:** 30-60 seconds (average)
- **Time to Submit:** 2-5 seconds
- **Server Processing:** <200ms (p95)
- **Redirect Time:** <500ms
- **Total Flow Duration:** 35-65 seconds

### Error Path Metrics
- **Error Detection:** <100ms (client-side)
- **Error Display:** <50ms
- **User Correction:** 10-30 seconds
- **Retry Attempt:** <5 seconds
- **Total Error Recovery:** 15-40 seconds

### Accessibility Metrics
- **Keyboard Navigation:** All fields accessible
- **Screen Reader Support:** All labels announced
- **Color Contrast:** WCAG 2.1 AA compliant
- **Focus Indicators:** Visible on all interactive elements

---

## 🎬 Wireframe Files Generated

The following wireframe HTML files have been generated in `/wireframes`:

1. **001-task-list-page.html** - Task list with "Create Task" button
2. **002-create-form-empty.html** - Empty form state
3. **003-create-form-filled.html** - Filled form ready to submit
4. **004-create-form-validation-error.html** - Form with validation errors
5. **005-create-form-loading.html** - Form in loading state
6. **006-success-toast.html** - Success notification component
7. **007-task-detail-page.html** - Created task detail view
8. **008-responsive-mobile.html** - Mobile responsive layout
9. **009-responsive-tablet.html** - Tablet responsive layout
10. **010-date-picker-popup.html** - Date picker component

---

## 🎨 Design System Integration

### Color Palette
- **Primary Action:** #1976D2 (Blue)
- **Success State:** #388E3C (Green)
- **Error State:** #D32F2F (Red)
- **Warning State:** #F57C00 (Orange)
- **Background:** #FFFFFF (White)
- **Text Primary:** #212121 (Dark Gray)
- **Text Secondary:** #757575 (Gray)
- **Disabled:** #BDBDBD (Light Gray)
- **Borders:** #E0E0E0 (Light Gray)

### Typography
- **Headline:** Manrope, 20px, Bold
- **Label:** Manrope, 14px, Regular
- **Body:** Manrope, 14px, Regular
- **Helper Text:** Manrope, 12px, Regular

### Spacing
- **Padding Input:** 12px 16px
- **Gap Between Fields:** 16px
- **Button Height:** 40px
- **Form Width:** max 600px

### Components Used
- Text Input Fields
- Textarea (Markdown editor)
- Date Picker
- Primary/Secondary Buttons
- Toast Notification
- Loading Spinner
- Error Messages
- Helper Text

---

## ✅ Validation Feedback UX

### Real-Time Validation (As User Types)
- Title field: Character count (0/255)
- Title field: "Required" error if empty on blur
- Title field: "Too long" error if >255 chars
- Description: Markdown preview on right side
- Due Date: "Must be future date" error if invalid

### On Submit Validation
- All required fields checked
- All field formats validated
- Date comparison (due date > today)
- Submit button disabled during request
- Optimistic UI update (task appears in list)

### Error Messages
- **Required Field:** "This field is required"
- **Invalid Format:** "Please enter a valid {field name}"
- **Too Long:** "Must be 255 characters or less"
- **Invalid Date:** "Please select a future date"
- **Network Error:** "Unable to save. Please try again."
- **Server Error:** "Something went wrong. Please try again."

---

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Form Rendering:** <100ms
- **Input Validation:** <50ms per keystroke
- **Markdown Preview:** Debounced 300ms
- **Submit Debounce:** Prevent double-submit
- **Optimistic UI:** Instant feedback

### Backend Optimizations
- **Database Transaction:** Atomic operation
- **Indexing:** On owner, status fields
- **Caching:** Audit log batched writes
- **Response Time:** <200ms (p95)

### Network Optimizations
- **Minified Requests:** JSON payloads <5KB
- **Compression:** gzip enabled
- **Connection Reuse:** Keep-alive
- **Retry Logic:** Exponential backoff

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
- Form side by side with preview
- Full width textarea
- Inline date picker
- Wide submit button

### Tablet (768px - 1023px)
- Stacked form layout
- Full width fields
- Modal date picker
- Full width buttons

### Mobile (< 768px)
- Single column layout
- Full width fields
- Bottom sheet date picker
- Bottom sheet keyboard
- Full height buttons

---

## ♿ Accessibility Compliance

### WCAG 2.1 Level AA
- ✅ Proper label associations (for/id)
- ✅ ARIA attributes (aria-required, aria-invalid)
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Color contrast ≥4.5:1
- ✅ Error messages associated with fields
- ✅ Form instructions provided
- ✅ Submit button clearly labeled

### Screen Reader Support
- ✅ Form landmark: `<form role="form">`
- ✅ Fieldset for grouping: `<fieldset>`
- ✅ Legend for form instructions
- ✅ Input labels: `<label for="id">`
- ✅ Error messages announced: `aria-describedby`
- ✅ Loading state announced: `aria-busy="true"`
- ✅ Success toast announced: `role="status"`

---

## 🎯 Key Interaction Patterns

### Primary CTA (Create Task Button)
- **State:** Enabled when title provided
- **Hover:** Background darkens
- **Active:** Background darker
- **Disabled:** Gray, cursor not-allowed
- **Loading:** Shows spinner, text disappears

### Input Field Behavior
- **Focus:** Border color changes to primary
- **Error:** Border color changes to red
- **Valid:** Border color changes to green
- **Disabled:** Grayed out, cursor not-allowed
- **Placeholder:** Visible only when empty

### Form Validation Feedback
- **Real-time:** On blur (after user leaves field)
- **Inline:** Below each field
- **Contextual:** Explains what's wrong
- **Actionable:** Shows what to fix
- **Color-coded:** Red for error, green for valid

---

## 🔄 Microinteractions

1. **Button Hover:** Subtle shadow increase
2. **Field Focus:** Border color animation (200ms)
3. **Success Toast:** Slide in from top (300ms)
4. **Error Shake:** Field shake animation (500ms)
5. **Loading Spinner:** Rotating animation
6. **Character Counter:** Updates in real-time
7. **Markdown Preview:** Smooth preview update
8. **Date Picker:** Dropdown slide animation

---

## 📊 Success Criteria

- ✅ Form renders in <100ms
- ✅ Validation feedback in <50ms
- ✅ Submit request in <5s (user-perceived)
- ✅ Task creation in <200ms (server)
- ✅ Redirect in <500ms
- ✅ All interactions keyboard accessible
- ✅ All colors meet contrast requirements
- ✅ Responsive on all device sizes
- ✅ Works with/without JavaScript
- ✅ Works with all modern browsers

---

## 📚 Reference Links

- **JIRA Story:** https://jitenderlnu.atlassian.net/browse/UN-1
- **Prisma Schema:** See SPRINT_1_UN_1_WORKSPACE.md
- **API Specification:** See SPRINT_1_UN_1_WORKSPACE.md
- **Design System:** DataDog dark mode compatible

---

**Document Status:** Complete ✅  
**Wireframes Generated:** 10 HTML files  
**User Flows Documented:** 7 Mermaid diagrams  
**Ready for Development:** Yes

*UX/UI Architecture Complete - Ready for Frontend Implementation*
