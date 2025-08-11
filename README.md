# 🔐 Boreas Audit Backend

A comprehensive backend system for managing security audits of StarkNet smart contracts. This project provides APIs for audit management, scope workflow, user authentication, and company profiles with MongoDB database support.

## 🌟 Features

- **Scope-to-Audit Workflow**: Complete 3-step process from scope creation to audit execution
- **Audit Management**: Comprehensive security audit reports with issue tracking
- **User Management**: Role-based access control (Admin, Auditor, Client)
- **Company Profiles**: Auditor and client company management
- **StarkNet Integration**: On-chain signature verification for authentication
- **MongoDB Database**: Single database solution with proper relationships
- **Issue Tracking**: Categorized security issues (Critical, High, Medium, Low, Info, Best Practices)
- **Comment System**: Collaborative commenting on audit findings and issues

## 🔄 Audit Workflow

### 3-Step Process:

1. **Client Creates Scope** 🎯
   - Client company defines audit scope (protocol, repo, etc.)
   - Selects auditor company for the engagement
   - Requires StarkNet signature authentication

2. **Auditor Approves/Rejects** ✅❌
   - Auditor company reviews the scope proposal
   - Can approve (triggers audit creation) or reject with feedback
   - Requires StarkNet signature authentication

3. **System Creates Audit** 📋
   - Upon approval, system automatically creates audit document
   - Links all companies, users, and scope data
   - Audit status set to "Draft" and ready for work

## 🏗️ Architecture

```
├── api/                      # API Controllers
│   ├── auditController.js       # Audit CRUD operations
│   ├── scopeController.js       # Scope workflow management
│   ├── userController.js        # User management
│   ├── commentController.js     # Comment system
│   └── companyController.js     # Company management
├── db/                      # Database connections
│   └── mongoDatabase.js         # MongoDB singleton connection
├── models/                  # MongoDB schemas
│   ├── audit.js                # Audit document schema
│   ├── scope.js                # Scope workflow schema
│   ├── user.js                 # User schema
│   ├── comment.js              # Comment schema
│   └── company.js              # Company schema
├── utils/                   # Utilities
│   ├── provider.js             # StarkNet RPC provider
│   ├── verifySignature.js      # On-chain signature verification
│   └── loadEnvironment.js      # Environment setup
├── validations/             # Input validation rules
|   ├── validations.js          # Auth validations
│   ├── auditValidations.js     # Audit  validations
│   ├── scopeValidations.js     # Scope workflow validations
│   ├── userValidations.js      # User validations
│   ├── commentValidations.js   # Comment validations
│   └── companyValidations.js   # Company validations
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- StarkNet wallet for testing (ArgentX, Braavos, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Boreas09/audit-backend.git
   cd audit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/audit-backend
   PORT=5050
   ```

4. **Seed with mock data (optional)**
   ```bash
   node mockData.js
   ```
   This creates sample companies, users, scopes, and audits to test the workflow.

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will run on `http://localhost:5050`

## 📊 Database Schema

### MongoDB Collections

#### Scope Schema
```javascript
{
  protocol: String,                 // Protocol name (required)
  website: String,                  // Project website (URL)
  description: String,              // Project description
  cairoVer: String,                 // Cairo version (x.y.z format)
  repo: String,                     // GitHub repository (URL)
  initialCommit: String,            // Starting commit hash
  docs: String,                     // Documentation URL
  
  // Workflow fields
  status: String,                   // "pending", "approved", "rejected", "audit_created"
  clientCompanyId: ObjectId,        // Reference to client company
  auditorCompanyId: ObjectId,       // Reference to auditor company
  createdBy: ObjectId,              // Reference to user who created scope
  approvedBy: ObjectId,             // Reference to user who approved/rejected
  approvalDate: Date,               // Date of approval/rejection
  rejectionReason: String,          // Reason for rejection
  auditId: ObjectId                 // Reference to created audit (if approved)
}
```

