# Digital Heroes

A full-stack golf membership platform that combines Stableford score tracking, monthly prize draws, and charitable giving into a single experience.

Digital Heroes allows members to track their latest golf scores, choose a charity, contribute a percentage of their membership fee, and participate in monthly prize draws. Administrators can manage members, subscriptions, charities, draws, winners, verification, payouts, and analytics from a dedicated admin portal.

---

## Overview

Digital Heroes is designed around a simple idea:

> Play golf. Support a cause. Get a chance to win.

Members maintain their latest five Stableford scores, select a charity, choose their contribution percentage, and participate in monthly draws when eligible.

The platform includes separate experiences for members and administrators, with Supabase providing authentication, database, row-level security, storage, and server-side business logic.

---

## Features

### Member Experience

- Secure signup and login
- Personal member dashboard
- Monthly and yearly membership plans
- Test-mode subscription activation and cancellation
- Stableford score management
- Score validation from 1–45
- One score per date
- Latest 5 scores used for draw eligibility
- Historical score archive
- Charity directory
- Charity search and filtering
- Charity selection
- Adjustable charity contribution percentage
- Minimum 10% charity contribution
- Monthly draw results
- Winnings history
- Winner verification workflow
- Private winner-proof uploads
- Payout status tracking

### Monthly Prize Draw

- Monthly draws
- Random draw mode
- Algorithmic draw mode
- Five winning numbers
- Numbers generated from 1–45
- 5-match, 4-match, and 3-match prize tiers
- Multiple winners split the corresponding tier equally
- 5-match jackpot rollover
- Admin draw simulation
- Admin draw publishing
- Published results visible to members

### Admin Portal

Dedicated admin interface with:

- Analytics
- User management
- Subscription management
- Score management
- Charity management
- Draw management
- Winner management
- Winner proof verification
- Payout tracking

Administrators can create, simulate, and publish draws and manage the complete winner verification and payout lifecycle.

---

## Prize Structure

The draw uses three match tiers:

| Match | Prize Pool Allocation |
|-------|------------------------|
| 5 numbers | 40% |
| 4 numbers | 35% |
| 3 numbers | 25% |

If multiple members achieve the same match level, that tier is divided equally between the winners.

If there is no 5-number winner, the corresponding jackpot amount rolls over to the next draw.

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- Radix UI

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security (RLS)
- Supabase Storage
- PostgreSQL functions / RPCs

### Development

- Vite
- ESLint
- Prettier
- Git / GitHub

### Deployment

- Vercel
- Supabase

---

## Architecture

```text
                         ┌──────────────────────┐
                         │      Digital Heroes  │
                         │      Web Client      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ React + TanStack     │
                         │ Router + Query       │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
              ┌─────────────┐              ┌─────────────┐
              │   Services  │              │    Hooks    │
              │             │              │             │
              │ Scores      │              │ useScores   │
              │ Charity     │              │ useProfile  │
              │ Draws       │              │ useDraws    │
              │ Winners     │              │ useWinners  │
              │ Admin       │              │ etc.        │
              └──────┬──────┘              └──────┬──────┘
                     │                            │
                     └─────────────┬──────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │       Supabase       │
                         │                      │
                         │ Auth                 │
                         │ PostgreSQL           │
                         │ RLS                  │
                         │ Storage              │
                         │ RPC Functions        │
                         └──────────────────────┘
