# Bicol University Student Notice System - User Stories

## Project Overview
**Project Name:** Bicol University Student Notice System  
**Project Type:** Web Application (Notice Management System)  
**Core Functionality:** A multi-role notice management system enabling students to browse and discover notices, faculty to create and manage notices, and administrators to oversee the entire system.  
**Target Users:** Students, Faculty Members, and Administrators of Bicol University

---

## User Role 1: STUDENT

### User Story 1.1: Search and Browse Notices
**Title:** Search and Browse Notices  
**As a** student,  
**I want to** be able to search, filter, and browse all available notices,  
**So that** I can easily find the announcements I'm interested in.

**Acceptance Criteria:**
- The system displays a list of all published notices sorted by pinned status then by date
- Each notice displays: title, category badge, priority indicator, publish date, and read status
- **Search Bar**: Real-time search filtering by title and content (case-insensitive)
- **Category Filters**: Filter by category (exam, events, class, general)
- **Priority Filters**: Filter by priority level (critical, high, normal, low)
- **Department Filters**: Filter by department to see relevant notices
- **Read Status Filters**: Filter by read/unread status
- **Sorting Options**: Sort by Latest First, Oldest First, or Priority
- Multiple filters can be applied simultaneously with active filter count displayed
- Unread notices are visually distinguished from read notices
- Loading states are shown while fetching data

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a search bar, category filters, priority filters, department filters, and responsive layout to ensure students can quickly find the notices they want to read.

---

### User Story 1.2: View Notice Details and Mark as Read
**Title:** View Notice Details and Track Reading  
**As a** student,  
**I want to** view complete notice details and have my reading automatically tracked,  
**So that** I can read full announcements and track my progress.

**Acceptance Criteria:**
- Clicking a notice opens a modal with title, full content, category, priority, dates, and attachment (if any)
- Opening a notice automatically marks it as read with timestamp recorded
- Read status is visually indicated on notice cards
- Modal can be closed via X button, clicking outside, or pressing Escape

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a responsive modal layout with clear content display to help students discover complete notice information.

---

### User Story 1.3: View Urgent Notices
**Title:** View Urgent Notices  
**As a** student,  
**I want to** quickly access urgent notices requiring immediate attention,  
**So that** I don't miss critical announcements.

**Acceptance Criteria:**
- Dedicated Urgent Notices page showing only "urgent" type notices
- Auto-refreshes every 5 minutes with manual refresh button available
- "Mark All as Read" button and unread count badge displayed
- Urgent notices highlighted with destructive/critical theme styling

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a prominent urgent notices section with auto-refresh and visual alerts to help students quickly discover critical announcements.

---

### User Story 1.4: View Department Notices
**Title:** View Department Notices  
**As a** student,  
**I want to** see notices specific to my department,  
**So that** I only receive relevant course-related announcements.

**Acceptance Criteria:**
- Dedicated Department Notices page showing only notices targeted to the student's department
- Notices without department targeting are visible to all students
- Student's department is determined from their profile

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement department-based filtering to help students quickly find notices relevant to their academic program.

---

### User Story 1.5: Track Reading Progress
**Title:** Track Reading Progress  
**As a** student,  
**I want to** see my reading statistics and progress,  
**So that** I know how many notices I've read.

**Acceptance Criteria:**
- Read Tracking page displays: total notices, read count, unread count, completion percentage with progress bar
- Category-wise breakdown showing read status per category
- "Mark All as Read" button available
- Separate tabs for Unread and Read notices

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a tracking dashboard with visual progress indicators to help students monitor their notice discovery and reading habits.

---

### User Story 1.6: Student Dashboard
**Title:** Student Dashboard  
**As a** student,  
**I want to** see a personalized dashboard with key information,  
**So that** I can quickly get an overview of my notice activity.

**Acceptance Criteria:**
- Dashboard displays: welcome message with name, student info card (department, year level, batch), stats cards (total, unread, urgent, academic, read percentage)
- Urgent notices banner displayed if any exist
- Latest notices list (5 most recent) and department notices section shown when applicable

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a responsive dashboard layout that aggregates key information to help students quickly discover important notices.

---

## User Role 2: FACULTY

### User Story 2.1: Faculty Dashboard
**Title:** Faculty Dashboard  
**As a** faculty member,  
**I want to** see an overview of my notice statistics and recent activity,  
**So that** I can monitor my notice engagement.

**Acceptance Criteria:**
- Dashboard displays: total notices created, published count, draft count, total reads
- Recent notices list (5 most recent) with read counts shown
- Quick action button to create new notice

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a dashboard with key metrics to help faculty understand how their notices are being discovered by students.