#### Audit Schema
```javascript
{
  status: String,                   // "Draft", "In Progress", "Completed"
  scope: [String],                  // Array of contract files
  summary: {
    protocol: String,               // Protocol name
    website: String,                // Project website
    description: String,            // Project description
    cairoVer: String,               // Cairo version
    finalReportDate: String,        // Report completion date
    repo: String,                   // GitHub repository
    initialCommit: String,          // Starting commit hash
    finalCommit: String,            // Final commit hash
    docs: String,                   // Documentation URL
    testSuiteAssesment: String      // Test suite evaluation
  },
  issues: {
    critical: [IssueSchema],        // Critical severity issues
    high: [IssueSchema],            // High severity issues
    medium: [IssueSchema],          // Medium severity issues
    low: [IssueSchema],             // Low severity issues
    info: [IssueSchema],            // Informational issues
    bestPractices: [IssueSchema]    // Best practice recommendations
  },
  test: {
    compilation: String,            // Compilation results
    tests: String                   // Test coverage info
  }
}
```

#### User Schema
```javascript
{
  role: String,                     // "admin", "auditor", "client"
  publicAddress: String,            // StarkNet address (66 chars, unique)
  name: String,                     // Username (3-25 chars, unique)
  customerReportId: [ObjectId],     // References to audits (not required for admin)
  companyId: ObjectId               // Reference to company (not required for admin)
}
```

#### Company Schema
```javascript
{
  role: String,                     // "client", "auditor"
  companyName: String,              // Company name (3-25 chars, unique)
  companyReportId: [ObjectId],      // References to audits
  companyManagers: [ObjectId],      // References to manager users
  companyUsers: [ObjectId]          // References to all company users
}
```

#### Comment Schema
```javascript
{
  content: String,                  // Comment text (1-1000 chars)
  author: {
    id: ObjectId,                   // Reference to user
    name: String                    // Author name
  },
  auditId: ObjectId,                // Reference to audit
  issueId: Mixed                    // Reference to specific issue or empty string
}
```

## 🔗 API Endpoints

### 🎯 Scope Workflow (Client-Auditor Flow)
```
POST   /scope/create                # Client creates new scope (requires StarkNet signature)
POST   /scope/approve               # Auditor approves scope (requires StarkNet signature)
POST   /scope/reject                # Auditor rejects scope (requires StarkNet signature)
GET    /scope/                      # Get all scopes (admin only)
GET    /scope/user/:userId          # Get scopes by user (role-based access)
GET    /scope/company/:companyId    # Get scopes by company (role-based access)
```

### 📋 Audit Management
```
GET    /audit/                      # Get all audits (admin only)
GET    /audit/:id                   # Get audit by ID (any authenticated user)
GET    /audit/company/:companyId    # Get audits by company ID
GET    /audit/user/:userId          # Get audits by user ID
GET    /audit/user/:userId/company/:companyId  # Get audits by user and company
GET    /audit/search/:name          # Search audits by protocol name
```

### 👥 User Management
```
GET    /user/getAllUsers            # Get all users
GET    /user/getAllAuditors         # Get all auditor users
GET    /user/getAllClients          # Get all client users
GET    /user/getAllAdmins           # Get all admin users
GET    /user/getUserById/:id        # Get user by MongoDB ID
GET    /user/getUserByPublicAddress/:address  # Get user by StarkNet address
POST   /user/createUser             # Create new user (requires StarkNet signature)
PUT    /user/updateUser/:id         # Update user information
DELETE /user/deleteUser/:id         # Delete user
```

### 🏢 Company Management
```
GET    /company/getAllCompanies     # Get all companies
GET    /company/getAllAuditorCompanies  # Get auditor companies only
GET    /company/getAllClientCompanies   # Get client companies only
GET    /company/getCompanyById/:id  # Get company by ID
GET    /company/getCompanyByUserId/:id  # Get company by user ID
GET    /company/getUsersByCompanyId/:id # Get all users in company
GET    /company/getManagersByCompanyId/:id  # Get company managers
GET    /company/getManagerIdByCompanyId/:id # Get manager IDs
GET    /company/getCompanyType/:id  # Get company type (client/auditor)
GET    /company/scopeByUserId/:id   # Get scopes by user ID
GET    /company/getAllScopes        # Get all scopes
POST   /company/createCompany       # Create new company
POST   /company/assignUserToCompany # Assign user to company
POST   /company/removeUserFromCompany  # Remove user from company
POST   /company/assignManagerToCompany  # Assign manager role
POST   /company/removeManagerFromCompany  # Remove manager role
PUT    /company/updateCompany/:id   # Update company (owner only)
DELETE /company/deleteCompany/:id   # Delete company (owner only)
```

