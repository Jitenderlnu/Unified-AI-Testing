# Sprint 1 - Story UN-1 Development Workspace
## Create Individual Task - Foundation Story

**Date Initialized:** July 2, 2026  
**Developer Mode:** Active  
**Context Window:** Clean slate - Project setup archived

---

## 📌 Story Details

### Story: UN-1: Create individual task
**JIRA Link:** https://jitenderlnu.atlassian.net/browse/UN-1  
**Milestone:** Phase 1 Sprint 1 (Foundation)  
**Priority:** Highest (Critical Blocker - 9 stories depend on this)  
**Story Points:** 5  
**Complexity:** Medium  
**Estimated Effort:** 5.5 hours  
**Tech Stack:** React (Frontend) | Node.js + Express (Backend) | SQLite + Prisma (Database)

---

## 🎯 User Story

### As a team member, I want to create a task with title, description, and metadata so that I can break down project work into manageable items.

---

## ✅ Acceptance Criteria

1. **UI Form Design**
   - Form captures: title (required, max 255 chars), description (optional, markdown support), due date
   - Form shows validation feedback in real-time
   - Submit button disabled until title is provided

2. **Data Persistence**
   - Task created in database with status = "Not Started"
   - assignee field initialized as null
   - Creator automatically set as task owner
   - Timestamps recorded: created_at, updated_at
   - Optimistic lock version timestamp set for concurrent edit prevention

3. **User Feedback**
   - Success toast message displayed ("Task created: {title}")
   - User automatically redirected to task detail page
   - Task appears in task list immediately (optimistic update)

4. **Validation**
   - Server validates all required fields
   - Title validation: non-empty, max 255 characters, alphanumeric + special chars allowed
   - Description validation: optional, markdown syntax allowed
   - Due date validation: must be future date if provided
   - Returns 400 Bad Request with specific error messages for invalid input

5. **Data Integrity**
   - Prisma transaction ensures atomicity (all or nothing)
   - Concurrent edge case: optimistic lock timestamp prevents race conditions
   - Audit log entry created for task creation event

6. **Edge Cases Handled**
   - User not authenticated → redirect to login
   - User loses connection during submit → retry with exponential backoff
   - Server timeout during task creation → client-side timeout error (5 seconds)
   - Duplicate submission prevention → frontend disable submit on click

---

## 🏗️ Architecture & Design

### Frontend Component Structure
```
TaskCreatePage/
├── TaskForm/
│   ├── TitleField (required, 255 char limit)
│   ├── DescriptionField (optional, markdown editor)
│   ├── DueDateField (optional, date picker)
│   ├── FormActions (Submit, Cancel)
│   └── ValidationDisplay (real-time feedback)
├── SuccessNotification (toast message)
└── RedirectToDetail (post-submit behavior)
```

### Backend API Endpoint
```
POST /api/tasks
Content-Type: application/json

Request Body:
{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional, markdown)",
  "dueDate": "ISO8601 date (optional, future date)"
}

Response 201 Created:
{
  "id": "UUID",
  "title": "string",
  "description": "string",
  "dueDate": "ISO8601 date",
  "status": "Not Started",
  "assignee": null,
  "owner": "current_user",
  "version": 1,
  "created_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp"
}

Response 400 Bad Request:
{
  "errors": {
    "title": "Title is required",
    "description": "Description must be valid markdown",
    "dueDate": "Due date must be in the future"
  }
}

Response 401 Unauthorized:
{
  "error": "Authentication required"
}

Response 500 Server Error:
{
  "error": "Failed to create task, please retry"
}
```

