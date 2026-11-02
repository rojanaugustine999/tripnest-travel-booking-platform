# TripNest — Master Project Instructions
## Full-Stack Travel Booking Platform

**Project Name:** TripNest  
**Project Type:** Full-Stack Travel Booking Web Application  
**Primary Goal:** Professional portfolio project for UI/UX Design and Front-End Development roles.

**Development Environment:** Windows + VS Code + Claude Code  
**Frontend:** Next.js + React + TypeScript  
**Backend:** Next.js + Node.js runtime  
**Database:** Supabase PostgreSQL  
**Deployment:** Vercel

---

# 1. PROJECT OVERVIEW

I want to build a professional, modern, full-stack travel booking platform called **TripNest**.

TripNest will allow users to discover destinations, search hotels, compare accommodation options, view hotel details, select rooms, enter guest information and complete a demo booking process.

The platform will also include user authentication, a personal dashboard, saved hotels, booking history and an administrator dashboard.

The final application should look and feel like a real commercial travel booking website.

### Main objectives

1. Build an attractive, professional travel booking website.
2. Develop a fully responsive user interface.
3. Implement hotel search and filtering.
4. Implement user authentication.
5. Build a complete demo booking workflow.
6. Connect the application to Supabase.
7. Create a properly structured PostgreSQL database.
8. Implement secure user and administrator functionality.
9. Build a professional admin dashboard.
10. Deploy the application using Vercel.
11. Showcase the project in my developer portfolio.

### Target users

- Travellers looking for accommodation.
- Families planning holidays.
- Individual travellers.
- Couples planning trips.
- Users comparing hotels and prices.
- Administrators managing hotel inventory and bookings.

---

# 2. DEVELOPMENT ENVIRONMENT AND PROJECT DIRECTORY

Use the following exact local directory:

```text
C:\xampp\htdocs\projects\tripnest—travel-booking-platform
```

### Development environment

- Operating System: Windows.
- Local environment: XAMPP.
- Code editor: Visual Studio Code.
- AI coding assistant: Claude Code.
- Package manager: npm.
- Frontend framework: Next.js.
- Programming language: TypeScript.
- Version control: Git.
- Repository hosting: GitHub.

### Important directory instructions

- Always work inside the TripNest directory.
- Do not modify my other existing projects.
- Do not overwrite existing files without checking them.
- Do not create duplicate project directories.
- Inspect existing files before making changes.
- Explain important terminal commands before asking me to execute them.

My existing Amazon Product Listing project must remain completely separate.

Existing project location:

```text
C:\xampp\htdocs\projects\amazon-product-listing-roj
```

Never modify this project while developing TripNest.

---

# 3. EXISTING GITHUB ACCOUNT AND REPOSITORY

I already have a GitHub account.

**GitHub Username:**

```text
rojanaugustine999
```

Existing repository:

```text
amazon-product-listing-roj
```

Existing repository URL:

https://github.com/rojanaugustine999/amazon-product-listing-roj

I checked the Git object database using:

```bash
git count-objects -vH
```

The result was:

```text
count: 361
size: 5.99 MiB
in-pack: 0
packs: 0
size-pack: 0 bytes
```

The existing local project folder is approximately 1.75 GB, but its Git object database is approximately 5.99 MiB.

The existing repository remote is:

```text
https://github.com/rojanaugustine999/amazon-product-listing-roj.git
```

### GitHub requirements for TripNest

- Reuse my existing GitHub account.
- Do not create another GitHub account.
- Create a completely separate repository.
- Suggested repository name:

```text
tripnest-travel-booking-platform
```

- Keep TripNest and Amazon Product Listing separate.
- Never push TripNest code to the Amazon repository.
- Do not overwrite the existing Amazon repository.
- Configure Git properly.
- Create a meaningful commit history.
- Use descriptive commit messages.
- Include a proper `.gitignore`.
- Never commit credentials or environment secrets.

### Files that must not be committed

```text
node_modules/
.next/
.env
.env.local
.env.*.local
dist/
build/
coverage/
```

Only commit `.env.example` containing placeholder values.

Create Git checkpoints after each major development phase.

Do not push to GitHub or publish the repository without my approval.

---

# 4. EXISTING SUPABASE ACCOUNT

I already have a Supabase account on the Free plan.

Existing project:

```text
amazon-product-listing
```

Current status: Healthy.

My current Supabase account has:

- One active project.
- A maximum of two active projects on the Free plan.
- One available active project slot.

