# ScrapAI - AI-Powered Waste Management Platform

## 🌟 Features

### Core Functionality
- **Complete Waste Management Workflow**: Report → Collect → Verify → Rewards → Leaderboard
- **AI-Powered Waste Reporting**: Report waste with image verification using Google Gemini AI
- **Two-Step Verification System**: 
  - Report verification (before submission)
  - Collection verification (after collection)
- **Web3Auth Integration**: Secure blockchain-based authentication
- **Rewards System**: Earn points for reporting (10-15) and collecting (25) waste
- **Real-time Dashboard**: Track your environmental impact and statistics
- **Dynamic Leaderboard**: Real-time rankings based on user performance
- **Collection Management**: Manage waste collection tasks
- **Multi-language Support**: Internationalization with translation service

### Design & UX
- **Modern UI**: Clean, responsive design with dark/light themes
- **Glassmorphism Effects**: Premium frosted glass aesthetic
- **Smooth Animations**: Framer Motion powered transitions
- **Mobile-First**: Optimized for all device sizes
- **Accessibility**: WCAG compliant with proper ARIA labels

### Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety across the application
- **Redux Toolkit**: State management for UI and authentication
- **Web3Auth**: Solana blockchain authentication
- **Neon Database**: Serverless PostgreSQL with Drizzle ORM
- **Tailwind CSS**: Utility-first styling with custom components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with ES2020 support

### Installation

```bash
# Clone the repository
git clone https://github.com/CodeCraftman2/Waste-Management-AI.git
cd ScrapAI

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your-web3auth-client-id
NEXT_PUBLIC_WEB3AUTH_NETWORK=sapphire_devnet

# Database Configuration
DATABASE_URL=your-neon-database-url

# Google AI (for waste detection)
GOOGLE_AI_API_KEY=your-google-ai-key

# Google Maps (for location services)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🔄 Complete Workflow

### Report → Collect → Verify → Rewards → Leaderboard

The application implements a complete circular economy for waste management:

#### 1. **Report Page** (`/report`)
- **Purpose**: Submit waste reports with AI verification
- **Process**: 
  - Upload waste image
  - AI analyzes image (Google Gemini)
  - Auto-fills waste type and quantity
  - Submit report with verification
- **Rewards**: 10 points (pending), 15 points (verified)
- **Database**: Creates record in `Reports` table

#### 2. **Collect Page** (`/collect`)
- **Purpose**: Find and accept waste collection tasks
- **Data Source**: Pulls from `Reports` table (pending reports)
- **Process**:
  - Browse available collection tasks
  - Accept task (changes status to 'in_progress')
  - Navigate to location
- **Next Step**: Go to Verify page for completion

#### 3. **Verify Page** (`/verify`)
- **Purpose**: Verify collected waste matches original report
- **Process**:
  - Upload photo of collected waste
  - AI compares with original report
  - Verify waste type and quantity match
  - Complete verification
- **Rewards**: 25 points upon successful verification
- **Database**: Updates report status to 'verified'

#### 4. **Rewards Page** (`/rewards`)
- **Purpose**: Manage earned points and redemptions
- **Features**:
  - View total points balance
  - Transaction history
  - Redeem points for rewards
- **Data Source**: `Transactions` table

#### 5. **Leaderboard Page** (`/leaderboard`)
- **Purpose**: Show user rankings and competition
- **Features**:
  - Real-time rankings by points
  - User statistics (reports, collections)
  - Personal rank and progress
- **Data Source**: Calculated from `Transactions` table

### Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   REPORT    │───▶│   COLLECT    │───▶│   VERIFY    │───▶│   REWARDS    │───▶│ LEADERBOARD │
│             │    │              │    │             │    │              │    │             │
│ • Submit    │    │ • Start      │    │ • Upload    │    │ • Earn       │    │ • Rankings  │
│ • AI Verify │    │   Collection │    │   Photo     │    │   Points     │    │ • Compare   │
│ • +10 pts   │    │ • Change     │    │ • AI Match  │    │ • Redeem     │    │ • Compete   │
│             │    │   Status     │    │ • Complete  │    │ • History    │    │             │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
   Reports Table       Reports Table      Reports Table      Transactions         Rewards Table
   (status: pending)   (status update)   (status: verified)     Table           (ordered by pts)
```

## 🏗️ Architecture

### Project Structure

```
ScrapAI/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard components
│   ├── report/           # Waste reporting
│   ├── collect/          # Waste collection
│   ├── leaderboard/      # User rankings
│   ├── settings/         # User settings
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── dashboard/       # Dashboard-specific components
│   ├── Header.tsx       # Main header component
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── Layout.tsx       # Main layout wrapper
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── store/               # Redux store
│   ├── slices/          # Redux slices
│   └── index.ts         # Store configuration
├── types/               # TypeScript definitions
├── utils/               # Utility functions
│   ├── db/             # Database operations
│   └── litProtocol.ts  # Web3Auth configuration
└── public/             # Static assets
```

### State Management

