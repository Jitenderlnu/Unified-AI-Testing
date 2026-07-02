# Polished Business Requirements Document
## Task Management Module - Refined Scope

**Document Version:** 2.0 (Polished)  
**Created:** July 2, 2026  
**Role:** Technical Product Manager  
**Process:** INVEST-Based Requirements Refinement  
**Status:** Ready for Sprint Planning

---

## Executive Summary

This refined BRD critiques and enhances the original Task Management module requirements through technical feasibility analysis and INVEST criteria application. The original 8 requirements have been analyzed, decomposed, and re-scoped for realistic delivery within our tech stack constraints.

**Key Changes:**
- ✅ 8 original requirements analyzed against INVEST criteria
- ⚠️ 4 requirements FAILED initial INVEST criteria (too large/vague)
- ✅ Decomposed into 16 deliverable, testable user stories
- 🔧 Technical constraints mapped and documented
- 📊 Realistic phased delivery plan provided

---

## Technical Context & Constraints

### Tech Stack Summary
```
Frontend:       React (HTML, CSS, JavaScript)
Backend:        Node.js with Express
Database:       SQLite with Prisma ORM
API:            RESTful JSON
Testing:        Jest + React Testing Library
Observability:  DataDog monitoring
Deployment:     GitHub Actions CI/CD
```

### Key Technical Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| **SQLite Database** | Single-writer limitation; not ideal for high-concurrency writes | Implement optimistic locking for task updates; queue write operations |
| **React Frontend** | Requires real-time updates via polling or websockets | Phase 1: Polling (24h refresh window). Phase 2: Consider WebSocket for live collaboration |
| **File Attachments (100MB)** | SQLite blobs problematic at scale; file storage needed | Use external file storage (S3-compatible); store references in DB |
| **Automatic Dependency Timeline Adjustment** | Complex cascade logic needed | Implement event-driven updates; queue-based processing; NOT real-time |
| **Team Collaboration at Scale** | Concurrent edits cause conflicts | Implement conflict resolution strategy in Phase 2 |
| **Performance @ Scale** | 356 dependencies in DB; N+1 query risk | Pagination required; filtering mandatory; aggregate queries optimized |

---

## Requirements Analysis: INVEST Criteria Application

### INVEST Criteria Definitions
- **I (Independent):** Self-contained, minimal dependencies on other stories
- **N (Negotiable):** Scope can be adjusted without breaking delivery
- **V (Valuable):** Clear user value or enables other work
- **E (Estimable):** Team can reasonably estimate effort
- **S (Small):** Completable within 1-2 sprints (3-13 story points)
- **T (Testable):** Clear acceptance criteria; can be verified

### Original Requirements Assessment

#### ❌ FR-3.1: Create/assign/update tasks (FAILS "Small" & "Estimable")
**Issues:**
- Too large (4 distinct features bundled)
- Vague: "bulk task creation" undefined
- "Quick-add" functionality not scoped
- **Estimated Size:** 20-30 SP (unrealistic for 1 sprint)

**Decomposition:** ✅ Split into 4 user stories
1. US-3.1.1: Create individual task with basic fields
2. US-3.1.2: Assign task to single/multiple team members
3. US-3.1.3: Update task status and progress percentage
4. US-3.1.4: Bulk task creation from CSV or quick-add UI

---

#### ⚠️ FR-3.2: Task dependencies (FAILS "Estimable" & "Small")
**Issues:**
- "Automatically adjust timelines" is vague and complex
- What if circular dependencies exist?
- Cascade behavior undefined (transitive dependencies?)
- Real-time vs. eventual consistency not specified
- **Estimated Size:** 25-35 SP (very complex domain logic)

**Decomposition:** ✅ Split into 3 user stories (Phase 2+)
1. US-3.2.1: Define dependency relationships (Phase 1)
2. US-3.2.2: Validate circular dependencies; prevent invalid graphs
3. US-3.2.3: Calculate timeline impacts on dependent tasks (Phase 2)

---

#### ✅ FR-3.3: Priority levels (PASSES most criteria; minor refinements)
**Issues:**
- "Visual indicators" needs design specification
- No conflict resolution if priority changed post-assignment
- **Estimated Size:** 5-8 SP (acceptable)

