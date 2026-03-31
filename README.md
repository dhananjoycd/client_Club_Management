# XYZ Tech Club Management System

Full-stack club management platform for handling public club content, membership applications, role-based dashboards, event registration, payment verification, committee management, testimonials, and contact workflows.

This repository contains the **frontend** application built with Next.js. The frontend is connected to a separate **backend API** and this README documents both sides based on the current project structure and API contracts used in the codebase.

## Live Demo

Frontend: [https://xyztechclub.vercel.app/](https://xyztechclub.vercel.app/)

## Overview

The system is designed for a university tech club or student organization where:

- visitors can explore the club, events, notices, committee, and testimonials
- users can register, log in, verify email, reset password, and apply for membership
- members can manage their profile, membership status, event registrations, and testimonials
- admins can review applications, manage notices and events, verify payments, review contact messages and testimonials, and manage users
- super admins can manage committee sessions, assignments, and site settings

## Frontend

### Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Sonner
- Lucide React

### Frontend Features

#### Public Area

- home page with dynamic club content
- about page
- events listing and event details
- notices page
- committee page with session-wise lineup
- testimonials page with approved testimonials
- membership application flow
- contact page

#### Authentication

- email/password registration
- email/password login
- Google sign-in flow
- email verification
- forgot password
- reset password
- cookie-based session handling

#### Member Area

- member dashboard overview
- account/profile management
- membership status tracking
- event registrations list
- protected notices access
- testimonial submission

#### Admin Area

- admin dashboard overview
- applications review
- events CRUD
- notices CRUD
- contacts review
- users management and role updates
- testimonials moderation
- paid registration and payment verification management

#### Super Admin Area

- committee session management
- committee assignment workspace
- site settings management

### Frontend Routes

#### Public Routes

- `/`
- `/about`
- `/events`
- `/events/[id]`
- `/notices`
- `/committee`
- `/testimonials`
- `/apply`
- `/contact`

#### Auth Routes

- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`

#### Member Routes

- `/member`
- `/member/profile`
- `/member/membership-status`
- `/member/registrations`
- `/account`
- `/account/profile`
- `/account/membership-status`
- `/account/registrations`

#### Admin Routes

- `/admin`
- `/admin/applications`
- `/admin/events`
- `/admin/events/[id]/edit`
- `/admin/notices`
- `/admin/payments`
- `/admin/contacts`
- `/admin/users`
- `/admin/testimonials`
- `/admin/profile`
- `/admin/settings`
- `/admin/committee`
- `/admin/committee/[sessionId]`

### Frontend Project Structure

```txt
src/
  app/
    (public)/
    (auth)/
    (member)/
    (admin)/
  components/
  features/
    account/
    applications/
    auth/
    committee/
    contact/
    dashboard/
    events/
    home/
    members/
    notices/
    payments/
    registrations/
    settings/
    testimonials/
    users/
  services/
  schemas/
  providers/
  lib/
  types/
```

### Frontend Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Frontend Scripts

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Backend

The backend is a separate service, but the frontend already shows the active backend contract clearly through `src/services/*.ts`.

### Backend Responsibilities

- authentication and session management
- user account and role management
- membership application review flow
- member profile and membership status management
- event management
- event registration handling
- paid event checkout and payment status tracking
- manual payment verification fallback for admins
- notices management
- contact message review
- testimonials submission and moderation
- committee sessions and assignments
- dashboard summary data
- site settings and homepage content management

### Backend API Modules Used by the Frontend

- `Auth`
- `Account`
- `Applications`
- `Members`
- `Events`
- `Registrations`
- `Notices`
- `Contacts`
- `Testimonials`
- `Committee`
- `Dashboard`
- `Users`
- `Settings`

### Backend Endpoints Consumed by the Frontend

#### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /auth/request-password-reset`
- `POST /auth/reset-password`
- `POST /auth/send-verification-email`
- `POST /auth/sign-in/social`

#### Account and Users

- `GET /account/profile`
- `PATCH /account/profile`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/role`

#### Applications and Members

- `POST /applications`
- `GET /applications`
- `PATCH /applications/:id/review`
- `GET /members`
- `GET /members/:id`
- `PATCH /members/:id`

#### Events and Registrations

- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/register`
- `POST /events/:id/payment-failed`
- `GET /registrations`
- `PATCH /registrations/:id/verify-payment`
- `PATCH /registrations/:id/cancel`

#### Notices, Contacts, Testimonials

- `GET /notices`
- `POST /notices`
- `PATCH /notices/:id`
- `DELETE /notices/:id`
- `POST /contacts`
- `GET /contacts/mine`
- `GET /contacts/admin`
- `PATCH /contacts/:id/review`
- `GET /testimonials`
- `GET /testimonials/mine`
- `POST /testimonials`
- `GET /testimonials/admin`
- `PATCH /testimonials/:id/review`

#### Committee, Dashboard, Settings

- `GET /committee/public`
- `GET /committee/admin/sessions`
- `GET /committee/admin/eligible-members`
- `POST /committee/sessions`
- `PATCH /committee/sessions/:id`
- `DELETE /committee/sessions/:id`
- `POST /committee/assignments`
- `PATCH /committee/assignments/:id`
- `DELETE /committee/assignments/:id`
- `GET /dashboard/admin`
- `GET /dashboard/member`
- `GET /settings`
- `PUT /settings`

### Backend Requirements

The frontend expects the backend to support:

- cookie-based authentication with CORS configured for the frontend origin
- JSON API responses
- role-based access control for public, member, admin, and super admin access
- persistent storage for users, applications, events, registrations, notices, contacts, testimonials, committee data, and site settings
- payment workflow support for paid events
- social login redirect handling for Google sign-in

### Payment Flow

The current frontend indicates this payment behavior:

- free events can be registered directly
- paid events return a checkout URL from the backend
- registrations store payment status and payment verification status
- admins can manually verify pending payments from the payments dashboard
- Stripe checkout session references are displayed in admin payment details

## Local Development

To run the full project locally:

1. Start the backend server on `http://localhost:5000`
2. Expose the API under `http://localhost:5000/api/v1`
3. Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
4. Install frontend dependencies with `npm install`
5. Run the frontend with `npm run dev`

Frontend default URL:

```txt
http://localhost:3000
```

Backend default API base URL:

```txt
http://localhost:5000/api/v1
```

## Notes

- the frontend sends requests with `withCredentials: true`
- the backend must allow credentials and the frontend origin in CORS
- this repository does not include the backend source code
- the backend section above is documented from the real API usage found in the frontend services and feature modules
