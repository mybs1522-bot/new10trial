
# Interior Design & Execution Mastery — Full App Plan

## Overview
A full-stack, Apple-inspired premium web application for a 1-month real-project interior design program. Light mode by default with dark mode toggle, Razorpay payment integration, real backend with user accounts and admin control.

---

## 1. Design System & Global Theme
- **Color palette**: Pure white backgrounds, soft warm greys, charcoal blacks, subtle warm gold accent (`#C9A96E` style)
- **Typography**: Inter font — ultra-bold headlines, thin elegant body text, perfect letter spacing
- **Effects**: Glassmorphism cards with `backdrop-blur`, soft box shadows, rounded-2xl corners
- **Animations**: Fade-in on scroll, smooth hover lifts (+glow on cards), micro-interactions on buttons
- **Buttons**: Pill-shaped with gradient fills, smooth hover transitions
- **No clutter. No cheap colors. Ultra-premium throughout.**

---

## 2. Public Landing Page (High-Conversion)

### Hero Section
- Full-width section with Apple-style soft gradient background
- Big bold headline: *"Learn Interior Design & Execution From Zero to Real Site Projects in 30 Days"*
- Elegant subtext about beginner transformation
- Two CTA buttons: **Join Now** (primary gradient pill) + **View Curriculum** (ghost)
- Subtle animated background gradient and floating design element

### Availability Banner
- Two chips/cards: **Delhi NCR – Available Now** | **Other Cities – Launching Soon** | **Online – All India Available**

### Transformation Journey (Section 2)
- Horizontal step-flow visual: `Beginner → Designer → Execution Expert → Real Site Visit → Freelance Ready`
- 5 feature highlight cards below: Real Site Visits, Execution Knowledge, Client Handling, Material Selection, BOQ Understanding
- Fade-in animation as user scrolls

### 6 Courses Section (Section 3)
- 6 frosted-glass premium cards in a responsive grid
- Each card shows: course name, short description, and a **🔒 Locked** badge
- Hover: card lifts slightly with a soft glow pulse
- Courses: AutoCAD, SketchUp, D5 Render, AI Rendering, Design-to-Execution Workflow, Client & Site Management

### Books Library Preview (Section 4)
- 6 book cards (Kitchen, Washroom, Study, Bedroom, Living Room, Exteriors)
- Each shows a blurred placeholder thumbnail + title
- Overlay: "🔒 Unlock with Enrollment"
- Premium grid layout, subtle glassmorphism

### Signup / Enrollment Form
- Fields: Full Name, Email, Phone Number, Location, Mode (Offline Delhi NCR / Online All India), Experience Level (First Time / Some Idea)
- On submit: creates account → sends email with login credentials → auto-logs in → redirects to dashboard
- Clean, spacious form with premium input styling

---

## 3. Student Dashboard (Post-Login)

Premium sidebar layout (collapsible) with dark/light toggle.

**Welcome Banner**: Profile card with name, location, mode, experience + motivational quote:
*"Design is not decoration. It is execution with intelligence."*
Journey progress indicator + next upcoming site visit teaser.

### Tab 1 – My Courses
- 6 course cards showing locked/unlocked state
- Progress bar per course (unlocked after payment)
- Clean premium UI

### Tab 2 – Books Library
- Grid of 6 book cards
- Locked by default, unlocked post-payment
- Visible blurred preview thumbnails

### Tab 3 – Site Visit Calendar
- Calendar view with scheduled real site visits
- Each visit card: location, date, time, "Add to Calendar" button
- Admin-managed schedule

### Tab 4 – Messages
- Internal messaging: students receive messages from admin
- Clean WhatsApp-inspired but premium UI
- Message bubbles, timestamps, read receipts styling

### Tab 5 – Certificates
- Shows certificate preview (elegant design)
- Download PDF button (unlocked on course completion)
- Locked state before completion

### Tab 6 – Freelance Opportunities
- Grid of freelance project cards posted by admin
- Each card: Project Title, Budget, Location, Description
- "Show Interest" button → sends notification to admin

---

## 4. Admin Dashboard (Separate Role)

Clean, powerful control panel accessible only to admin accounts.

**Panels:**
- **Students** – Table of all students, filterable by Online/Offline, payment status
- **Course Access** – Unlock/lock courses per student after payment
- **Site Visits** – Add/edit/delete site visit schedules (date, time, location)
- **Freelance Projects** – Post new freelance opportunities with title, budget, location, description
- **Messages** – Send broadcast messages or individual messages to students
- **Certificates** – Upload/assign certificates to specific students
- **Documents** – Upload and manage shared resources

---

## 5. Paywall System (Razorpay)
- All courses, books, site visit calendar, certificates, and freelance tab locked by default
- One payment button unlocks everything
- Razorpay checkout modal (clean embedded flow)
- On successful payment: backend updates user access → instant unlock in dashboard
- Premium payment confirmation screen

---

## 6. Authentication & Backend (Lovable Cloud)
- Email/password signup with auto-credential email
- Role-based access: `student` and `admin` roles stored in separate roles table
- Protected routes: dashboard only for logged-in users, admin panel only for admins
- Session persistence across page reloads

---

## Build Order
1. Design system + global theme + routing structure
2. Landing page (all sections)
3. Auth (signup form → auto-login → dashboard redirect)
4. Student dashboard with all 6 tabs
5. Admin dashboard
6. Paywall + Razorpay integration
7. Email credential delivery on signup