### Supabase requirements for TripNest

Create a separate Supabase project.

Suggested project name:

```text
tripnest
```

Instructions:

- Reuse my existing Supabase account.
- Do not create another Supabase account.
- Do not modify the existing Amazon Product Listing Supabase project.
- Use a separate PostgreSQL database.
- Configure separate authentication.
- Configure separate storage.
- Use separate API credentials.
- Do not reuse Amazon Product Listing credentials.

If I need to create the project manually, guide me through the Supabase dashboard step by step.

### Supabase Free Plan considerations

Keep the application suitable for the Free plan.

- Optimize database queries.
- Avoid unnecessary API requests.
- Compress images.
- Optimize database storage.
- Avoid unnecessary background processes.
- Monitor database and storage usage.
- Avoid paid integrations unless necessary.

Never expose database passwords, access tokens or secret keys.

Do not request that I paste private credentials into ChatGPT or other public locations.

---

# 5. TECHNOLOGY STACK

Use the following technology stack.

## Frontend

- Next.js with App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide React icons.

## Backend

- Next.js Server Components.
- Next.js Server Actions where appropriate.
- Next.js Route Handlers for API endpoints.
- Node.js runtime provided by Next.js.
- Supabase PostgreSQL.

Do not create a separate Express.js backend unless there is a clear technical requirement.

## Database and Authentication

- Supabase PostgreSQL.
- Supabase Authentication.
- Supabase Storage.
- Supabase Row Level Security (RLS).

## Additional libraries

- React Hook Form.
- Zod.
- Recharts.
- date-fns.
- npm.

Use current stable, compatible package versions.

Avoid unnecessary dependencies.

Explain the purpose of important libraries when installing them.

---

# 6. BRANDING AND UI/UX DESIGN REQUIREMENTS

The application brand name is:

**TripNest**

Create a premium, modern, travel-inspired visual identity.

The interface should look professional and polished, similar in quality to established hotel booking platforms.

## Suggested colour palette

- Primary: Deep navy or dark blue.
- Secondary: Teal or turquoise.
- Accent: Warm orange or coral.
- Background: White and light neutral grey.
- Text: Dark charcoal.
- Borders: Subtle neutral grey.

You can improve the colour palette if a better design direction is available.

## Typography

Use modern, readable typography.

Maintain consistent:

- Heading hierarchy.
- Body text.
- Font weights.
- Line heights.
- Letter spacing.
- Button typography.

## UI/UX principles

- Clean layouts.
- Professional spacing.
- Attractive hotel photography.
- High-quality destination imagery.
- Consistent navigation.
- Clear calls to action.
- Professional hotel cards.
- Modern search components.
- Subtle animations.
- Smooth transitions.
- Accessible components.
- Mobile-friendly layouts.
- Consistent design tokens.

## Responsive requirements

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Test at different viewport sizes, including approximately 375px mobile width.

Avoid horizontal scrolling and broken layouts.

## Accessibility

Follow accessibility best practices:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Appropriate labels.
- Accessible forms.
- Meaningful image alt text.
- Appropriate colour contrast.
- Accessible dialogs and menus.

Do not sacrifice usability for visual effects.

---

# 7. COMPLETE WEBSITE PAGES AND FEATURES

Build the following application modules.

## A. Homepage

Create an attractive homepage with:

1. Professional header.
2. TripNest logo.
3. Navigation menu.
4. Login and registration actions.
5. Hero section.
6. Travel background image.
7. Destination search.
8. Check-in date picker.
9. Check-out date picker.
10. Guest selector.
11. Room selector.
12. Search button.
13. Popular destinations.
14. Featured hotels.
15. Special offers.
16. Why choose TripNest section.
17. Customer testimonials.
18. Newsletter section.
19. Professional footer.

The homepage should immediately communicate that TripNest is a travel booking platform.

## B. Destination Listing

Create a destination listing page.

Features:

- Destination cards.
- Destination images.
- Destination names.
- Country information.
- Short descriptions.
- Search destinations.
- Popular destination sections.
- Navigation to destination details.

## C. Destination Details

Each destination details page should include:

- Destination hero image.
- Destination name.
- Country.
- Description.
- Popular attractions.
- Travel information.
- Recommended hotels.
- Related destinations.

## D. Hotel Listing

Create a professional hotel listing page.

Each hotel card should include:

- Hotel image.
- Hotel name.
- Location.
- Star rating.
- Customer review score.
- Review count.
- Price per night.
- Amenities.
- Short description.
- View details button.
- Save/favourite button.