---

### User Story 2.2: Create and Manage Notices
**Title:** Create and Manage Notices  
**As a** faculty member,  
**I want to** create, edit, publish, and delete notices,  
**So that** I can communicate effectively with students.

**Acceptance Criteria:**
- **Create Notice Form**: Title, content, category, priority, notice type, attachment, expiry date, pin toggle
- **Targeting Options**: Target all students OR specific departments, programs, year levels, blocks
- **Publish Options**: Save as draft or publish immediately
- **Manage Notices Page**: List all created notices with search, filter by status/type
- **Per-Notice Actions**: Preview, Edit, Toggle Publish/Unpublish, Delete (with confirmation)
- **Statistics**: View read counts per notice to gauge engagement

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a user-friendly notice creation form with clear targeting options to help faculty reach the right audience and improve notice discoverability.

---

### User Story 2.3: View Activity Logs
**Title:** View Activity Logs  
**As a** faculty member,  
**I want to** see a history of my notice-related actions,  
**So that** I can review my activity.

**Acceptance Criteria:**
- Activity logs showing: notice creation, updates, deletions, publish/unpublish events
- Each log displays: action type, timestamp, affected notice title
- Sorted by most recent first

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement activity tracking to help faculty keep track of their notice management actions.

---

## User Role 3: ADMINISTRATOR

### User Story 3.1: Admin Dashboard
**Title:** Admin Dashboard  
**As an** administrator,  
**I want to** see an overview of the entire system,  
**So that** I can monitor system health.

**Acceptance Criteria:**
- Dashboard displays stats cards: total notices (with active), urgent notices, total users (breakdown: students, faculty, admins), total departments
- Recent notices list (5 most recent)
- Quick action buttons to create notice and manage users
- Charts showing notice distribution

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a comprehensive dashboard to help administrators monitor system-wide notice discovery and engagement.

---

### User Story 3.2: Manage All Notices
**Title:** Manage All Notices  
**As an** administrator,  
**I want to** view, create, edit, and delete all notices in the system,  
**So that** I can ensure quality and appropriateness.

**Acceptance Criteria:**
- **Table View**: Checkbox selection, priority indicator, title (with pin icon), category badge, target departments, creation date, status, actions dropdown
- **Actions**: Preview, Edit, Pin/Unpin, Delete
- **Bulk Actions**: Select multiple, Delete selected, Export to CSV
- **Filters**: Search by title/content, category, priority, department, status (Active/Draft/Expired)
- **Sorting**: By any column

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement comprehensive notice management with advanced search, filters, and bulk operations to efficiently manage large volumes of notices.

---

### User Story 3.3: Manage Users
**Title:** Manage Users  
**As an** administrator,  
**I want to** view and manage all users in the system,  
**So that** I can control access.

**Acceptance Criteria:**
- User table with columns: Avatar, Name, Email, Role, Department, Status, Created, Actions
- Role badges: Student, Faculty, Admin; Status badges: Active, Inactive
- Search by name/email, Filter by role/department/status
- Actions: View, Edit, Deactivate/Activate, Delete (with confirmation)
- Bulk actions for multiple users

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement user management with search and filter capabilities to efficiently manage access and control which users can discover certain notices.

---

### User Story 3.4: Manage Departments
**Title:** Manage Departments  
**As an** administrator,  
**I want to** create and manage departments,  
**So that** the system reflects the university's structure.

**Acceptance Criteria:**
- Department list with code, name, status
- Search functionality and Add new department button
- Actions per department: Edit, Deactivate/Activate, Delete (if no associations)
- Add/Edit form: Department code (unique), name, description, status

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement department management to enable proper notice targeting and filtering for better discovery experience.

---

### User Story 3.5: View Analytics
**Title:** Analytics & Reports  
**As an** administrator,  
**I want to** view analytics and statistics about the system,  
**So that** I can make data-driven decisions.

**Acceptance Criteria:**
- Stats cards: Total Notices (published/draft), Total Reads, Read Rate %, Active Users (vs total)
- Charts: Notices by category, by priority, over time
- Breakdown cards: Notice status and user engagement with progress bars

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement comprehensive analytics with data visualization to help administrators understand notice discovery patterns and optimize distribution.

---

### User Story 3.6: View System Activity Logs
**Title:** System Activity Logs  
**As an** administrator,  
**I want to** view activity logs for the entire system,  
**So that** I can audit user actions.

**Acceptance Criteria:**
- Logs showing all user actions: Login, Logout, Create/Edit/Delete Notice, Create/Edit User, etc.
- Each log: User name, Action type, Target, Timestamp
- Filters: by user, action type, date range
- Pagination for large datasets

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement comprehensive activity logging with filtering to quickly locate specific actions for auditing.

