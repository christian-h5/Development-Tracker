# DevTracker Tool - Real Estate Development Project Management System

## Overview

DevTracker Tool is a full-stack web application designed for real estate development project management. It provides tools for tracking development phases, managing unit types, calculating profitability scenarios, and monitoring project progress. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Request Handling**: Express middleware for JSON parsing, logging, and error handling
- **Development**: Hot reloading with Vite integration

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Schema Validation**: Zod for runtime type validation

## Key Components

### Core Domain Models
1. **Projects**: Top-level development projects with metadata
2. **Phases**: Individual development phases within projects (up to 12 phases)
3. **Unit Types**: Reusable unit configurations with square footage (for project tracking)
4. **Calculator Unit Types**: Independent unit configurations for calculator scenarios only
5. **Phase Units**: Unit allocations within phases with cost breakdowns
6. **Calculator Scenarios**: Profitability analysis scenarios for calculator unit types

### Frontend Components
- **Navigation System**: Header-based navigation between Project Tracking and Unit Calculator
- **Project Dashboard**: Summary metrics and phase overview
- **Phase Management**: Modal-based CRUD operations for phases and units
- **Unit Calculator**: Interactive profitability analysis tool
- **Data Tables**: Comprehensive phase and unit listing with financial metrics

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handlers**: RESTful endpoints for all CRUD operations
- **Validation**: Schema-based request validation using Zod
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Flow

### Project Management Flow
1. User creates/selects a project
2. Project dashboard displays summary metrics
3. User manages phases through modal interfaces
4. Each phase contains multiple unit configurations
5. Financial calculations update in real-time

### Unit Calculator Flow
1. User selects unit type and inputs costs
2. System calculates multiple pricing scenarios
3. Profitability analysis displays margins and profit per square foot
4. Scenarios can be saved for future reference

### API Communication
- Frontend uses TanStack Query for API state management
- RESTful endpoints handle CRUD operations
- Real-time calculations performed client-side
- Server validates all inputs using Zod schemas

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React routing
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: Schema validation library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and enhanced development experience
- **esbuild**: Production bundling for server code
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- TSX for TypeScript execution in development
- Integrated development experience with Replit tooling

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild compiles server TypeScript to `dist/index.js`
- Single Node.js process serves both API and static assets

### Database Setup
- Drizzle migrations manage schema changes
- Environment variable `DATABASE_URL` configures database connection
- PostgreSQL dialect with Neon serverless compatibility

### Key Architectural Decisions

1. **Monorepo Structure**: Shared types and schemas between client/server in `shared/` directory
2. **Type Safety**: End-to-end TypeScript with runtime validation using Zod
3. **Component Architecture**: Radix UI primitives with custom styling for consistency
4. **State Management**: Server state via React Query, minimal local state
5. **Database Strategy**: Drizzle ORM chosen for type safety and migration management
6. **Development Experience**: Vite integration with Express for seamless full-stack development
7. **Separated Unit Type Systems**: Calculator unit types completely independent from project tracking unit types for better data isolation and user experience

## Recent Changes (January 2025)

### Browser Local Storage Implementation
- **Date**: January 11, 2025
- **Change**: Replaced in-memory storage with browser localStorage for data persistence
- **Impact**: 
  - All project data, phases, and calculator configurations now persist between sessions
  - Data is stored locally in the user's browser (no server dependency)
  - Perfect for static deployment while maintaining full functionality
  - Created client-side storage layer with localStorage service
  - Updated API layer to use client storage instead of server calls
  - Maintains all existing functionality with persistent data storage

### Calculator Unit Type Separation
- **Date**: January 11, 2025
- **Change**: Implemented independent unit type system for calculator functionality
- **Impact**: 
  - Calculator now has its own unit types separate from project tracking
  - Users can manage calculator unit types without affecting project data
  - Added dedicated unit type manager in calculator section
  - Schema updated with new `calculatorUnitTypes` table and related types
  - Storage layer enhanced with calculator-specific CRUD operations
  - API endpoints added for calculator unit type management

### Export/Import and PDF Generation
- **Date**: January 11, 2025
- **Change**: Added comprehensive export/import functionality and PDF reporting capabilities
- **Impact**:
  - Export/Import buttons in navigation header for backup and data transfer
  - Complete data backup includes all projects, phases, unit types, and scenarios
  - PDF generation for sensitivity analysis reports using jsPDF
  - Professional PDF reports with project details, scenario analysis, and risk metrics
  - Export PDF button in sensitivity analysis results for easy distribution
  - Project summary PDF export from project dashboard with complete project overview
  - Comprehensive project PDFs include executive summary, phase breakdown, unit details, and financial analysis
  - JSON format for data backup ensures compatibility and easy restoration

### UI/UX Improvements
- **Date**: January 11, 2025
- **Change**: Enhanced profitability analysis design and removed flex rooms from calculator
- **Impact**:
  - Removed flex rooms option from unit calculator for simplified interface
  - Improved table design with better spacing, larger fonts, and color coding
  - Added green color for profits (margins, ROI) and red for costs
  - Enhanced table layout with full-width results section for better readability
  - Added hover effects and highlighted base case scenarios

### Deployment Configuration Fix
- **Date**: January 11, 2025
- **Change**: Fixed deployment configuration mismatch between build output and deployment expectations
- **Impact**:
  - Resolved "index.html not found" deployment error
  - Updated build process to use `node build-static.js` for deployment (outputs to `dist/`)
  - Modified deployment documentation to specify correct build command and publish directory
  - Created comprehensive deployment guides for Replit and other static hosting providers
  - Maintains development workflow with `npm run dev` unchanged
  - Ensures successful static deployment with proper file structure

The application prioritizes developer experience, type safety, and maintainable code structure while providing a responsive and intuitive user interface for real estate development project management.