### Hotel search

Implement search by:

- Destination.
- City.
- Hotel name.

### Hotel filters

Implement:

- Minimum and maximum price.
- Star rating.
- Guest rating.
- Hotel amenities.
- Accommodation type.
- Availability.

### Sorting

Implement:

- Price: Low to High.
- Price: High to Low.
- Highest rated.
- Most popular.
- Recommended.

Ensure that filtering and sorting actually work.

## E. Hotel Details

Each hotel details page should include:

- Hotel name.
- Location.
- Image gallery.
- Hotel description.
- Star rating.
- Guest reviews.
- Amenities.
- Facilities.
- Room options.
- Price information.
- Check-in time.
- Check-out time.
- Cancellation information.
- Availability information.
- Booking button.

Use realistic sample hotel information.

## F. Room Selection

Users should be able to:

- View available room types.
- Compare room prices.
- Select a room.
- View room descriptions.
- View maximum occupancy.
- View bed information.
- View available amenities.

Show the selected room clearly.

## G. Booking Workflow

Implement a multi-step booking process.

Suggested steps:

**Step 1:** Select hotel.

**Step 2:** Select room.

**Step 3:** Select check-in and check-out dates.

**Step 4:** Select guests.

**Step 5:** Enter guest information.

**Step 6:** Review booking.

**Step 7:** Confirm demo booking.

**Step 8:** Display booking confirmation.

### Price calculation

Show:

- Room price.
- Number of nights.
- Number of rooms.
- Subtotal.
- Taxes.
- Additional fees, if applicable.
- Final total.

Ensure calculations are performed safely on the server before saving a booking.

Validate dates, room availability and guest limits.

Prevent invalid or duplicate booking submissions.

### Important payment limitation

The initial version must use a clearly labelled demo booking flow.

Do not:

- Collect real card details.
- Store card information.
- Claim real payment processing.
- Claim a real hotel reservation was made without an actual booking provider.

If a real payment or hotel reservation integration is introduced later, explain the provider requirements and obtain my approval first.

## H. User Authentication

Implement:

- User registration.
- User login.
- Logout.
- Password reset.
- Authentication state.
- Protected user routes.
- Session handling.
- Profile creation.

Use Supabase Authentication.

Validate authentication flows.

## I. User Dashboard

Create a professional user dashboard.

Include:

- Dashboard overview.
- My bookings.
- Booking details.
- Saved hotels.
- Profile management.
- Account settings.

Display useful information and clear empty states.

## J. Saved Hotels

Allow users to:

- Save hotels.
- Remove saved hotels.
- View favourite hotels.
- Navigate to hotel details.

Prevent duplicate saved records.

## K. Booking History

Display:

- Booking reference.
- Hotel name.
- Hotel image.
- Room type.
- Check-in date.
- Check-out date.
- Number of nights.
- Number of guests.
- Total price.
- Booking status.
- Booking details.

## L. User Profile

Allow users to manage:

- Full name.
- Email display.
- Phone number.
- Profile image where appropriate.
- Account information.

Use proper validation and authorization.

## M. Admin Dashboard

Build a professional admin dashboard.

### Overview

Show:

- Total hotels.
- Total rooms.
- Total bookings.
- Total registered users.
- Demo booking revenue.
- Booking statistics.
- Recent bookings.
- Popular hotels.

Clearly identify demo or sample financial data.

### Hotel management

Administrators should be able to:

- Add hotels.
- Edit hotels.
- Delete or archive hotels.
- Publish and unpublish hotels.
- Manage hotel descriptions.
- Manage hotel images.
- Manage amenities.

### Room management

Administrators should be able to:

- Add room types.
- Edit room information.
- Manage prices.
- Manage occupancy.
- Manage room availability.

### Booking management

Administrators should be able to:

- View bookings.
- View booking details.
- Filter bookings.
- Update permitted booking statuses.
- Review booking information.

### User management

Provide suitable administrative user information and management functions.

### Admin security

Admin access must be protected on the server.

Do not rely only on hiding admin navigation links in the frontend.

Use secure role-based authorization.

---

# 8. DATABASE DESIGN AND SUPABASE ARCHITECTURE

Use Supabase PostgreSQL.

Design a relational database that supports the entire TripNest application.

Suggested tables:

1. `profiles`
2. `destinations`
3. `hotels`
4. `hotel_images`
5. `amenities`
6. `hotel_amenities`
7. `rooms`
8. `bookings`
9. `booking_guests`
10. `saved_hotels`
11. `reviews`

