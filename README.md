# FreelanceHub 🚀

A full-stack freelance marketplace platform built with **Next.js 14**, **MongoDB**, **Stripe**, and **Socket.io** — connecting clients with developers for project-based work.

![FreelanceHub](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blue?style=for-the-badge&logo=stripe)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge)

---

## 📸 Features Overview

### 👤 Three Role System
- **Client** — Post projects, hire developers, manage contracts
- **Developer** — Browse projects, submit bids, earn money
- **Admin** — Manage users, projects, and view platform stats

### 💼 Core Features
- ✅ Role-based authentication with **Clerk**
- ✅ Project posting with category, budget, and skill tags
- ✅ Bid system — developers submit proposals with price & delivery time
- ✅ Contract creation when bid is accepted
- ✅ **Escrow payment system** via Stripe (Fund → Hold → Release)
- ✅ **Real-time chat** between client and developer (Socket.io)
- ✅ **Notification system** with bell icon and unread badges
- ✅ **Reviews & ratings** after contract completion
- ✅ **Public developer profiles** with skills, bio, portfolio
- ✅ **Admin panel** — ban users, delete projects, view revenue stats
- ✅ **Browse & filter projects** by category, budget, and sort order

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Authentication | Clerk |
| Database | MongoDB Atlas + Mongoose |
| Payments | Stripe (Manual Capture / Escrow) |
| Real-time | Socket.io |
| Styling | Tailwind CSS + shadcn/ui |
| File Uploads | Uploadthing |
| Email | Resend |
| Language | JavaScript |

---

## 📁 Project Structure

```
freelance-marketplace/
├── app/
│   ├── (auth)/                  # Sign in / Sign up pages
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin panel
│   │   ├── client/              # Client-specific pages
│   │   ├── contracts/           # Contract details
│   │   ├── dashboard/           # Main dashboard
│   │   ├── developer/           # Developer pages (browse, bids)
│   │   ├── messages/            # Chat rooms
│   │   ├── profile/             # User profiles
│   │   └── reviews/             # Reviews system
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin APIs
│   │   ├── bids/                # Bid management
│   │   ├── contracts/           # Contract management
│   │   ├── messages/            # Chat messages
│   │   ├── notifications/       # Notification system
│   │   ├── payments/            # Stripe payment flow
│   │   ├── projects/            # Project CRUD
│   │   ├── reviews/             # Reviews API
│   │   └── user/                # User profile API
│   └── onboarding/              # Role selection page
├── components/
│   ├── admin/                   # Admin panel components
│   └── shared/                  # Shared UI components
├── lib/
│   ├── db.js                    # MongoDB connection
│   ├── stripe.js                # Stripe client
│   ├── resend.js                # Email client
│   └── socket-client.js         # Socket.io client
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── Project.js
│   ├── Bid.js
│   ├── Contract.js
│   ├── Message.js
│   ├── Notification.js
│   └── Review.js
└── server.js                    # Custom Socket.io server
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Stripe account
- Resend account (optional, for emails)
- Uploadthing account (optional, for file uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/ARYANKADAM/freelance-marketplace.git
cd freelance-marketplace
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# MongoDB
MONGODB_URI=mongodb+srv://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Uploadthing (optional)
UPLOADTHING_TOKEN=...

# Resend (optional)
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
```

### 3. Run the Development Server

> ⚠️ **Important:** You must use the custom server for real-time chat to work.

```bash
# Run with Socket.io support
node server.js

# OR standard Next.js (chat won't work in real-time)
npm run dev
```

### 4. Set Up Stripe Webhooks (optional)

Install Stripe CLI and run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 👥 User Roles Setup

### Client & Developer
- Sign up and select your role on the onboarding page (`/onboarding`)
- Role is saved to both Clerk metadata and MongoDB

---

## 💳 Payment Flow

FreelanceHub uses **Stripe manual capture** (escrow) for secure payments:

```
1. Client posts project
2. Developer submits bid
3. Client accepts bid → Contract created
4. Client clicks "Fund Escrow" → Stripe holds the money
5. Developer completes work
6. Client clicks "Release Payment" → Stripe captures and transfers
7. Both parties can leave reviews
```

> In test mode, payments use `pm_card_visa` test card — no real money moves.

---

## 🔄 Real-time Features

Real-time chat uses **Socket.io** with these events:

| Event | Description |
|-------|-------------|
| `join_room` | User joins a chat room |
| `leave_room` | User leaves a chat room |
| `send_message` | Send a message |
| `receive_message` | Receive a message |
| `user_typing` | Typing indicator start |
| `user_stop_typing` | Typing indicator stop |

---

## 🗃️ Database Models

| Model | Description |
|-------|-------------|
| `User` | Clerk ID, role, bio, skills, earnings |
| `Project` | Title, description, budget, category, status |
| `Bid` | Developer proposal with price and timeline |
| `Contract` | Active agreement between client and developer |
| `Message` | Chat messages linked to a contract room |
| `Notification` | In-app notifications for bids, messages, payments |
| `Review` | Star rating and comment after contract completion |

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub, import in Vercel
# Add all environment variables in Vercel dashboard
```

### Socket.io Server (Railway)
```bash
# Create new project on Railway
# Connect GitHub repo
# Set start command: node server.js
# Add environment variables
```

### Database (MongoDB Atlas)
- Create a free cluster at [mongodb.com](https://mongodb.com)
- Whitelist all IPs (`0.0.0.0/0`) for production
- Add `MONGODB_URI` to environment variables

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| `/dashboard` | Role-specific dashboard with stats |
| `/developer/projects` | Browse & filter open projects |
| `/contracts/:id` | Contract details with payment actions |
| `/messages/:roomId` | Real-time chat with file attachments |
| `/profile` | Editable user profile with skills |
| `/reviews` | Give and receive reviews |
| `/admin` | Admin panel with platform stats |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — React framework
- [Clerk](https://clerk.com/) — Authentication
- [MongoDB Atlas](https://www.mongodb.com/) — Database
- [Stripe](https://stripe.com/) — Payment processing
- [Socket.io](https://socket.io/) — Real-time communication
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — Styling

---

<p align="center">Built with ❤️ by Aryan Kadam</p>
