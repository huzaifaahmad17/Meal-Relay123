# Meal Relay

> Food rescue platform for India — connecting restaurants, NGOs and volunteers in real time.

[![Next.js 13](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06b6d4)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Meal Relay is a polished, production-style web app that connects donors (restaurants, hotels, weddings, home kitchens) with verified NGOs and volunteers — so surplus food gets rescued in minutes instead of being thrown away.

It ships in two tiers:

1. **Demo mode (default)** — fully client-side. No backend, no MongoDB, no API keys needed. Auth, donations, chat, map, dashboards and AI features all work against an in-memory store backed by `localStorage`. Perfect for presentations, demos, hackathons, or shipping a static deploy.
2. **Server mode (optional)** — an Express + MongoDB + Socket.io backend ships in `/server` for when you want a real database, real auth, and real WebSockets.

---

## Highlights

- **4 role-based dashboards** — Donor, NGO, Volunteer, Admin — each with their own KPIs, charts, AI insights and workflows
- **Real photo uploads with AI freshness analysis** — drop a photo into the donation form, the simulated vision pipeline returns category, freshness %, shelf life, spoilage risk, and a smart NGO match
- **Live interactive map** — Leaflet + OpenStreetMap with custom markers for donors, NGOs, volunteers and donations, plus an animated truck following live in-transit deliveries
- **Real-time chat** — rooms, online indicators, read receipts, simulated bot replies, message persistence
- **Dynamic analytics** — Recharts dashboards with food waste trends, category breakdowns, NGO leaderboard, operational health radar
- **Smart actions that propagate live** — accepting a donation as an NGO instantly updates the donor's dashboard, the volunteer's task list, and the live map
- **Polished, responsive UI** — built with Tailwind, shadcn/ui, dark mode, custom Leaflet markers, gradient cards, sticky topbars
- **Cohesive Jaipur context** — fictional Jaipur neighborhoods, Jaipur Food Bank, Robin Hood Army, Akshaya Patra, Annamrita, and restaurant partners

---

## Quick start

```bash
# Install
npm install

# Run the demo (no backend required)
npm run dev:client

# Open
http://localhost:3000
```

That's it. The app is fully functional in demo mode.

### Demo credentials

Sign in on `/auth/login` — there are one-click autofill buttons for each role:

| Role       | Email                            | Password    |
| ---------- | -------------------------------- | ----------- |
| Donor      | `priya@tajpalace.com`            | `demo1234`  |
| NGO        | `contact@jaipurfoodbank.org`     | `demo1234`  |
| Volunteer  | `amit.k@volunteer.com`           | `demo1234`  |
| Admin      | `admin@mealrelay.org`            | `admin1234` |

You can also tap a credential card on the login page to auto-fill it.

### Optional: run the Express + MongoDB backend

```bash
# In one terminal
npm run dev:server

# In another
npm run dev:client

# Or both together
npm run dev
```

You'll need MongoDB running locally (or a connection string in `.env`). The frontend will fall back to demo mode if the backend is unreachable, so you never see a broken page.

---

## Try it in 60 seconds

1. **Sign in as a Donor** (one-click on the login page)
2. Click **"New donation"** in the sidebar (or top-right)
3. Upload a real photo of food → watch the **AI freshness analysis** appear
4. Pick a city + area → publish
5. Open **"Live map"** in the sidebar — your new donation appears as a marker at the city you picked
6. Sign out → sign in as **Jaipur Food Bank** → your donation is in the **smart-matched donations** list
7. Click **Accept** → sign in as **Amit Kumar (volunteer)** → click **Claim** → advance the status
8. Watch the donation flow through every dashboard live, in real time

---

## Features in detail

### Donor experience
- Hero KPI grid (donations, food rescued, meals provided, CO₂ saved)
- 14-day food waste trend chart
- Impact score card with badges
- AI insights panel (pickup window predictions, milestones)
- Active deliveries with chat & track buttons
- Activity feed
- Full donation history at `/dashboard/donations`

### NGO experience
- Pending donations queue with **one-click accept** + **auto-assign volunteer**
- Smart matching with capacity awareness
- Volunteer roster at `/ngo/dashboard/volunteers` with vehicle filter, online status, ratings
- Distribution analytics
- AI capacity predictions

### Volunteer experience
- Active pickups with **status advancement** (assigned → picked up → in transit → delivered)
- Available pickups to claim
- AI route optimization insights
- Live navigation links
- Earnings + rating tracker

### Admin experience
- Full system metrics with health indicators
- Users management at `/admin/dashboard/users`
- All donations at `/admin/dashboard/donations`
- NGO partner directory at `/admin/dashboard/ngos`
- Anomaly detection insights
- City heat map, category pie, status pipeline

### Live map (`/map`)
- 4 filter tabs: All / Donations / Donors / NGOs / Volunteers
- 3 tile styles (light / dark / streets)
- Custom pulsing markers
- **Animated truck** that follows the in-transit donation's polyline route
- Click any marker → side panel with full details
- Updates the moment a donation is created elsewhere

### Real-time chat (`/chat`)
- Room list with unread badges
- Message bubbles with avatars, timestamps, read receipts
- Online status dots
- Simulated counterparty replies (so the demo feels alive)
- Persists across reloads

### Analytics (`/analytics`)
- 30-day food rescue trend
- Food category mix pie chart
- Donations by city horizontal bar chart
- NGO leaderboard
- Operational health radar
- Status pipeline cards

### AI features
- **Vision analysis** on donation form: drop a photo → freshness %, shelf life hours, spoilage risk, detected category, CO₂ savings, smart NGO match (`lib/ai.ts`)
- **Smart insights** on every dashboard, role-aware (`components/dashboard/ai-insights.tsx`)
- **Auto-categorization** of cuisine and food type from descriptions
- **Demand forecasting** for NGO capacity planning (mocked)
- **Route optimization** insight for volunteers (mocked)

---

## Architecture

### Frontend (Next.js 13 App Router)

```
app/
├── page.tsx                    # Polished landing page
├── donate/                     # Donation flow + form
├── auth/                       # Login + register
├── dashboard/                  # Donor dashboard + sub-pages
├── ngo/dashboard/              # NGO dashboard + donations + volunteers
├── volunteer/dashboard/        # Volunteer dashboard + tasks
├── admin/dashboard/            # Admin + users + donations + ngos
├── map/                        # Interactive Leaflet map
├── chat/                       # Real-time chat
├── analytics/                  # Recharts dashboards
└── api/                        # Optional Next.js API proxies

components/
├── site-shell.tsx              # Public top nav + footer
├── dashboard-shell.tsx         # Sidebar + topbar (auth-aware)
├── live-map.tsx                # Leaflet map with animated truck
├── donation-form.tsx           # 3-step form with AI image analysis
├── theme-provider.tsx          # next-themes wrapper (dark mode)
├── brand-mark.tsx              # Logo + wordmark
└── dashboard/
    ├── stat-card.tsx           # KPI tile
    ├── donation-card.tsx       # Donation row card
    ├── donations-list.tsx      # Filterable donations table
    └── ai-insights.tsx         # Role-aware AI insights panel

lib/
├── types.ts                    # Shared domain types
├── seed-data.ts                # Realistic Indian seed: users, donations, chats
├── demo-store.ts               # Pub/sub store + CRUD + auth (localStorage)
├── use-demo-store.ts           # React hooks (useDemoStore, useCurrentUser)
├── ai.ts                       # Simulated AI helpers
└── api.ts                      # Optional Express backend client

server/                         # Optional Express + MongoDB backend
├── index.js                    # Express + Socket.io entrypoint
├── models/                     # Mongoose models
├── routes/                     # REST endpoints
└── middleware/                 # Auth middleware
```

### Demo store

The heart of the demo experience is `lib/demo-store.ts`. It's a tiny pub/sub state container:

- **State** lives in memory and persists to `localStorage` on every mutation
- **Selectors** (`getDonationsByDonor`, `getNotificationsForUser`, …) read from state
- **Mutations** (`createDonation`, `updateDonationStatus`, `sendMessage`, …) update state and call `notify()`
- **`subscribe(listener)`** lets components register for updates
- **`useDemoStore(selector, fallback)`** is a React hook that re-renders on every notification

Because everything goes through the same store, accepting a donation as an NGO instantly propagates to the donor dashboard, the volunteer task list, the map, and the activity feed — without any API calls.

### Tech stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Framework        | Next.js 13 (App Router)                  |
| UI               | React 18 + TypeScript                    |
| Styling          | Tailwind CSS + shadcn/ui + Radix UI      |
| Charts           | Recharts                                 |
| Maps             | Leaflet + OpenStreetMap (no API key)     |
| Icons            | Lucide React                             |
| Theming          | next-themes                              |
| Notifications    | Sonner                                   |
| Backend (opt.)   | Express + Socket.io + MongoDB + JWT      |

---

## Scripts

```bash
npm run dev          # Run client + server concurrently
npm run dev:client   # Just the Next.js frontend (demo mode)
npm run dev:server   # Just the Express backend
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

---

## Project status

| Item | Status |
| --- | --- |
| Landing page | ✅ Polished hero, features, stories, CTA |
| Auth (login/register) | ✅ Demo credentials, role picker |
| Donor dashboard + donations list | ✅ |
| NGO dashboard + donations + volunteers | ✅ |
| Volunteer dashboard + tasks | ✅ |
| Admin dashboard + users + donations + ngos | ✅ |
| Live Leaflet map with animated tracking | ✅ |
| Real-time chat with rooms | ✅ |
| Analytics with charts | ✅ |
| AI freshness analysis on donation form | ✅ |
| AI insights on all dashboards | ✅ |
| Dark mode | ✅ |
| Mobile responsive | ✅ |
| Offline demo mode | ✅ |
| Production build | ✅ All routes pass `next build` |

---

## License

MIT — see [LICENSE](LICENSE).

Built for a hunger-free India.
