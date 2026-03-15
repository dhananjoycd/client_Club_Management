````md
# Club Management System Frontend

A modern and responsive frontend application for a Club / District Association Management System.

This project includes:

- A public-facing website
- A member dashboard
- An admin dashboard

The frontend is designed to work with a separate backend API built with Node.js, Express, Prisma, PostgreSQL, and Better Auth.

---

## Live Purpose

This frontend solves the main UI needs of a student club / district association platform:

- Public visitors can explore the organization
- Students can apply for membership
- Members can manage their profile and activity
- Admins can manage applications, events, notices, and settings

---

## Core Features

### Public Side

- Home page
- About page
- Events page
- Notices page
- Membership apply page
- Contact section
- Responsive public navigation and footer

### Member Side

- Member dashboard
- Profile page
- Membership status page
- My registrations page
- Notices access

### Admin Side

- Admin dashboard
- Applications review interface
- Events management
- Notices management
- Settings management

---

## Tech Stack

### Core

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Forms & Validation

- React Hook Form
- Zod

### API & Server State

- Axios
- TanStack Query

### UI Utilities

- Lucide React
- Sonner
- date-fns

---

## Project Structure

```txt
src/
  app/
    (public)/
    (auth)/
    (member)/
    (admin)/
    globals.css

  components/
    shared/
    layout/
    forms/
    tables/
    cards/
    feedback/

  features/
    auth/
    applications/
    members/
    events/
    notices/
    dashboard/
    settings/

  services/
    auth.service.ts
    application.service.ts
    member.service.ts
    event.service.ts
    notice.service.ts
    dashboard.service.ts
    settings.service.ts

  lib/
    axios.ts
    utils.ts
    query-client.ts

  providers/
    query-provider.tsx
    toaster-provider.tsx

  schemas/
    auth.schema.ts
    application.schema.ts
    member.schema.ts
    event.schema.ts
    notice.schema.ts
    settings.schema.ts

  types/
    auth.types.ts
    application.types.ts
    member.types.ts
    event.types.ts
    notice.types.ts
    dashboard.types.ts
```
````

---

## Main Pages

### Public Pages

- `/`
- `/about`
- `/events`
- `/notices`
- `/apply`
- `/login`

### Member Pages

- `/member`
- `/member/profile`
- `/member/membership-status`
- `/member/registrations`

### Admin Pages

- `/admin`
- `/admin/applications`
- `/admin/events`
- `/admin/notices`
- `/admin/settings`

---

## UI Goals

This project follows a clean academic and professional visual style:

- White + deep blue + soft gray theme
- Card-based layout
- Dashboard-focused structure
- Responsive design
- Reusable UI components
- Consistent form validation and feedback
- Professional admin interface

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-frontend-repo-url>
cd <your-frontend-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Run the Project

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## Backend Integration

This frontend depends on the backend API being active.

Default backend API base URL:

```text
http://localhost:5000/api/v1
```

Make sure:

- the backend server is running
- CORS is configured correctly
- the frontend origin matches the backend `CLIENT_URL`

---

## Authentication

This project uses cookie-based session authentication from the backend.

Important:

- API requests must send credentials
- frontend must use `withCredentials: true`
- backend must allow the frontend origin

Example Axios setup:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
```

---

## Form System

Forms are built using:

- React Hook Form
- Zod

This pattern is used for:

- login form
- membership apply form
- event create/edit form
- notice create/edit form
- settings update form

---

## API Modules Used

The frontend consumes these backend modules:

- Auth
- Applications
- Members
- Events
- Notices
- Dashboard
- Settings

---

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build the application
- `npm start` - start production server
- `npm run lint` - run ESLint
- `npm run format` - format project files with Prettier

---

## MVP Scope

This frontend MVP focuses on:

- public home page
- login page
- membership apply page
- member dashboard
- admin dashboard
- application review UI
- event CRUD UI
- notice CRUD UI
- settings page

---

## Future Improvements

- Gallery module
- Executive committee section
- Reports and analytics
- QR member card
- Payment integration
- File upload enhancements
- Advanced filtering and search
- Animations and micro-interactions

---

## Author