Add other tables if necessary.

## Database requirements

Use:

- UUID primary keys where appropriate.
- Foreign keys.
- Appropriate constraints.
- Unique constraints.
- Indexes.
- Timestamps.
- Proper data types.
- Relationships.
- Suitable deletion behaviour.

Avoid unnecessary duplicate data.

Design the database according to the complete booking workflow.

## Booking data

Store:

- User ID.
- Hotel ID.
- Room ID.
- Booking reference.
- Check-in date.
- Check-out date.
- Guest count.
- Room count.
- Price snapshot.
- Taxes and fees.
- Final booking amount.
- Booking status.
- Creation timestamp.

Preserve the agreed booking price in the booking record so future hotel price changes do not alter historical bookings.

## Database migrations

Create SQL migration files in:

```text
supabase/migrations/
```

Include:

- Table creation.
- Relationships.
- Constraints.
- Indexes.
- Functions if required.
- RLS policies.
- Seed data where appropriate.

Do not rely only on manually creating tables in the Supabase dashboard.

The migrations should make the database reproducible.

## Sample data

Create realistic sample data for:

- Destinations.
- Hotels.
- Rooms.
- Amenities.
- Reviews.

Use appropriate sample images or properly licensed image sources.

Clearly distinguish sample data from genuine provider inventory.

---

# 9. AUTHENTICATION, AUTHORIZATION AND SECURITY

Security is a major requirement.

## Supabase Authentication

Implement secure:

- Registration.
- Login.
- Logout.
- Session management.
- Password reset.
- Protected routes.

Use the recommended Supabase approach for the current Next.js App Router architecture.

## Row Level Security

Enable RLS on tables containing protected data.

Examples:

- Users can read and update their own profiles.
- Users can access their own bookings.
- Users can manage their own saved hotels.
- Users can access their own booking guests.
- Users cannot access another user's private information.
- Public users can read published hotel information.
- Only authorized administrators can manage hotel inventory.
- Only authorized administrators can manage bookings.

Test the policies rather than assuming they work.

## Admin authorization

Use a secure role-based authorization system.

Never trust a role value supplied by an ordinary user.

Do not allow users to grant themselves administrator access.

Protect sensitive operations on the server.

## Environment variables

Use:

```text
.env.local
.env.example
```

The `.env.example` file must contain placeholders only.

Never expose the Supabase service-role key in frontend code.

Never commit real credentials.

Never print secret values in logs or screenshots.

---

# 10. PROJECT ARCHITECTURE AND FOLDER STRUCTURE

Use a clean, feature-based architecture.

Suggested structure:

```text
tripnest—travel-booking-platform/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── docs/
│   └── MASTER_INSTRUCTIONS.md
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── destinations/
│   │   │   ├── hotels/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (user)/
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── saved-hotels/
│   │   │   └── profile/
│   │   │
│   │   ├── admin/
│   │   ├── booking/
│   │   ├── confirmation/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── common/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── destinations/
│   │   ├── hotels/
│   │   ├── rooms/
│   │   ├── bookings/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── saved-hotels/
│   │   └── admin/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── validations/
│   │
│   ├── hooks/
│   ├── types/
│   └── config/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── .env.example
├── .gitignore
├── README.md
├── ROADMAP.md
├── package.json
└── tsconfig.json
```

You may adjust this structure based on actual technical requirements.

Maintain consistency and avoid unnecessary restructuring.

## Architecture principles

- Keep UI components reusable.
- Separate business logic from presentation.
- Separate database operations from UI components.
- Use server components wherever appropriate.
- Use client components only when necessary.
- Keep types organized.
- Keep validation schemas organized.
- Avoid large, monolithic components.
- Avoid unnecessary code duplication.

---

# 11. CODING STANDARDS AND PERFORMANCE

Follow professional development practices.

## Coding standards

- Use TypeScript properly.
- Avoid unnecessary `any`.
- Use meaningful variable names.
- Keep functions focused.
- Keep components small.
- Follow React best practices.
- Follow Next.js App Router best practices.
- Handle errors properly.
- Validate user input.
- Use semantic HTML.
- Write maintainable code.
- Add comments where they genuinely improve understanding.

## Performance

Optimize:

- Images.
- Initial page loading.
- Database queries.
- Component rendering.
- API requests.
- Caching.
- Revalidation.
- Bundle size.

Use lazy loading where appropriate.

Avoid unnecessary client-side JavaScript.

