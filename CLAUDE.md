# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses nodemon for auto-reload)
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`
- **Seed database with mock data**: `node mockData.js`

## Architecture Overview

This is a Node.js Express backend for managing StarkNet smart contract security audits with a scope-to-audit workflow system. The architecture has evolved from dual database to single MongoDB implementation:

### Database Architecture
- **MongoDB**: Single database storing all entities (audits, users, companies, scopes, comments) via Mongoose
- Database connection is initialized on server startup in index.js:37-38
- Removed SQLite dependency - now fully MongoDB-based for simplified architecture

### Key Components

**API Controllers** (in `/api/`):
- `auditController.js`: CRUD operations for audit documents
- `scopeController.js`: 3-step scope workflow management (create → approve/reject → audit creation)
- `userController.js`: User management with StarkNet signature verification
- `commentController.js`: Comment system for audit collaboration
- `companyController.js`: Company profile management (client/auditor companies)

**Database Layer** (in `/db/`):
- `mongoDatabase.js`: MongoDB singleton connection with global caching

**Models** (in `/models/`):
- `scope.js`: Scope workflow schema with client-auditor approval process
- `audit.js`: Complex audit document schema with nested security issues
- `company.js`: Company schema supporting both client and auditor roles
- `user.js`: User schema with role-based access (admin, auditor, client)
- `comment.js`: Comment schema for audit discussions and issue feedback

**StarkNet Integration** (in `/utils/`):
- `verifySignature.js`: Verifies StarkNet wallet signatures for authentication
- `provider.js`: StarkNet RPC provider configuration
- `account_abi.json`: StarkNet account contract ABI
- `loadEnvironment.js`: Environment variable configuration

### Core Workflow: Scope-to-Audit Process

**3-Step Process**:
1. **Client Creates Scope**: Client company defines audit requirements and selects auditor company
2. **Auditor Approves/Rejects**: Auditor company reviews and either approves (triggers audit creation) or rejects with feedback
3. **System Creates Audit**: Upon approval, system automatically generates audit document with all linked entities

**Scope Schema**: Contains protocol details, repository info, workflow status (`pending`, `approved`, `rejected`, `audit_created`), company relationships, and approval/rejection metadata.

**Audit Structure**: Complex nested document with status tracking, categorized security issues (critical, high, medium, low, info, bestPractices), test results, and detailed summaries.

**Issue Schema**: Each security issue contains title, affected files, description, recommendation, status, client updates, and vulnerable code snippets.

**Authentication**: Dual approach - full StarkNet signature verification for POST operations, public address headers for GET operations with role-based access control.

### Validation
Input validation uses express-validator with custom rules in `/validations/` directory organized by entity type (audit, scope, user, company, comment).

## Environment Configuration

Required environment variables:
- `MONGO_URL`: MongoDB connection string (Atlas or local)
- `PORT`: Server port (defaults to 5050)

## Development Workflow

**Testing the System**:
- Run `node mockData.js` to seed database with realistic workflow examples
- Mock data includes 5 companies (2 auditor, 3 client), 9 users, 3 scopes in different workflow states, 1 completed audit with security findings, and collaborative comments

**Key Implementation Details**:
- Server runs on port 5050 by default (configured in index.js:36-40)
- All HTTP requests logged with timestamps via middleware (index.js:15-19)
- CORS enabled for all origins
- MongoDB singleton connection prevents multiple database connections
- ES modules used throughout (package.json type: "module")
- No test framework configured - uses manual testing via API endpoints
- StarkNet integration supports both Sepolia and Mainnet networks

**Role-Based Access Patterns**:
- **Admin**: Full system access to all endpoints and data
- **Auditor**: Access to relevant audits, scopes assigned to their company, company management  
- **Client**: Access to own company's audits and scopes, create new scope requests
- Authentication middleware uses `X-Public-Address` header for user identification