# 🚀 FreelanceHub - Mini Upwork Clone

A full-stack freelance marketplace built with Next.js 14, Clerk, MongoDB, Socket.io, and Stripe.

## Tech Stack
- **Framework**: Next.js 14 (App Router, JSX)
- **Auth**: Clerk
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Payments**: Stripe (Test Mode + Escrow)
- **UI**: shadcn/ui + Tailwind CSS
- **Email**: Resend

## Features
- ✅ Role-based auth (Client / Developer)
- ✅ Project posting & bidding
- ✅ Real-time chat (Socket.io)
- ✅ Escrow payment logic (Stripe manual capture)
- ✅ Ratings & reviews
- ✅ Admin moderation panel

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Copy `.env.local` and fill in your keys:
```bash
cp .env.local .env.local
```

### 3. Clerk Setup
1. Go to [clerk.com](https://clerk.com) and create a new app
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. In Clerk Dashboard → Webhooks → Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

### 4. MongoDB Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create free cluster
2. Get connection string → Add to `MONGODB_URI`

### 5. Stripe Setup
1. Go to [stripe.com](https://stripe.com) → Test mode keys
2. Copy publishable + secret keys
3. For webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 6. Resend Setup (Email)
1. Go to [resend.com](https://resend.com) → Get API key
2. Add to `RESEND_API_KEY`

### 7. Run Development Server
```bash
npm run dev
```
App runs at http://localhost:3000

---

## 📁 Project Structure
```
/app
  /(auth)           → Clerk sign-in/sign-up pages
  /(dashboard)      → Protected dashboard routes
    /client         → Client-specific pages
    /developer      → Developer-specific pages
    /contracts      → Contract management
    /messages       → Real-time chat
    /reviews        → User reviews
  /admin            → Admin moderation panel
  /api              → API routes
  /onboarding       → Role selection
/components
  /ui               → shadcn/ui components
  /shared           → Shared components
  /client           → Client-specific components
  /developer        → Developer-specific components
  /admin            → Admin components
/models             → Mongoose schemas
/lib                → Utilities (db, stripe, email)
/hooks              → React hooks
server.js           → Custom server with Socket.io
```

---

## 💳 Escrow Payment Flow
1. Client posts project → Developer bids
2. Client accepts bid → Contract created
3. Client pays → `PaymentIntent` with `capture_method: "manual"` (funds held)
4. Work delivered → Client releases → `/api/payments/capture` triggers capture
5. Dispute/cancel → `/api/payments/cancel` refunds

## 🔐 Admin Access
Set user role to `admin` in Clerk's `unsafeMetadata`:
```json
{ "role": "admin" }
```
Then navigate to `/admin`