### Database Schema (Prisma)
```prisma
model Task {
  id            String      @id @default(cuid())
  title         String      @db.VarChar(255)
  description   String?     @db.Text
  dueDate       DateTime?
  status        String      @default("Not Started")
  assignee      String?     @db.VarChar(255)
  owner         String      @db.VarChar(255)
  version       Int         @default(1)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([status])
  @@index([owner])
  @@index([assignee])
  @@map("tasks")
}

model AuditLog {
  id            String      @id @default(cuid())
  taskId        String      @db.VarChar(255)
  action        String      @db.VarChar(50)
  user          String      @db.VarChar(255)
  timestamp     DateTime    @default(now())
  changes       Json?

  @@index([taskId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

---

## 🔧 Technical Implementation Notes

### Frontend (React)
- **Form Validation:** React Hook Form + Zod schema validation
- **Markdown Editor:** react-markdown + remark plugins
- **Date Picker:** @react-aria for accessible date input
- **Toast Notifications:** react-hot-toast for success/error messages
- **HTTP Client:** axios with retry interceptor
- **State Management:** React Query for server state
- **Styling:** CSS custom properties for dark mode (DataDog compatibility)

### Backend (Node.js + Express)
- **Validation:** joi or zod for request validation
- **Database ORM:** Prisma for type-safe queries
- **Transaction:** Prisma transaction wrapper for atomicity
- **Error Handling:** Custom error middleware
- **Logging:** Winston for audit trail
- **Authentication:** JWT middleware (optional verify scope)
- **Rate Limiting:** Express rate-limit middleware (10 requests/min per user)

### Database (SQLite + Prisma)
- **Connection Pool:** sqlite3 with connection pooling
- **Migrations:** Prisma migrations for schema versioning
- **Indexes:** On status, owner, assignee for query performance
- **Transactions:** Prisma.$transaction() for atomicity guarantee

### Key Design Decisions

**Decision 1: Optimistic Locking**
- Use version timestamp to prevent concurrent edit conflicts
- Recommended pattern: JIRA-style optimistic locking
- Conflict resolution: Client retries with latest version

**Decision 2: Audit Trail**
- Every task creation logged to audit_logs table
- Includes: user, action, timestamp, changes
- Enables compliance and debugging

**Decision 3: Validation Strategy**
- Client-side: Real-time feedback (UX)
- Server-side: Authoritative validation (security)
- Both layers validate independently

**Decision 4: Redirect Pattern**
- Post-submit: User sees task detail page immediately
- Prevents accidental re-submission
- Shows task in context (edit, view, delete)

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
```javascript
// Frontend Component Tests
- Test form renders with all fields
- Test title validation (required, max 255 chars)
- Test description markdown rendering
- Test due date picker functionality
- Test submit button disabled until title provided
- Test success toast message display
- Test error messages for validation failures
- Test loading state during submission
- Test cancel button behavior

// Backend API Tests
- Test POST /api/tasks with valid payload
- Test POST /api/tasks with missing title
- Test POST /api/tasks with title > 255 chars
- Test POST /api/tasks with invalid due date (past)
- Test POST /api/tasks with malformed JSON
- Test 401 Unauthorized (no auth token)
- Test 500 Server Error handling
- Test concurrent submissions (race condition)

// Database Tests
- Test Prisma create() transaction
- Test automatic audit log entry creation
- Test default values (status, version, timestamps)
- Test index queries (by owner, status)
```

### Integration Tests
```
- E2E flow: Form fill → Submit → Detail page
- Network failure: Retry mechanism
- Concurrent submission: Optimistic locking
- Cross-browser: Chrome, Firefox, Safari
```

### Performance Benchmarks
- Form render time: < 100ms
- API response time: < 200ms (p95)
- Database write time: < 50ms (p95)
- Toast notification display: < 50ms

---

## 🎨 Design Ideation: UI Mockup

### Task Create Page Layout
```
┌─────────────────────────────────────────────────────────┐
│  📋 Create New Task                              [← Back] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Title *                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Enter task title (max 255 characters)             │  │
│  │                                        (0/255)    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Description                                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ **Bold** _italic_ `code`                         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Add detailed description (optional)              │  │
│  │                                                  │  │
│  │                                                  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Due Date (optional)                                    │
│  ┌──────────────────┐                                   │
│  │ 📅 2026-07-15   │                                   │
│  └──────────────────┘                                   │
│                                                          │
│  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │ ✓ Create Task (Primary) │  │ Cancel (Secondary)   │ │
│  └─────────────────────────┘  └──────────────────────┘ │
│                                                          │
│  💡 Tip: You can edit the task after creation          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Form Validation States
```
EMPTY STATE:
  Title field: unfocused, empty
  Submit button: Disabled (grayed out)
  Error message: None

FILLED STATE:
  Title: "Implement user authentication" (valid)
  Submit button: Enabled (blue)
  Error message: None

ERROR STATE:
  Title: "Implement user auth system but this title is way too long and exceeds the 255 character limit and should trigger validation error"
  Error: "❌ Title must be 255 characters or less"
  Submit button: Disabled
  Field highlight: Red border

LOADING STATE:
  Submit button: "Creating..." (spinner)
  Form fields: Disabled
  Cancel button: Disabled
```

### Success Flow
```
1. User fills form and clicks "Create Task"
2. Client-side validation passes
3. Submit button shows spinner "Creating..."
4. POST request sent to server
5. Server validates and creates task in DB
6. Server returns 201 Created with task data
7. Success toast appears: "✅ Task created: Implement user authentication"
8. Auto-redirect to task detail page (UN-1 detail view)
9. User sees task with status "Not Started", owner = current user
```