### 💬 Comment System
```
GET    /comment/                    # Get all comments
GET    /comment/byAuthor/:authorId  # Get comments by author
GET    /comment/byAudit/:auditId    # Get comments by audit
GET    /comment/byIssue/:issueId    # Get comments by specific issue
POST   /comment/postComment         # Create new comment
PUT    /comment/updateComment       # Update existing comment
DELETE /comment/deleteComment       # Delete comment
```

## 🔐 Authentication

The system uses a dual authentication approach:

### 1. StarkNet Signature Verification (POST Requests)
For creating data (POST requests), full StarkNet signature verification is required:

```javascript
POST /user/createUser
{
  "signedMessage": "0x...",          // Signed message
  "account": "0x...",                // User's StarkNet address  
  "signData": "authentication_data", // Data that was signed
  "data": {
    "name": "John Doe",
    "publicAddress": "0x...",
    "role": "auditor"
  }
}
```

### 2. Public Address Authentication (GET Requests)  
For reading data (GET requests), role-based access control using public address headers:

```javascript
// Add header to request
Headers: {
  "X-Public-Address": "0x1234567890abcdef...", // User's StarkNet address
}
```

### Role-Based Access Control
- **Admin**: Full access to all endpoints and data
- **Auditor**: Access to relevant audits, scopes, and company data
- **Client**: Access to own company's audits and scopes

The `requireRole()` middleware checks user permissions based on their public address and role stored in the database.

## 🌐 StarkNet Integration

The backend integrates with StarkNet through:

- **RPC Provider**: Configurable Sepolia/Mainnet endpoints
- **Signature Verification**: Wallet signature validation
- **Account Integration**: StarkNet address-based user identification

## 🛠️ Development

### Available Scripts
```bash
# Start server in production mode
npm start

# Start server in development mode with auto-reload
npm run dev
```

### Database Operations
```bash
# Seed database with mock data (companies, users, scopes, audits, comments)
node mockData.js

# The mock data includes:
# - 5 companies (3 auditors, 2 clients)
# - 9 users with different roles
# - 3 scopes demonstrating the workflow
# - 1 completed audit with security findings
# - 4 collaborative comments
```

### Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/audit-backend
PORT=5050
```

### Testing the API
You can test the API endpoints using tools like Postman, curl, or any HTTP client. Remember to:
1. Include proper authentication headers for GET requests
2. Use StarkNet signature verification for POST requests
3. Follow the role-based access control requirements

## 📝 Usage Examples

### Complete Scope-to-Audit Workflow

#### 1. Client Creates Scope
```javascript
POST /scope/create
{
  "signedMessage": "0x...",
  "account": "0x...",
  "signData": "create_scope",
  "data": {
    "protocol": "DeFi Protocol v2",
    "website": "https://defiprotocol.com",
    "description": "Audit for new lending module",
    "cairoVer": "2.4.0",
    "repo": "https://github.com/client/defi-protocol",
    "initialCommit": "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4",
    "docs": "https://docs.defiprotocol.com",
    "auditorCompanyId": "64f8a7b6c5d4e3f2a1b0c9d8"
  }
}
```

#### 2. Auditor Approves Scope
```javascript
POST /scope/approve
{
  "signedMessage": "0x...",
  "account": "0x...", 
  "signData": "approve_scope",
  "data": {
    "scopeId": "64f8a7b6c5d4e3f2a1b0c9d8"
  }
}
```

#### 3. System Auto-Creates Audit
Upon approval, the system automatically creates an audit with status "Draft".

### User Registration with Role
```javascript
POST /user/createUser
{
  "signedMessage": "0x...",
  "account": "0x1234567890abcdef1234567890abcdef12345678",
  "signData": "create_user_account", 
  "data": {
    "name": "Alice Auditor",
    "publicAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "role": "auditor",
    "companyId": "64f8a7b6c5d4e3f2a1b0c9d8"
  }
}
```

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Bora Atik** - *Initial work* - [@Boreas09](https://github.com/Boreas09)

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (single database solution)
- **ODM**: Mongoose for MongoDB operations
- **Blockchain**: StarkNet integration with signature verification
- **Validation**: express-validator for input validation
- **Environment**: dotenv for configuration
- **CORS**: Cross-origin resource sharing enabled

---

*Built for secure StarkNet smart contract auditing* 🔐
