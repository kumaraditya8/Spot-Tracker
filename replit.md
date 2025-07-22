# SPOT - Sitting + Bot Dashboard

## Overview

SPOT is a smart office seating and employee activity tracker dashboard built as a modern web application. It provides real-time visualization of employee presence, seating arrangements, and activity status through an interactive floor plan interface. The application simulates MAC-based heartbeat tracking to monitor employee activity states including present, idle, sleep, remote, and absent statuses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based frontend built with TypeScript and styled using Tailwind CSS with shadcn/ui components. The architecture follows a component-based design with:

- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom design system variables
- **shadcn/ui** component library for consistent UI patterns
- **React Query (@tanstack/react-query)** for state management and API caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
The backend is a Node.js Express server that serves both API endpoints and static files:

- **Express.js** server with TypeScript
- **RESTful API** design with structured route handling
- **In-memory storage** with interface for future database migration
- **Vite integration** for development hot reloading
- **Database-ready** with Drizzle ORM schema definitions

### Build System
- **Vite** for fast development and optimized production builds
- **esbuild** for server-side bundling
- **TypeScript** compilation with strict type checking
- **Path aliases** for clean imports (@/, @shared/)

## Key Components

### Data Models
The application defines three core entities:
- **Employees**: Personal info, job details, seating assignment, and activity status
- **Tables**: Physical seating arrangements with capacity management
- **Activities**: Audit trail of all employee actions and status changes

### Frontend Components
- **Dashboard**: Main interface with interactive floor plan and real-time updates
- **Floor Plan**: Visual seating grid with color-coded status indicators
- **Employee Management**: Modals for adding/editing employee information
- **Table Management**: Administrative interface for office layout configuration
- **Reports**: Analytics and activity history with export capabilities

### Status System
Comprehensive employee status tracking:
- **Present**: Active and working (green, pulsing)
- **Idle**: Inactive for 5+ minutes (yellow, pulsing)
- **Sleep**: System in sleep mode (purple, pulsing)
- **Remote**: Working from remote location (blue)
- **Absent**: Not present (red)
- **Unassigned**: No seat assignment (gray)

## Data Flow

1. **Employee Creation**: Forms validate data using Zod schemas before API submission
2. **Seat Assignment**: Employees can be assigned to specific table/seat combinations
3. **Status Updates**: Real-time status changes trigger activity logging
4. **Activity Tracking**: All actions are recorded with timestamps and metadata
5. **Dashboard Updates**: React Query automatically refetches data every 30 seconds
6. **Export Functionality**: Reports can be generated for employees and activities

## External Dependencies

### UI Framework
- **Radix UI**: Accessible component primitives for complex interactions
- **Lucide React**: Modern icon library
- **Class Variance Authority**: Utility for component variant management

### Database (Configured but Optional)
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL provider integration
- **Schema Validation**: Drizzle-zod for runtime type checking

### Development Tools
- **Replit Integration**: Custom plugins for development environment
- **Error Overlay**: Runtime error handling in development
- **Hot Module Replacement**: Fast development feedback loop

## Deployment Strategy

### Development Mode
- Vite dev server with Express API backend
- Hot reloading for both client and server code
- Replit-specific development tools integration

### Production Build
- Client builds to static files served by Express
- Server bundles with esbuild for Node.js deployment
- Environment-based configuration for database connections

### Database Migration Path
The application uses in-memory storage by default but includes:
- Complete Drizzle schema definitions for PostgreSQL
- Database configuration ready for environment variable setup
- Migration scripts for schema deployment (`npm run db:push`)

This architecture provides a lightweight development experience while maintaining the flexibility to scale to a full database-backed solution when needed.