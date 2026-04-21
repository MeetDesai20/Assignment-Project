# Ethereal Ledger - Frontend Page Structure & Setup

## 📁 Page Structure

The frontend is organized into 5 main categories, following the design system and user flows:

### 🔐 **Auth Pages** (`src/pages/auth/`)
- **LoginPage.jsx** - User login with email/password form
- **SignupPage.jsx** - New user registration with full name, email, password confirmation

### 🏠 **Public Pages** (`src/pages/public/`)
- **HomePage.jsx** - Landing page with hero section, features, and CTAs

### 👤 **User Pages** (`src/pages/user/`)
- **DashboardPage.jsx** - Main user hub with overview, navigation, quick stats, and key information
- **ScoreEntryPage.jsx** - Dedicated golf score recording form with validation and history
- **DrawsPage.jsx** - Monthly draw results display with prize breakdown and previous draws
- **PhilanthropyPage.jsx** - Charity selection interface with contribution tracking

### 👨‍💼 **Admin Pages** (`src/pages/admin/`)
- **AdminDashboardPage.jsx** - Admin hub with user management, draw control, winner verification, charity management

## 🛣️ Routing

All routes are configured in `src/App.jsx`:

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Requires Authentication)
- `/dashboard` - User dashboard
- `/score-entry` - Score entry form
- `/draws` - Draw results
- `/charity` - Philanthropy/charity selection
- `/admin` - Admin dashboard (admin role required)

## 🎨 Design System Integration

All pages follow the Ethereal Ledger design system:

- **Glassmorphism** components with backdrop blur
- **Surface layering** with primary, container, and container-low backgrounds
- **Neon accent colors**: Primary (#81ecff), Secondary (#cdbdff), Tertiary (#9effc8)
- **Material Design 3** icons via `material-symbols-outlined`
- **Responsive design** with Tailwind breakpoints (md: 768px)
- **Custom tokens** from `tailwind.config.js`

## 🔄 Context & State Management

### AuthContext (`src/context/AuthContext.jsx`)
Manages:
- User authentication state
- Login/signup/logout flows
- JWT token management with localStorage
- Auto-injection of auth headers via axios interceptor
- Current user object

### UserContext (`src/context/UserContext.jsx`)
Manages:
- User profile data
- Subscription information
- Golf scores (last 5)
- Charity selection
- Methods: fetchUserProfile(), fetchSubscription(), fetchScores(), addScore()

## 📚 Component Library

All pages use reusable components from `src/components/`:

### Common Components
- **Button** - Primary/secondary/ghost/tertiary variants with icons
- **Card** - Base container with optional glow effect
- **Input** - Text/email/password/date inputs with icons and error states
- **Badge** - Status indicators with variants
- **ProgressTracker** - Visual progress with labels
- **SelectChip** - Chip-based selection interface
- **Modal** - Dialog component for confirmation/forms

### Layout Components
- **Header** - Navigation header with title and actions
- **Sidebar** - Navigation sidebar with active state

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your backend URL and configuration:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_STORAGE_KEY=ethereal_ledger_token
```

### Development Server

```bash
npm start
```

The app will open at `http://localhost:3000` with hot reload enabled.

## 📋 Page Implementation Details

### LoginPage
- Email/password form with validation
- "Remember me" functionality (TODO)
- Link to signup
- Error handling with visual feedback
- Redirects to `/dashboard` on success

### SignupPage
- Full name, email, password fields
- Password confirmation validation
- Terms of service acceptance (TODO)
- Form validation before submission
- Redirects to `/dashboard` on success

### HomePage
- Hero section with value proposition
- Statistics display (10K+ players, $500K+ pool, 50+ charities)
- Features grid (Track Performance, Win Prizes, Support Charity)
- CTA section
- Navigation to login/signup

### DashboardPage
- Multi-section hub:
  - **Overview** - Subscription status, latest score, total winnings
  - **Scores** - Last 5 scores with date and Stableford points
  - **Draws** - Current draw winning numbers and prize pool
  - **Charity** - Selected charity and monthly contribution tracking
  - **Settings** - Account info and profile management
- Sidebar navigation between sections
- User greeting in header

### ScoreEntryPage
- Form fields:
  - Score value (1-45 Stableford format)
  - Date of play (date picker)
  - Course name
  - Number of holes (9/18 selector)
  - Stableford points (optional, auto-calculated)
- Validation before submission
- Recent scores sidebar showing last entries
- Success/error messaging

### DrawsPage
- **Current Draw Section**:
  - Winning numbers displayed prominently
  - Prize breakdown by match type (5/4/3 numbers)
  - Prize pool progress tracker
- **Previous Draws**: List of past draws with results
- **Draw Rules**: Info card explaining how draws work

### PhilanthropyPage
- Impact summary (monthly/annual/count)
- Charity selection grid with cards:
  - Logo/image
  - Description
  - Website link
  - Featured badge
  - Selected state indicator
- Contribution percentage slider (10-100%)
- Monthly contribution calculator
- Impact stories section

### AdminDashboardPage
- Tab-based interface:
  - **Overview** - Key metrics, quick actions
  - **Users** - User table with search, subscription status
  - **Draws** - Create/edit draws, status management
  - **Winners** - Winner verification workflow, pending approvals
  - **Charities** - CRUD for charities, active/inactive toggle

## 🔗 API Integration

All pages connect to backend APIs via `src/utils/apiClient.js`:

### Key Endpoints Used

**Authentication**
- `POST /api/auth/signup` - New user registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user (protected)

**Users**
- `GET /api/users/profile` - User profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

**Scores**
- `POST /api/scores` - Add new score (protected)
- `GET /api/scores` - Get user's scores (protected)

**Charities**
- `GET /api/charities` - List all charities
- `GET /api/charities/:id` - Get charity details

**Draws**
- `GET /api/draws/current` - Current month's draw
- `GET /api/draws/:id/results` - Draw results

## ✨ Features Implemented

✅ Authentication flow (login/signup/logout)
✅ Protected routes with role-based access
✅ Responsive design (mobile-first)
✅ Design system consistency
✅ Form validation and error handling
✅ Context-based state management
✅ Auto JWT token injection
✅ Loading states
✅ Success/error notifications
✅ Sidebar navigation
✅ Admin dashboard with tabs

## 🛠️ Troubleshooting

**Pages not loading?**
- Check that backend is running on the correct port
- Verify `.env.local` has correct `REACT_APP_API_URL`
- Clear browser cache and reload

**Authentication issues?**
- Check LocalStorage for `ethereal_ledger_token`
- Verify JWT token is valid in browser console
- Check backend logs for authentication errors

**Styling issues?**
- Ensure Tailwind CSS is built: `npm run build:css`
- Check that `tailwind.config.js` is in project root
- Verify `src/index.css` contains Tailwind directives

## 📦 Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## 📝 Notes

- All pages follow the design system from `tailwind.config.js`
- Components are imported from `src/components/index.js`
- State management uses React Context + custom hooks
- API calls use axios with auto-authentication
- Responsive design uses Tailwind breakpoints
- Material Design 3 icons for consistency

---

**Ready to extend?** Add new pages to `src/pages/` directory and update routing in `src/App.jsx`.