The application uses Redux Toolkit for state management:

- **Auth Slice**: Web3Auth authentication state
- **UI Slice**: Interface state (sidebar, theme, language)

### Database Schema

```sql
-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table for waste reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  location TEXT NOT NULL,
  waste_type VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  ai_analysis JSONB,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  collector_id INTEGER REFERENCES users(id)
);

-- Rewards table for user points
CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  name VARCHAR(255) NOT NULL,
  collection_info TEXT NOT NULL
);

-- CollectedWastes table for collection tracking
CREATE TABLE collected_wastes (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) NOT NULL,
  collector_id INTEGER REFERENCES users(id) NOT NULL,
  collection_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'collected'
);

-- Transactions table for point history
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'earned_report', 'earned_collect', 'redeemed'
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notifications table for user notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Key Relationships

- **Reports → Users**: Each report belongs to a user (reporter)
- **Reports → Users**: Each report can have a collector (collector_id)
- **CollectedWastes → Reports**: Each collection references a report
- **CollectedWastes → Users**: Each collection belongs to a collector
- **Transactions → Users**: Each transaction belongs to a user
- **Rewards → Users**: Each reward belongs to a user

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary: #22c55e;
--primary-foreground: #ffffff;

/* Background Colors */
--background: #ffffff;
--foreground: #020817;

/* Dark Mode */
--background-dark: #020817;
--foreground-dark: #ffffff;

/* Glassmorphism */
--glass-light: rgba(255, 255, 255, 0.1);
--glass-medium: rgba(255, 255, 255, 0.2);
--glass-border: rgba(255, 255, 255, 0.2);
```

### Typography

- **Display Font**: Inter (headings and body)
- **Font Weights**: 300, 400, 500, 600, 700
- **Line Heights**: 1.5 for body, 1.2 for headings

### Component Library

Built with shadcn/ui components:
- Button, Card, Dialog, Dropdown Menu
- Form components with React Hook Form
- Toast notifications with Sonner
- Theme toggle with next-themes

## 🔒 Authentication & Security

### Web3Auth Integration

- **Solana Blockchain**: Devnet integration for testing
- **Multiple Providers**: Google, Facebook, Twitter, etc.
- **Secure Storage**: Encrypted local storage
- **Session Management**: Automatic session persistence

### Data Protection

- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Prevention**: React's built-in protection
- **CORS Configuration**: Proper origin handling

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 📊 Features in Detail

### Waste Reporting System

1. **Image Upload**: Users can upload photos of waste
2. **AI Verification**: Google AI analyzes waste type and amount
3. **Location Tracking**: Automatic GPS location detection
4. **Point Rewards**: Earn points for each report
5. **Status Tracking**: Monitor report status (pending, collected, verified)

### Reward System

- **Point Earning**: 10 points per waste report
- **Collection Rewards**: Additional points for collecting waste
- **Transaction History**: Complete audit trail of all transactions
- **Redemption System**: Redeem points for rewards
- **Leaderboard Integration**: Compete for top positions

### Dashboard Features

- **Real-time Statistics**: Live updates of user activity
- **Environmental Impact**: CO₂ saved, waste diverted metrics
- **Recent Activity**: Latest reports and transactions
- **Quick Actions**: Fast access to common tasks
- **Progress Tracking**: Visual progress indicators

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Standardized commit messages

## 📝 API Endpoints

### Database Operations (via Drizzle ORM)

```typescript
// User Management
createUser(email: string, name: string)
getUserByEmail(email: string)
getUserBalance(userId: number)

// Waste Reports
createReport(userId, location, wasteType, amount, imageUrl)
getReportsByUserId(userId: number)
updateReportStatus(reportId: number, status: string)

// Rewards System
getRewardTransactions(userId: number)
createTransaction(userId, type, amount, description)
redeemReward(userId: number, rewardId: number)

// Notifications
createNotification(userId: number, message: string, type: string)
getUnreadNotifications(userId: number)
markNotificationAsRead(notificationId: number)
```

## 🐛 Troubleshooting

### Common Issues

1. **Web3Auth Connection Issues**
   - Verify client ID configuration
   - Check network settings (devnet/testnet)
   - Clear browser cache and local storage

2. **Database Connection**
   - Verify DATABASE_URL in environment variables
   - Check Neon database status
   - Ensure proper database schema

3. **Build Issues**
   - Clear .next folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check environment variables
npm run dev -- --verbose
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web3Auth**: For blockchain authentication
- **shadcn/ui**: For beautiful UI components
- **Drizzle ORM**: For type-safe database operations
- **Framer Motion**: For smooth animations
- **Tailwind CSS**: For utility-first styling

## 📞 Support

- **Documentation**: [docs.ScrapAI.app](https://docs.ScrapAI.app)
- **Issues**: [GitHub Issues](https://github.com/your-org/ScrapAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ScrapAI/discussions)
- **Email**: support@ScrapAI.app

---

Built with ❤️ by Y&D for a sustainable future 🌍