**Refined:** 1 user story with explicit acceptance criteria
- US-3.3.1: Implement priority levels with visual indicators

---

#### ✅ FR-3.4: Status workflow (PASSES most criteria)
**Issues:**
- "Blocked" notification scope undefined (who gets notified? how?)
- Transition rules not specified (can any user transition any task?)
- **Estimated Size:** 8-13 SP (acceptable but boundary case)

**Refined:** 2 user stories
- US-3.4.1: Implement 5-status workflow with state machine validation
- US-3.4.2: Implement "Blocked" status notifications to assigned PMs

---

#### ⚠️ FR-3.5: Subtasks and checklists (FAILS "Small" & "Testable")
**Issues:**
- "Completion percentage" calculation algorithm undefined
- If subtask deleted, what happens to completion %?
- Nesting depth unlimited? (performance risk)
- **Estimated Size:** 13-18 SP

**Decomposition:** ✅ Split into 2 user stories (Phase 2)
1. US-3.5.1: Create subtasks; manual progress tracking
2. US-3.5.2: Implement automatic completion percentage calculation

---

#### ✅ FR-3.6: Time tracking (PASSES criteria with caveats)
**Issues:**
- No data model for time log entries specified
- "Compare against estimates" - what format? (CSV, chart, dashboard?)
- Billing data export not mentioned but implied
- **Estimated Size:** 10-15 SP

**Refined:** 2 user stories
- US-3.6.1: Log actual hours; store time tracking entries
- US-3.6.2: Display time logs vs. estimates; basic reporting

---

#### ⚠️ FR-3.7: File attachments (FAILS "Small" for scope + compliance)
**Issues:**
- "100MB" limit exceeds reasonable in-DB blob storage (SQLite limit ~2GB total)
- "Version control" not scoped (Git-like diffs? Simple replace?)
- Security implications: scan for malware? Validate MIME types?
- **Estimated Size:** 15-20 SP (includes file storage setup)

**Decomposition:** ✅ Split into 3 user stories
1. US-3.7.1: Attach files; store in external storage (S3-compatible); basic metadata
2. US-3.7.2: Implement file versioning (previous versions accessible)
3. US-3.7.3: File security: MIME validation, size limits, virus scanning (Phase 2)

---

#### ✅ FR-3.8: Comments and @mentions (PASSES most criteria)
**Issues:**
- "Threaded discussions" means hierarchical replies or flat list?
- @mention autocomplete performance at scale?
- Notification delivery mechanism not specified (email? in-app? both?)
- **Estimated Size:** 12-15 SP

**Refined:** 2 user stories
- US-3.8.1: Add comments to tasks; threaded discussion UI
- US-3.8.2: Implement @mentions; send notifications to mentioned users

---

## Refined Backlog: INVEST-Compliant User Stories

### Phase 1: Minimum Viable Product (Sprints 1-2)
**Goal:** Core task management workflow  
**Estimated Capacity:** ~40-50 SP

#### Story Group: Task Lifecycle (10 stories)

**US-3.1.1: Create individual task** (5 SP)
- **Priority:** Critical
- **Actor:** Team member
- **Scenario:**
  ```
  As a team member,
  I want to create a task with title, description, and metadata
  So that I can break down project work into manageable items
  ```
- **Acceptance Criteria:**
  - ✅ UI form captures: title (required, max 255 chars), description (optional, markdown), due date
  - ✅ Task created in DB with status=Not Started, assignee=null
  - ✅ Creator set as task owner
  - ✅ Success message shown; user redirected to task detail
  - ✅ Server validates all fields; returns 400 on invalid input
  - ✅ Optimistic lock timestamp set (for concurrent edit prevention)
- **Testable:** Jest tests for API + React component tests
- **Estimable:** UI form + simple POST endpoint
- **Technical Notes:** Use Prisma transaction for atomicity

---

**US-3.1.2: Assign task to team members** (5 SP)
- **Priority:** Critical
- **Actor:** Project manager
- **Scenario:**
  ```
  As a project manager,
  I want to assign a task to one or more team members
  So that team knows who is responsible for completion
  ```