Avoid excessive Supabase requests.

Use pagination for large lists.

Do not fetch unnecessary database fields.

---

# 12. TESTING AND QUALITY ASSURANCE

Testing must happen throughout development, not only at the end.

## General checks

Run available commands such as:

```bash
npm run lint
npm run typecheck
npm run build
```

Use the actual scripts defined in `package.json`.

If a script does not exist, explain before adding it.

## Functional testing

Test:

- Homepage.
- Navigation.
- Mobile menu.
- Destination search.
- Hotel search.
- Hotel filters.
- Sorting.
- Hotel details.
- Room selection.
- Date selection.
- Guest selection.
- Registration.
- Login.
- Logout.
- Password reset.
- Saved hotels.
- Booking workflow.
- Price calculations.
- Booking confirmation.
- Booking history.
- User profile.
- Admin access.
- Admin hotel management.
- Admin room management.
- Admin booking management.

## Security testing

Test:

- Unauthenticated access.
- User access restrictions.
- Admin authorization.
- RLS policies.
- Environment variable handling.
- Server-side validation.
- Invalid booking attempts.

## Responsive testing

Check:

- Desktop.
- Tablet.
- Mobile.
- 375px mobile width.

Test different screen sizes.

## Error states

Verify:

- Loading states.
- Empty states.
- Network errors.
- Invalid form submissions.
- Authentication errors.
- Database errors.
- Booking errors.

Do not mark a feature as complete just because the UI exists.

Verify that the functionality actually works.

---

# 13. GITHUB, DOCUMENTATION AND VERCEL DEPLOYMENT

Prepare the application for professional portfolio presentation.

## GitHub

Create a separate repository:

```text
tripnest-travel-booking-platform
```

Use my existing GitHub account:

```text
rojanaugustine999
```

Keep the existing Amazon repository unchanged.

Create meaningful commits after major phases.

Do not push code without my approval.

## README.md

Create a professional README containing:

- Project introduction.
- Project objectives.
- Main features.
- Technology stack.
- Screenshots.
- Folder structure.
- Installation instructions.
- Environment setup.
- Supabase setup.
- Database migrations.
- Running the application locally.
- Testing commands.
- Deployment instructions.

## Vercel

Prepare for deployment using Vercel.

Explain:

1. How to connect the GitHub repository.
2. How to import the TripNest project.
3. How to configure environment variables.
4. How to connect the Supabase project.
5. How to deploy.
6. How to verify the live application.
7. How to troubleshoot deployment errors.

Do not deploy without my approval.

---

# 14. DEVELOPMENT ROADMAP — 11 PHASES

Develop TripNest using the following 11 phases.

## Phase 1 — Project Inspection and Foundation

- Inspect the project directory.
- Check Node.js and npm.
- Set up Next.js.
- Configure TypeScript.
- Configure Tailwind CSS.
- Establish design tokens.
- Create base application layout.
- Create navigation.
- Create footer.
- Create 404 page.
- Initialize Git.
- Create README.
- Create roadmap.

The existing Phase 1 implementation has already been completed and committed.

Existing commit:

```text
326e04d
```

Do not overwrite or remove this checkpoint.

## Phase 2 — UI Foundation and Design System

- Refine design tokens.
- Establish colour system.
- Establish typography.
- Create reusable UI components.
- Create buttons.
- Create inputs.
- Create cards.
- Create badges.
- Create dialogs.
- Create dropdowns.
- Create navigation components.
- Create responsive layout components.
- Establish accessibility standards.

The objective is to create a consistent foundation for all future pages.

## Phase 3 — Public Website and Frontend

Build:

- Homepage.
- Destination listing.
- Destination details.
- Hotel listing.
- Hotel details.
- Search interface.
- Filters.
- Sorting.
- Responsive navigation.
- Footer.

Initially use realistic sample data.

Focus on completing the frontend experience.

## Phase 4 — Supabase Setup and Database

- Create the separate TripNest Supabase project.
- Configure environment variables.
- Configure Supabase clients.
- Design database.
- Create migrations.
- Create tables.
- Create relationships.
- Add indexes.
- Configure RLS.
- Add sample data.
- Verify database connectivity.

Guide me through manual Supabase setup.

## Phase 5 — Authentication and Authorization

Implement:

- Registration.
- Login.
- Logout.
- Password reset.
- User profiles.
- Authentication state.
- Protected routes.
- Server-side authorization.
- Role-based access foundations.