---

### User Story 3.7: System Settings
**Title:** System Settings  
**As an** administrator,  
**I want to** configure system settings,  
**So that** I can customize the application.

**Acceptance Criteria:**
- Settings include: Site name, contact email, auto-refresh interval, notification toggles, maintenance mode
- Settings persisted to database
- Changes require confirmation

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Allow configuration of system-wide settings that affect notice discovery and user experience.

---

## Authentication & Authorization

### User Story 4.1: User Registration and Login
**Title:** User Registration and Login  
**As a** new or returning user,  
**I want to** register and log in to the system,  
**So that** I can access my role-specific dashboard.

**Registration:**
- Role selection: Student, Faculty, Admin (restricted)
- Form fields: Email (unique), Password, Confirm password, Full name, Department, Year level/Batch (students)
- Password strength indicator, terms checkbox
- Success: Account created → redirect to login

**Login:**
- Fields: Email, Password, Remember me checkbox
- "Forgot password" link available
- Invalid credentials show error message
- Successful login redirects to role-based dashboard with session persisted

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement streamlined authentication to quickly onboard users and provide personalized notice discovery based on their role and profile.

---

### User Story 4.2: Role-Based Access Control
**Title:** Role-Based Access Control  
**As a** system,  
**I want to** ensure users can only access features appropriate to their role,  
**So that** security is maintained.

**Acceptance Criteria:**
- Students: Access only student routes
- Faculty: Access only faculty routes  
- Admin: Access all routes
- Unauthorized access redirects to login
- Protected routes check authentication status

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement role-based access to ensure users only discover notices appropriate to their role.

---

### User Story 4.3: User Profile
**Title:** User Profile  
**As a** user,  
**I want to** view and edit my profile,  
**So that** I can keep my information updated.

**Acceptance Criteria:**
- Profile displays: Avatar, Full name, Email, Role, Department, Additional info (year level, batch for students)
- Edit functionality: Update name, profile picture, department
- Change password functionality
- Profile shows activity summary

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Allow users to maintain accurate profile information for better notice targeting and personalized discovery.

---

## Common Features

### User Story 5.1: Responsive Layout
**Title:** Responsive Design  
**As a** user,  
**I want to** access the system on any device,  
**So that** I can use it on my phone, tablet, or desktop.

**Acceptance Criteria:**
- Fully responsive: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- Navigation adapts: Desktop sidebar, Mobile hamburger/bottom nav
- Tables scroll horizontally on mobile
- Forms stack vertically on mobile
- Touch-friendly buttons (min 44px tap target)

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement responsive design to ensure users can discover notices on any device with optimized layouts.

---

### User Story 5.2: Notifications & Feedback
**Title:** Notifications & Feedback  
**As a** user,  
**I want to** receive feedback on my actions,  
**So that** I know what happened.

**Acceptance Criteria:**
- Success toasts: Notice created/updated/deleted, Profile updated, Settings saved
- Error toasts: Form validation errors, Network errors, Permission errors
- Loading states during async operations
- Confirmation dialogs for destructive actions

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement toast notifications and loading states to provide immediate feedback during notice discovery and management.

---

### User Story 5.3: Landing Page
**Title:** Landing Page  
**As a** visitor,  
**I want to** see the system's landing page,  
**So that** I understand what the system does.

**Acceptance Criteria:**
- Landing displays: Bicol University logo, System title ("Student Notice System"), Description
- Three role cards: Student, Faculty, Administrator - each with icon, description, Login button
- Animated floating blobs background
- Footer with copyright

**Application in the System:**
- This feature focuses on improving the search and discovery experience on the notice system.
- Implement a visually appealing landing page with clear role-based navigation to help users quickly access their respective notice dashboards.

---

## Summary

This document contains **26 consolidated user stories** covering:

| Role | User Stories |
|------|-------------|
| **Student** | 6 (Search/Browse, View Details, Urgent Notices, Department Notices, Tracking, Dashboard) |
| **Faculty** | 3 (Dashboard, Create/Manage Notices, Activity Logs) |
| **Admin** | 7 (Dashboard, Notice Management, User Management, Departments, Analytics, Activity Logs, Settings) |
| **Auth** | 3 (Registration/Login, Access Control, Profile) |
| **Common** | 3 (Responsive Layout, Notifications, Landing Page) |

Each user story includes:
- **Title**, **As a**, **I want to**, **So that**
- **Acceptance Criteria** (detailed, testable conditions)
- **Application in the System** (explains how it improves search/discovery with search bar, filters, responsive layout)