- **Acceptance Criteria:**
  - ✅ Task detail shows "Assigned To" field (multi-select)
  - ✅ Only users with project access shown in dropdown
  - ✅ Add/remove assignees without editing other fields
  - ✅ Audit log tracks who assigned the task and when
  - ✅ Notification sent to newly assigned users (email + in-app)
  - ✅ Cannot assign to deleted/inactive users
- **Testable:** Jest test for assignment logic + audit trail
- **Estimable:** UI dropdown + PATCH endpoint
- **Technical Notes:** Use event-driven notifications (queue-based)

---

**US-3.1.3: Update task status and progress** (5 SP)
- **Priority:** Critical
- **Actor:** Task assignee
- **Scenario:**
  ```
  As a task assignee,
  I want to update task status and progress percentage
  So that team visibility of task completion increases
  ```
- **Acceptance Criteria:**
  - ✅ Status dropdown shows valid transitions (Not Started → In Progress → Review → Completed, or Blocked)
  - ✅ Progress percentage field (0-100) updates completion indicator
  - ✅ Changing to "Completed" auto-calculates from subtasks (if exist) OR allows manual 100%
  - ✅ Optimistic lock prevents concurrent modification conflicts
  - ✅ Status change triggers notifications to task watchers
  - ✅ Cannot skip statuses (must follow workflow state machine)
- **Testable:** Jest test for state machine + race condition test
- **Estimable:** Status machine logic + PATCH endpoint
- **Technical Notes:** Implement state machine pattern; validate transitions server-side

---

**US-3.1.4: Bulk task creation from CSV** (8 SP)
- **Priority:** High
- **Actor:** Project manager
- **Scenario:**
  ```
  As a project manager,
  I want to import multiple tasks from CSV at once
  So that I can set up project from templates or exports
  ```
- **Acceptance Criteria:**
  - ✅ CSV upload accepts: title, description, dueDate, assignee (email), priority
  - ✅ Validate all rows before insert (all-or-nothing transaction)
  - ✅ Show import preview with validation errors highlighted
  - ✅ Create up to 100 tasks per import (rate limiting)
  - ✅ Success report shows created task IDs
  - ✅ Reject on: missing title, invalid email, malformed CSV
- **Testable:** CSV parser + transaction tests
- **Estimable:** CSV parsing + batch insert logic
- **Technical Notes:** Use streaming for large files; validate before transaction

---

#### Story Group: Task Discovery & Priority (3 stories)

**US-3.3.1: Implement priority levels with visual indicators** (5 SP)
- **Priority:** Critical
- **Actor:** Team member
- **Scenario:**
  ```
  As a team member viewing my task list,
  I want to see priority levels with color/icon indicators
  So that I can focus on high-priority work first
  ```
- **Acceptance Criteria:**
  - ✅ Priority field: Critical (red), High (orange), Medium (yellow), Low (gray)
  - ✅ Priority icon visible in task list + detail view
  - ✅ Filter tasks by priority (AND/OR logic)
  - ✅ Sort tasks by priority (Critical first)
  - ✅ Default priority: Medium
  - ✅ Only project managers can change priority
- **Testable:** Jest tests for priority UI + filtering logic
- **Estimable:** Enum + UI components
- **Technical Notes:** Use CSS custom properties for color theming (DataDog dark mode compatible)

---

**US-3.4.1: Implement 5-status workflow with state machine** (8 SP)
- **Priority:** Critical
- **Actor:** Task assignee / PM
- **Scenario:**
  ```
  As a task assignee,
  I want to move tasks through a defined workflow
  So that project managers have visibility of progress
  ```