## Phase 6 — Hotel and Destination Data Integration

Connect public pages to Supabase.

Implement:

- Destination data.
- Hotel data.
- Hotel images.
- Amenities.
- Room information.
- Search queries.
- Filtering.
- Sorting.
- Pagination.
- Loading states.
- Empty states.
- Error handling.

## Phase 7 — Booking Workflow

Implement:

- Date selection.
- Guest selection.
- Room selection.
- Guest information.
- Booking validation.
- Availability validation.
- Price calculation.
- Booking creation.
- Booking confirmation.
- Booking reference.
- Demo booking status.

Do not implement real payments without approval.

## Phase 8 — User Dashboard

Implement:

- Dashboard overview.
- Profile management.
- Saved hotels.
- Booking history.
- Booking details.
- User account settings.

Ensure each user can only access their own information.

## Phase 9 — Admin Dashboard

Implement:

- Admin overview.
- Hotel management.
- Room management.
- Booking management.
- User management.
- Statistics.
- Charts.
- Admin authorization.

## Phase 10 — Security, Testing and Optimization

- Review database policies.
- Test RLS.
- Test authentication.
- Test authorization.
- Test booking functionality.
- Test responsive layouts.
- Fix bugs.
- Optimize images.
- Optimize database queries.
- Improve accessibility.
- Improve performance.
- Run lint.
- Run type checks.
- Run production build.

## Phase 11 — GitHub and Vercel Deployment

- Review the complete codebase.
- Prepare final README.
- Prepare screenshots.
- Verify `.gitignore`.
- Verify environment secrets.
- Create GitHub repository.
- Push code with my approval.
- Connect Vercel.
- Configure environment variables.
- Deploy.
- Verify the live application.

---

# 15. DEVELOPMENT RULES AND PHASE APPROVAL SYSTEM

I am learning React, Next.js and full-stack development.

Please explain technical work in simple English.

I want to understand what we are building, why we are building it and how each feature works.

## Before starting any phase

Explain:

1. Phase objective.
2. Tasks included.
3. Files expected to change.
4. Technologies involved.
5. Dependencies.
6. Testing strategy.
7. Expected result.

## During development

- Work only on the approved phase.
- Do not rush.
- Do not implement all phases together.
- Do not skip important tasks.
- Do not silently make major architectural decisions.
- Explain important commands.
- Preserve existing working features.
- Avoid unnecessary file modifications.
- Keep the application runnable.
- Verify implementation.

## After completing each phase

Provide:

1. Phase completion summary.
2. Features implemented.
3. Files created.
4. Files modified.
5. Important code explanations.
6. Commands executed.
7. Test results.
8. Errors fixed.
9. Remaining limitations.
10. Git status.
11. Commit information.
12. Instructions for manual verification.

Create a Git checkpoint after successful phase completion.

Do not push to GitHub automatically.

## Approval system

Follow this strict sequence:

Phase 1 → Complete → Test → Commit → Approval.

Phase 2 → Complete → Test → Commit → Approval.

Phase 3 → Complete → Test → Commit → Approval.

Continue in the same way until Phase 11.

**Never automatically proceed to the next phase.**

Only proceed when I explicitly approve.

If I ask questions, request explanations or share screenshots, do not interpret that as approval to start the next phase.

## Final quality expectations

The completed TripNest application must be:

- Professional.
- Responsive.
- Functional.
- Secure.
- Maintainable.
- Well structured.
- Easy to navigate.
- Portfolio ready.
- Suitable for demonstrating my React and Next.js skills.

Avoid building only static screens that look functional but have no working logic.

Use realistic data, proper validation and meaningful user interactions.

Clearly identify features that are simulated rather than genuinely integrated.

---

# FINAL INSTRUCTION TO CLAUDE CODE

Read and understand this complete Master Project Instructions document.

Use it as the main reference throughout the entire TripNest development process.

Compare every requirement with the existing `ROADMAP.md`.

Update the roadmap if any requirements are missing or inconsistent.

Preserve the completed Phase 1 implementation and commit:

```text
326e04d
```

If roadmap changes are necessary, commit them separately without modifying the Phase 1 commit.

After reviewing the roadmap:

1. Show the complete updated 11-phase roadmap.
2. Explain any changes.
3. Confirm the Git status.
4. Confirm the Phase 1 checkpoint is preserved.
5. Explain what Phase 2 will involve.

**Do not start Phase 2 until I explicitly approve it.**

The immediate objective is to establish a complete, accurate project plan before continuing development.