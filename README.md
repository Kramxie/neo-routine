# Neo Routine

> **Redesigning habits. One drop at a time.**

Neo Routine is a habit-building platform that converts long-term goals into daily "drops". Progress is visualized as calm ripples (no streak pressure), with adaptive reminders based on user compliance.

## 🌊 Philosophy

- **Drops, not streaks**: Each completed task is a drop in your progress pool. Miss one? The water stays.
- **Ripple progress**: See your progress as gentle ripples expanding outward.
- **Adaptive reminders**: Struggling? Softer reminders. Thriving? Gradual progression.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (no TypeScript)
- **Styling**: TailwindCSS + custom water/ripple animations
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT sessions stored in httpOnly cookies

## 📁 Project Structure

```
neo-routine/
├── app/
│   ├── (public)/           # Public pages (landing, auth)
│   │   ├── page.js         # Landing page
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── (app)/              # Protected app pages
│   │   └── dashboard/page.js
│   ├── api/                # API routes
│   │   ├── health/route.js
│   │   ├── auth/
│   │   ├── routines/
│   │   └── checkins/
│   └── layout.js           # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components (Navbar, Footer)
├── lib/                    # Utilities and helpers
│   ├── db.js              # MongoDB connection
│   ├── auth.js            # JWT helpers
│   └── validators.js      # Input validation
├── models/                 # Mongoose models
├── public/                 # Static assets
└── styles/
    └── globals.css         # Tailwind + custom CSS
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/neo-routine.git
   cd neo-routine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/neo-routine
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Verify Installation

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "message": "Neo Routine API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

## 📋 Development Phases

- [x] **Phase 1**: Next.js scaffolding + Tailwind + DB connection + health endpoint + base layout + Landing
- [ ] **Phase 2**: Auth (register/login/logout/me) + UI pages + protected dashboard routing
- [ ] **Phase 3**: Routines CRUD + Dashboard interactions + check-ins + ripple UI + micro-messages
- [ ] **Phase 4**: Adaptive reminder logic improvements
- [ ] **Phase 5**: Subscription model (basic DB fields + gated features)
- [ ] **Phase 6**: Coach/Influencer white-label basics

## 🎨 Design System

### Colors

| Name | Value | Usage |
|------|-------|-------|
| `neo-500` | `#0ea5e9` | Primary brand color |
| `neo-100` | `#e0f2fe` | Light backgrounds |
| `calm-800` | `#1e293b` | Text color |
| `calm-100` | `#f1f5f9` | Subtle backgrounds |

### Components

- `Button`: Primary and secondary variants with hover states
- `Card`: Soft shadow with rounded corners
- `Input`: Neo-styled with focus states
- `RippleProgress`: Animated progress visualization

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/routines` | Get user routines |
| POST | `/api/routines` | Create routine |
| PATCH | `/api/routines/:id` | Update routine |
| DELETE | `/api/routines/:id` | Archive routine |
| POST | `/api/checkins` | Create check-in |
| GET | `/api/checkins/today` | Get today's check-ins |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 💧 by the Neo Routine team
