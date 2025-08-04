# 🔐 Boreas Audit Backend

A comprehensive backend system for managing security audits of StarkNet smart contracts. This project provides APIs for audit management, user authentication, and company profiles with both MongoDB and SQLite database support.

## 🌟 Features

- **Audit Management**: Create, read, update, and delete security audit reports
- **User Management**: Handle auditors, clients, and administrators with role-based access
- **Company Profiles**: Manage audit companies and client organizations
- **StarkNet Integration**: Built-in support for StarkNet wallet signature verification
- **Dual Database Support**: MongoDB for audit data, SQLite for user/company data
- **Issue Tracking**: Categorized security issues (Critical, High, Medium, Low, Info, Best Practices)
- **Comment System**: Collaborative commenting on audit findings

## 🏗️ Architecture

```
├── api/                    # API Controllers
│   ├── auditController.js     # Audit CRUD operations
│   ├── userController.js      # User management
│   ├── commentController.js   # Comment system
│   └── companyController.js   # Company management
├── db/                     # Database connections
│   ├── mongoDatabase.js      # MongoDB connection
│   ├── sqlDatabase.js        # SQLite setup
│   ├── read.js               # SQLite read operations
│   └── write.js              # SQLite write operations
├── models/                 # MongoDB schemas
│   ├── audit.js              # Audit document schema
│   ├── comment.js            # Comment schema
│   └── user.js               # User schema
├── utils/                  # Utilities
│   ├── provider.js           # StarkNet RPC provider
│   ├── verifySignature.js    # Signature verification
│   └── loadEnvironment.js    # Environment setup
├── validations/            # Input validation rules
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- StarkNet wallet for testing

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
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/audit-backend
   PORT=5050
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5050`

## 📊 Database Schema

### MongoDB Collections

#### Audit Schema
```javascript
{
  status: String,                    // "Draft", "In Progress", "Completed"
  scope: [String],                   // Array of contract files
  summary: {
    protocol: String,                // Protocol name
    website: String,                 // Project website
    description: String,             // Project description
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

#### Issue Schema
```javascript
{
  title: String,                    // Issue title
  files: [String],                  // Affected files
  description: String,              // Detailed description
  recommendation: String,           // Fix recommendation
  status: String,                   // "Open", "Fixed", "Acknowledged"
  clientUpdate: String,             // Client response
  code: String                      // Code snippet
}
```

### SQLite Tables

#### Users Table
- User profiles with role management (Admin, Auditor, Client)
- StarkNet public address integration
- Contact information (email, GitHub, Telegram)

#### Companies Table
- Audit companies and client organizations
- Company profiles and contact details
- Owner/manager relationships

## 🔗 API Endpoints

### Audit Management
```
GET    /audit/getAllAudits          # Get all audits
GET    /audit/getAuditById/:id      # Get specific audit
POST   /audit/postAudit             # Create new audit
PUT    /audit/updateAudit/:id       # Update audit
DELETE /audit/deleteAudit/:id       # Delete audit
```

### User Management
```
GET    /user/getAllUsers            # Get all users
GET    /user/getAllAuditors         # Get all auditors
GET    /user/getAllClients          # Get all clients
GET    /user/getAllAdmins           # Get all admins
GET    /user/getUserById/:id        # Get user by ID
GET    /user/getUserByPublicAddress/:address  # Get user by wallet
POST   /user/createUser             # Create new user (with signature)
PUT    /user/updateUser/:id         # Update user
DELETE /user/deleteUser/:id         # Delete user
```

### Company Management
```
GET    /company/getAllCompanies     # Get all companies
GET    /company/getCompanyById/:id  # Get specific company
POST   /company/createCompany       # Create new company
PUT    /company/updateCompany/:id   # Update company
DELETE /company/deleteCompany/:id   # Delete company
```

### Comments
```
GET    /comment/getAllComments      # Get all comments
POST   /comment/createComment       # Create new comment
PUT    /comment/updateComment/:id   # Update comment
DELETE /comment/deleteComment/:id   # Delete comment
```

## 🔐 Authentication

The system uses StarkNet wallet signature verification for user authentication:

1. Users sign a message with their StarkNet wallet
2. Backend verifies the signature using the `verifySignature` utility
3. Valid signatures authenticate the user for protected operations

Example user creation with signature:
```javascript
POST /user/createUser
{
  "signedMessage": "0x...",          // Signed message
  "account": "0x...",                // User's StarkNet address
  "signData": "authentication_data", // Data that was signed
  "data": {
    "name": "John Doe",
    "publicAddress": "0x...",
    "mail": "john@example.com",
    "github": "johndoe",
    "telegram": "@johndoe",
    "isAuditor": 1
  }
}
```

## 🌐 StarkNet Integration

The backend integrates with StarkNet through:

- **RPC Provider**: Configurable Sepolia/Mainnet endpoints
- **Signature Verification**: Wallet signature validation
- **Account Integration**: StarkNet address-based user identification

## 🛠️ Development

### Running in Development Mode
```bash
npm install -g nodemon
nodemon index.js
```

### Database Operations
```bash
# Seed with example data
npm run audit:seed

# View database contents
npm run audit:list

# Clear database
npm run audit:clear
```

### Environment Variables
```env
MONGO_URL=mongodb://localhost:27017/audit-backend  # MongoDB connection
PORT=5050                                          # Server port
```

## 📝 Usage Examples

### Creating an Audit
```javascript
const auditData = {
  status: "In Progress",
  scope: ["src/contracts/token.cairo"],
  summary: {
    protocol: "DeFi Protocol",
    website: "https://example.com",
    description: "A DeFi protocol audit",
    cairoVer: "2.4.0"
  },
  issues: {
    critical: [],
    high: [{
      title: "Access Control Issue",
      files: ["src/contracts/token.cairo"],
      description: "Missing access control on admin functions",
      recommendation: "Implement role-based access control",
      status: "Open",
      clientUpdate: "Under review"
    }]
  }
};
```

### User Registration
```javascript
const userData = {
  name: "Alice Auditor",
  publicAddress: "0x1234...5678",
  mail: "alice@auditor.com",
  isAuditor: 1,
  isClient: 0,
  isAdmin: 0
};
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Bora Atik** - *Initial work* - [@Boreas09](https://github.com/Boreas09)

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Databases**: MongoDB (audit data), SQLite (user data)
- **Blockchain**: StarkNet integration
- **Validation**: express-validator
- **Environment**: dotenv
- **CORS**: Cross-origin resource sharing enabled

## 📞 Support

For support, email [support email] or create an issue in the GitHub repository.

---

*Built for secure StarkNet smart contract auditing* 🔐