---

## 🚀 Development Workflow

### Step 1: Database Setup (Backend)
- [ ] Create Prisma migration for Task and AuditLog models
- [ ] Run migration: `prisma migrate dev --name init`
- [ ] Seed test data (optional)

### Step 2: API Implementation (Backend)
- [ ] Create POST /api/tasks endpoint
- [ ] Implement request validation (joi/zod)
- [ ] Implement Prisma transaction for atomicity
- [ ] Add error handling and logging
- [ ] Unit tests for all edge cases

### Step 3: Frontend Implementation (React)
- [ ] Create TaskCreatePage component
- [ ] Implement TaskForm with validation
- [ ] Add markdown editor for description
- [ ] Implement date picker for due date
- [ ] Add success toast notification
- [ ] Implement redirect to detail page
- [ ] Unit tests for form behavior

### Step 4: Integration Testing
- [ ] E2E test: Form fill → Submit → Detail page
- [ ] Test error scenarios (validation, network)
- [ ] Test concurrent submissions
- [ ] Performance testing

### Step 5: Code Review & Merge
- [ ] Self-review code quality
- [ ] Request peer review (1+ approval)
- [ ] Address feedback
- [ ] Merge to main branch
- [ ] Verify CI/CD pipeline passes

---

## 📊 Estimation Breakdown

| Component | Estimated Effort | Risk |
|-----------|------------------|------|
| Database Schema Design | 0.5 hours | Low |
| Prisma Migration | 0.5 hours | Low |
| API Endpoint Implementation | 2 hours | Low |
| API Request Validation | 1 hour | Low |
| Frontend Component | 1.5 hours | Low |
| Form Validation | 1 hour | Low |
| Testing (Unit + Integration) | 2 hours | Medium |
| Code Review & Refinement | 1 hour | Low |
| **Total** | **9 hours** | **~5.5h planned** |

---

## 🔗 Dependencies & Blockers

### No Blocking Dependencies
✅ UN-1 is the foundation story - **no blockers**

### Stories This Blocks
⚠️ **CRITICAL PATH:**
- UN-2: Priority levels (depends on task creation)
- UN-3: Status workflow (depends on task model)
- UN-4: Assign tasks (depends on task creation)
- UN-5: Update status (depends on task model)
- UN-6: Blocked notifications (depends on status)
- UN-7: Dependency DAG (depends on task linking)
- UN-8: Bulk CSV import (depends on task creation)
- UN-4: Assign tasks
- UN-1.1: Create task (this story)

All 8 Phase 1 stories depend on this foundation.

---

## 🎯 Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] Code reviewed and approved (1+ reviewer)
- [ ] No ESLint errors
- [ ] No TypeScript type errors
- [ ] Database migration tested
- [ ] API endpoint documented
- [ ] Frontend component documented
- [ ] Performance benchmarks met
- [ ] Accessibility (WCAG 2.1 AA) verified
- [ ] Security validation (OWASP) passed
- [ ] Merged to main branch
- [ ] CI/CD pipeline passing

---

## 📚 Reference Materials

### Configuration
- **Project Config:** `configuration.json` (27 properties)
- **Tech Stack:** React, Node.js, SQLite, Prisma
- **Database:** SQLite with Prisma ORM
- **API Framework:** Express.js

### Documentation
- **Architecture:** See `Dependency_Map.json`
- **Backlog:** See `Estimated_Backlog.json`
- **Requirements:** See `Polished_BRD.md` (US-3.1.1)

### Database Setup
```bash
# Install dependencies
npm install

# Create migration
npx prisma migrate dev --name init

# Open Prisma Studio (optional)
npx prisma studio
```

### Development Server
```bash
# Start dev server with hot reload
npm run dev

# Run tests with watch mode
npm test -- --watch

# Run linter
npm run lint

# Build for production
npm run build
```

---

## ✨ Ready to Code

**Workspace initialized.** All context cleared. Ready to begin design ideation and implementation of UN-1: Create individual task.

**Next steps:**
1. ✅ Review acceptance criteria
2. ✅ Design database schema
3. ✅ Design API contract
4. ✅ Design UI mockup
5. → Begin implementation

---

**Status:** 🟢 Ready for Development  
**Blocker Status:** ✅ No blockers  
**Critical Path:** ⭐ Foundation story  
**Dependency Impact:** Blocks 8 other Phase 1 stories

---

*Workspace initialized for Agile Developer - Sprint 1 Kickoff*