- **Acceptance Criteria:**
  - ✅ Valid statuses: Not Started → In Progress → Review → Completed (or Blocked at any time)
  - ✅ Only assignee or PM can change status
  - ✅ Status field shows current state + timestamp of last change
  - ✅ Invalid transitions rejected (e.g., can't go from Review to Not Started)
  - ✅ State change logged for audit trail
  - ✅ Task list filterable by status
  - ✅ Dashboard shows count by status
- **Testable:** Jest test for state machine validation
- **Estimable:** State machine pattern + PATCH endpoint
- **Technical Notes:** Implement as enum-based validation; consider temporal tracking for Gantt chart

---

**US-3.4.2: "Blocked" status notifications** (5 SP)
- **Priority:** High
- **Actor:** Project manager
- **Scenario:**
  ```
  As a project manager,
  I want to be notified when a task is marked "Blocked"
  So that I can unblock dependencies quickly
  ```
- **Acceptance Criteria:**
  - ✅ When task status set to "Blocked", send notification to task owner + PM
  - ✅ Notification includes task title + reason (optional reason field)
  - ✅ In-app notification badge shows count of blocked tasks
  - ✅ Blocked tasks surfaced in PM dashboard
  - ✅ Can set up email/Slack integration for critical tasks (Phase 2)
- **Testable:** Jest test for notification trigger
- **Estimable:** Event handler + notification queue
- **Technical Notes:** Use pub/sub pattern; integrate with DataDog alerts

---

#### Story Group: Task Dependencies (1 story)

**US-3.2.1: Define dependency relationships** (8 SP)
- **Priority:** High
- **Actor:** Project manager
- **Scenario:**
  ```
  As a project manager,
  I want to define that Task B depends on Task A
  So that team understands task sequencing
  ```
- **Acceptance Criteria:**
  - ✅ Task detail shows "Depends On" field (multi-select other tasks)
  - ✅ Add/remove dependency relationships
  - ✅ System prevents circular dependencies (detects cycles; rejects with error)
  - ✅ Dependent tasks shown visually in task list (indented or linked)
  - ✅ Cannot mark task as "In Progress" if dependency is "Not Started" (warning, not block)
  - ✅ Dependency graph max depth: 10 levels (prevents pathological nesting)
- **Testable:** Jest test for cycle detection algorithm
- **Estimable:** Directed acyclic graph (DAG) validation
- **Technical Notes:** Use DFS for cycle detection; cache graph for performance

---

### Phase 2: Enhanced Collaboration (Sprints 3-4)
**Goal:** Time tracking, file attachments, comments, subtasks  
**Estimated Capacity:** ~40-50 SP  
**Dependencies:** Phase 1 complete

#### Story Group: Time Tracking

**US-3.6.1: Log actual hours; store time tracking** (8 SP)
- **Priority:** High
- **Actor:** Task assignee
- **Scenario:**
  ```
  As a task assignee,
  I want to log hours spent on a task
  So that team can track actual effort vs. estimates
  ```
- **Acceptance Criteria:**
  - ✅ Time log entry: date, hours worked, notes
  - ✅ Log time retroactively (past dates allowed)
  - ✅ Edit/delete own time logs
  - ✅ Display total hours on task detail
  - ✅ Cannot log negative hours or > 24/day
  - ✅ Time logs visible only to assigned users + PM
- **Testable:** Jest test for time log validation + permission tests
- **Estimable:** New data model + API endpoints
- **Technical Notes:** Store as separate TimeLog entities; aggregate for dashboard

---

**US-3.6.2: Compare time logs vs. estimates; basic reporting** (5 SP)
- **Priority:** Medium
- **Actor:** Project manager
- **Scenario:**
  ```
  As a project manager,
  I want to see actual hours vs. estimated hours
  So that I can improve estimation accuracy
  ```
- **Acceptance Criteria:**
  - ✅ Task detail shows: Estimated hours, Logged hours, Variance (actual - estimated)
  - ✅ Visual indicator (green = under, red = over)
  - ✅ Project dashboard aggregates: total estimated, total logged, % of plan complete
  - ✅ CSV export of time logs for external reporting
  - ✅ No real-time time tracking (user manually enters hours)
- **Testable:** Jest test for time calculations + export logic
- **Estimable:** Aggregate queries + dashboard widget
- **Technical Notes:** Use Prisma groupBy for aggregations

---

#### Story Group: File Attachments

**US-3.7.1: Attach files; store in external storage** (10 SP)
- **Priority:** High
- **Actor:** Task assignee
- **Scenario:**
  ```
  As a task assignee,
  I want to attach relevant files to a task
  So that all context is available without email
  ```
- **Acceptance Criteria:**
  - ✅ Upload button in task detail; support drag-and-drop
  - ✅ Single file up to 100MB; total per task max 500MB
  - ✅ Supported types: PDF, images (JPG/PNG), Office (DOCX/XLSX), TXT
  - ✅ Block executable files (.exe, .sh, .bat)
  - ✅ Files stored in S3-compatible service (MinIO for dev, AWS S3 for prod)
  - ✅ Attachment list shows filename, uploader, upload date
  - ✅ Can delete own attachments; PM can delete any
- **Testable:** Jest test for file validation + S3 integration test
- **Estimable:** File upload UI + S3 SDK integration
- **Technical Notes:** Use pre-signed URLs for direct upload; implement rate limiting

---

**US-3.7.2: File versioning (previous versions accessible)** (8 SP)
- **Priority:** Medium
- **Actor:** Task assignee
- **Scenario:**
  ```
  As a task assignee,
  I want to see previous versions of an attachment
  So that I can revert or compare changes
  ```
- **Acceptance Criteria:**
  - ✅ Upload same filename = new version (old version retained)
  - ✅ Version history shows: version #, uploader, upload date
  - ✅ Download previous versions
  - ✅ Delete specific version (max 5 versions per file)
  - ✅ "Current" badge on latest version
- **Testable:** Jest test for version management
- **Estimable:** File versioning logic in S3
- **Technical Notes:** Use S3 object versioning; implement cleanup job for old versions

---

#### Story Group: Comments & Discussion

**US-3.8.1: Add comments to tasks; threaded discussion UI** (8 SP)
- **Priority:** Critical
- **Actor:** Team member
- **Scenario:**
  ```
  As a team member,
  I want to comment on tasks with support for nested replies
  So that discussions stay within context
  ```
- **Acceptance Criteria:**
  - ✅ Comment form on task detail with markdown preview
  - ✅ Reply to a comment (one level of nesting; not infinite)
  - ✅ Comment author, timestamp, edit history visible
  - ✅ Can edit own comment within 5 minutes
  - ✅ Can delete own comment (shows [deleted])
  - ✅ Comments sorted chronological with replies indented
  - ✅ Rich text: **bold**, *italic*, links, code blocks
- **Testable:** Jest test for comment UI + markdown parsing
- **Estimable:** Comment data model + React component
- **Technical Notes:** Use markdown-it for safe HTML rendering; prevent XSS

---

**US-3.8.2: Implement @mentions; send notifications** (5 SP)
- **Priority:** High
- **Actor:** Commenter
- **Scenario:**
  ```
  As a commenter,
  I want to @mention team members
  So that they are notified about discussions
  ```
- **Acceptance Criteria:**
  - ✅ Type "@" in comment → autocomplete dropdown with project members
  - ✅ @mention turns comment text into rich annotation (visible to system)
  - ✅ Mentioned user gets notification (in-app + email)
  - ✅ User only mentioned once per comment (no spam)
  - ✅ Cannot mention users outside project
- **Testable:** Jest test for mention parsing + notification logic
- **Estimable:** Mention autocomplete + notification handler
- **Technical Notes:** Use regex for mention detection; debounce autocomplete

---

#### Story Group: Subtasks & Progress

**US-3.5.1: Create subtasks; manual progress tracking** (8 SP)
- **Priority:** Medium
- **Actor:** Task assignee
- **Scenario:**
  ```
  As a task assignee,
  I want to create subtasks for complex work
  So that I can track granular progress
  ```
- **Acceptance Criteria:**
  - ✅ Subtask list in task detail (collapsible)
  - ✅ Add/edit/delete subtasks (same UI as regular tasks but simpler)
  - ✅ Mark subtask complete (checkbox)
  - ✅ Subtask inherits parent task's due date (can override)
  - ✅ Max 50 subtasks per task
  - ✅ Cannot create sub-subtasks (one level only)
  - ✅ Delete parent task → cascade delete subtasks
- **Testable:** Jest test for subtask CRUD + cascade logic
- **Estimable:** Subtask data model + UI
- **Technical Notes:** Use foreign key with ON DELETE CASCADE

---

**US-3.5.2: Auto-calculate completion % from subtasks** (5 SP)
- **Priority:** Medium
- **Actor:** Project manager viewing dashboard
- **Scenario:**
  ```
  As a project manager,
  I want task progress to auto-update when subtasks complete
  So that parent task progress reflects child progress
  ```
- **Acceptance Criteria:**
  - ✅ Task progress % = (completed subtasks / total subtasks) * 100
  - ✅ If no subtasks, use manual progress field
  - ✅ If both subtasks + manual progress set, use subtask calculation
  - ✅ Update is eventual consistent (within 1 minute via batch job)
  - ✅ No real-time WebSocket (polling OK for Phase 1)
- **Testable:** Jest test for percentage calculation + batch job
- **Estimable:** Aggregate calculation logic
- **Technical Notes:** Implement as scheduled job (cron, runs every 5 min)

---

### Phase 3: Advanced Features (Sprint 5+)
**Goal:** Advanced dependencies, real-time collaboration, integrations

#### Backlog (Not yet sized)
- US-3.2.2: Validate circular dependencies; prevent invalid graphs
- US-3.2.3: Calculate timeline impacts on dependent tasks
- US-3.7.3: File security (MIME validation, virus scanning)
- WebSocket real-time collaboration
- Slack/Teams integration
- JIRA sync integration
- Advanced reporting & Gantt charts

---

## Technical Debt & Risks

### High-Risk Items (Must Address Phase 1)

| Risk | Severity | Mitigation | Owner |
|------|----------|-----------|-------|
| **Concurrent task updates** | High | Implement optimistic locking via timestamp columns | Backend Lead |
| **SQLite write contention** | High | Queue writes; implement connection pooling; monitor with DataDog | DevOps |
| **N+1 query problem with dependencies** | Medium | Eager-load related tasks; implement query pagination | Backend |
| **File storage at 100MB** | Medium | Use external S3; validate upload size server-side | Backend |
| **Circular dependency graph** | Medium | Implement DFS cycle detection; unit test thoroughly | Backend |

### Medium-Risk Items (Phase 2 Planning)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Real-time collaboration conflicts** | Medium | Implement OT (Operational Transformation) or CRDT; Phase 2 only |
| **Notification spam** | Low | Deduplicate; throttle email; aggregate in-app |
| **Dependency cascade delays** | Low | Async event processing; document eventual consistency |

---

## Excluded from Scope (Technical Constraints)

### Why Not Included

1. **Real-time task updates (WebSockets)** - Phase 2+
   - Requires infrastructure upgrade; SQLite not suitable for high-concurrency
   - Polling sufficient for MVP
   
2. **Gantt chart visualization** - Phase 2+
   - Timeline calculation logic (US-3.2.3) required first
   - Complex canvas rendering; defer to dedicated library
   
3. **Automatic timeline adjustment on dependent task delay** - Phase 2+
   - Cascade recalculation is non-trivial
   - Phase 1: Manual recalculation (user can re-estimate)
   
4. **Advanced permission model** - Post-MVP
   - Start with: Project = Owner/PM have full access, others view/update own tasks
   - Phase 3: Field-level, role-based permissions
   
5. **Recurring tasks** - Post-MVP
   - Out of scope for initial Task Management
   - Can add via separate module later

---

## INVEST Scorecard: Before & After

### Original Requirements INVEST Scoring

| Requirement | I | N | V | E | S | T | Score | Issues |
|------------|---|---|---|---|---|---|-------|--------|
| FR-3.1 | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ | 4/6 | Too large; vague acceptance criteria |
| FR-3.2 | ❌ | ✅ | ✅ | ❌ | ❌ | ⚠️ | 2/6 | Complex domain logic; undefined behavior |
| FR-3.3 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | PASS (minor design needed) |
| FR-3.4 | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | 5/6 | Boundary case; notification scope unclear |
| FR-3.5 | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ | 3/6 | Calculation algorithm undefined |
| FR-3.6 | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | 5/6 | "Compare" feature vague |
| FR-3.7 | ⚠️ | ✅ | ✅ | ❌ | ❌ | ⚠️ | 2/6 | 100MB scope huge; versioning undefined |
| FR-3.8 | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | 5/6 | "Threaded" definition needed |

**Average:** 4.1/6 (BELOW ACCEPTABLE)

---

### Refined User Stories INVEST Scoring

| User Story | I | N | V | E | S | T | Score | Status |
|-----------|---|---|---|---|---|---|-------|--------|
| US-3.1.1: Create task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.1.2: Assign task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.1.3: Update status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.1.4: Bulk import | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.3.1: Priority levels | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.4.1: Status workflow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.4.2: Blocked notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| US-3.2.1: Dependencies | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | READY |
| (Phase 2 stories) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 6/6 | PHASE 2 |

**Average:** 6/6 (EXCELLENT)

---

## Sprint Planning Template

### Sprint 1: Core Task Lifecycle (Weeks 1-2)
**Capacity:** 21 SP

- [ ] US-3.1.1: Create individual task (5 SP) - Frontend + Backend
- [ ] US-3.1.2: Assign task to team members (5 SP) - Backend + Notifications
- [ ] US-3.3.1: Priority levels with indicators (5 SP) - Frontend + Styling
- [ ] US-3.4.1: Status workflow state machine (6 SP) - Backend + Validation

**Definition of Done:**
- Code reviewed and approved
- Jest tests written; >80% coverage
- Manual QA sign-off
- No high-severity bugs
- Committed to main branch
- DataDog monitoring in place

---

### Sprint 2: Discovery & Dependencies (Weeks 3-4)
**Capacity:** 23 SP

- [ ] US-3.1.3: Update task status and progress (5 SP) - Frontend + Logic
- [ ] US-3.4.2: Blocked notifications (5 SP) - Notifications + Testing
- [ ] US-3.2.1: Define dependencies (8 SP) - Graph logic + UI
- [ ] US-3.1.4: Bulk task import (5 SP) - CSV parsing + Batch

**Definition of Done:**
- Code reviewed and approved
- Jest tests written; >80% coverage
- Integration tested
- No high-severity bugs
- Performance tested (dependency graph with 1000 tasks)

---

## Non-Functional Requirements (Refined)

### Performance SLAs
- Task creation: <500ms p95
- Dependency graph calculation: <2s for 100+ tasks
- Task list load: <1s p95 (with pagination)
- Comment load: <500ms for 50 comments

### Security Requirements
- Rate limit task creation: max 50/minute per user
- File upload: validate MIME type, max 100MB, virus scan
- Comments: sanitize HTML; prevent XSS
- Data access: task visible to project members only
- Audit trail: track who changed what, when

### Availability & Reliability
- System uptime: 99.5% (SLA for business hours)
- Database backup: hourly (S3)
- Data retention: 7 years for completed tasks
- Graceful degradation: if file storage down, still allow task updates

### Compliance & Legal
- GDPR: support data export & deletion for users
- SOC 2: audit trail for all modifications
- HIPAA: not in scope (no PHI data)

---

## Dependencies & Integration Points

### External Services

| Service | Purpose | Phase | Risk |
|---------|---------|-------|------|
| **S3-compatible storage** | File attachments | Phase 2 | Medium - cold start config |
| **Email service** | Notifications | Phase 1 | Low - use existing setup |
| **DataDog** | Monitoring & alerting | Phase 1 | Low - already integrated |
| **GitHub Actions** | CI/CD | Phase 1 | Low - existing setup |

### Internal Dependencies

| Module | What it needs from Task Mgmt | When |
|--------|------|------|
| Project Module | Project ID, team membership | Phase 1 |
| User Module | User profiles, permissions | Phase 1 |
| Notification Module | Event publishing | Phase 1 |
| Dashboard | Task aggregates (counts by status) | Phase 2 |

---

## Acceptance Criteria Summary

### Minimum Viable Product (Phase 1)
- ✅ Create, assign, update tasks
- ✅ 5-status workflow with state machine
- ✅ Priority levels with UI indicators
- ✅ Define task dependencies (DAG validation)
- ✅ Bulk task import from CSV
- ✅ Comments with threaded replies
- ✅ @