# Veroxos - Kitchen Order Management System

Real-time kitchen order management system for restaurants. Built with NestJS, Next.js, and React Native. Supports multiple restaurants managing orders simultaneously with WebSocket-based real-time updates.

## Tech Stack

**Backend**

- NestJS 11 + TypeORM + PostgreSQL 16
- Socket.IO for WebSocket communication
- NestJS EventEmitter for event-driven architecture
- Swagger for API documentation

**Frontend Web**

- Next.js 16 (App Router)
- TanStack Query for data fetching
- Tailwind CSS 4 for styling
- Socket.IO Client for real-time updates

**Frontend Mobile**

- React Native 0.73
- TanStack Query for data fetching
- Socket.IO Client for real-time updates
- TypeScript with strict mode

**Infrastructure**

- Docker & Docker Compose
- pnpm for package management
- PostgreSQL 16

## Prerequisites

- Node.js 20+
- pnpm 8.5.0+ (via corepack)
- Docker 20.10+
- Docker Compose 2.0+

For mobile development:

- iOS: Xcode (macOS only)
- Android: Android Studio with Android SDK

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd veroxos
pnpm install
```

### 2. Environment Setup

Create `.env` in the root (optional - defaults provided):

```env
DB_NAME=veroxos
DB_USER=veroxos
DB_PASSWORD=veroxos123
DB_PORT=5432
BACKEND_PORT=4000
```

### 3. Start Services

```bash
# Start backend and database
pnpm dev

# In separate terminal, start frontend web
cd veroxos-fe
pnpm dev

# In separate terminal, start mobile Metro bundler
cd veroxos-mobile
pnpm start
```

### 4. Access Applications

- **Frontend Web**: http://localhost:3001
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api
- **Mobile**: Run `pnpm ios` or `pnpm android` in `veroxos-mobile`

The backend auto-seeds 3 restaurants with sample orders on first startup.

## Project Structure

```
veroxos/
├── veroxos-be/              # NestJS Backend
│   ├── src/
│   │   ├── entities/        # TypeORM entities
│   │   ├── restaurants/     # Restaurant module
│   │   ├── orders/          # Orders module + WebSocket gateway
│   │   ├── database/        # Database service + seed
│   │   └── config/          # Configuration
│   └── Dockerfile
│
├── veroxos-fe/              # Next.js Web App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API client + React Query setup
│   │   └── types/           # TypeScript types
│   └── package.json
│
└── veroxos-mobile/          # React Native App
    ├── src/
    │   ├── screens/         # Screen components
    │   ├── hooks/           # Custom hooks (React Query)
    │   ├── lib/             # API client + React Query setup
    │   ├── styles/          # StyleSheet definitions
    │   ├── utils/           # Utility functions
    │   └── types/           # TypeScript types
    └── package.json
```

## Monorepo Scripts

```bash
# Development
pnpm dev              # Start backend + database (Docker)
pnpm dev:build        # Rebuild and start
pnpm dev:detached     # Start in background

# Production
pnpm prod             # Build and start production
pnpm prod:detached    # Production in background

# Service Management
pnpm down             # Stop all services
pnpm down:volumes     # Stop and remove volumes
pnpm logs             # View all logs
pnpm logs:be          # Backend logs
pnpm logs:db          # Database logs

# Build & Quality
pnpm build            # Build all projects
pnpm lint             # Lint all projects
pnpm lint:fix         # Auto-fix linting issues
pnpm typecheck        # Type check all projects
pnpm format           # Format code

# Installation
pnpm install          # Install all dependencies
pnpm install:be       # Backend only
pnpm install:fe       # Frontend web only
pnpm install:mobile  # Mobile only

# Cleanup
pnpm clean            # Remove node_modules and build artifacts
```

## Local Development

### Backend (Without Docker)

```bash
cd veroxos-be
pnpm install
pnpm start:dev
```

Requires PostgreSQL running. Use Docker for just the database:

```bash
docker-compose up postgres
```

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://veroxos:veroxos123@localhost:5432/veroxos
```

### Frontend Web

```bash
cd veroxos-fe
pnpm install
pnpm dev
```

Runs on http://localhost:3001. Backend must be accessible at http://localhost:4000.

### Frontend Mobile

```bash
cd veroxos-mobile
pnpm install
pnpm start              # Start Metro bundler
```

In separate terminals:

```bash
pnpm ios                # iOS simulator
pnpm android            # Android emulator
```

**Note**: For physical devices, update API URLs in:

- `src/lib/api/orders.ts`
- `src/hooks/use-order-websocket.ts`

Use your machine's IP address instead of `localhost` (e.g., `http://192.168.1.x:4000`).

## API Endpoints

**Base URL**: `http://localhost:4000`

### Restaurants

- `GET /api/restaurants` - List all active restaurants
- `GET /api/restaurants/:slug` - Get restaurant by slug
- `GET /api/restaurants/:slug/orders` - Get orders for restaurant
  - Query: `?status=PENDING` (optional)

### Orders

- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
```

Status transitions are validated server-side. Invalid transitions return 400.

## WebSocket Events

**Namespace**: `/orders`

**Client → Server**

- `join-restaurant` - Join restaurant room: `{ slug: "restaurant-slug" }`
- `leave-restaurant` - Leave restaurant room: `{ slug: "restaurant-slug" }`

**Server → Client**

- `order:created` - New order created
- `order:status:updated` - Order status changed

## Architecture

### Event Flow

```
Order Created/Updated
    │
    ├─► OrdersService emits event
    │       │
    │       ├─► OrderLoggerHandler
    │       ├─► OrderAuditHandler
    │       └─► OrderNotificationHandler
    │
    └─► OrdersGateway broadcasts to room
            │
            └─► Connected clients receive update
```

### Data Fetching

Both web and mobile use TanStack Query:

- Automatic caching and request deduplication
- Background refetching
- Optimistic updates support
- Built-in error handling and retry logic
- Cache invalidation on mutations

### Mobile App Structure

- **Screens**: UI components
- **Hooks**: Business logic with React Query (`useQuery`, `useMutation`)
- **Styles**: Separated StyleSheet files
- **Utils**: Pure utility functions
- **API**: Centralized API client

## Database Seeding

Backend automatically seeds on startup if database is empty. Manual seeding:

```bash
pnpm seed
```

Creates 3 restaurants (Pizza Palace, Burger House, Sushi Express) with sample orders.

## Development Notes

### TypeScript

All projects use strict TypeScript. Run type checking:

```bash
pnpm typecheck
```

### Linting

Uses ESLint (backend) and Biome (frontend). Auto-fix:

```bash
pnpm lint:fix
```

## Future Enhancements

- Authentication and authorization
- Push notifications (mobile)
- Order history and analytics
- Multi-language support
- Print integration
- Order cancellation
- Offline support with React Query persistence
- Optimistic updates
