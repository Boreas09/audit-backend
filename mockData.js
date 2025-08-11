import "./utils/loadEnvironment.js";
import mongodb from "./db/mongoDatabase.js";
import Audit from "./models/audit.js";
import User from "./models/user.js";
import Comment from "./models/comment.js";
import Company from "./models/company.js";
import Scope from "./models/scope.js";

// Generate random StarkNet addresses
function generateStarkNetAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 64; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

// Mock Companies - Client and Auditor companies
const mockCompanies = [
  {
    role: 'auditor',
    companyName: 'CyberShield Audits',
    companyReportId: [],
    companyManagers: [],
    companyUsers: []
  },
  {
    role: 'auditor', 
    companyName: 'BlockSecure Labs',
    companyReportId: [],
    companyManagers: [],
    companyUsers: []
  },
  {
    role: 'client',
    companyName: 'StarkSwap Protocol',
    companyReportId: [],
    companyManagers: [],
    companyUsers: []
  },
  {
    role: 'client',
    companyName: 'CairoLend Finance',
    companyReportId: [],
    companyManagers: [],
    companyUsers: []
  },
  {
    role: 'client',
    companyName: 'NFTBridge Platform',
    companyReportId: [],
    companyManagers: [],
    companyUsers: []
  }
];

// Mock Users with proper roles
const mockUsers = [
  // Admin user
  {
    role: 'admin',
    publicAddress: generateStarkNetAddress(),
    name: 'SystemAdmin',
    customerReportId: [],
    companyId: null
  },
  
  // CyberShield Audits team
  {
    role: 'auditor',
    publicAddress: generateStarkNetAddress(),
    name: 'AliceAuditor',
    customerReportId: [],
    companyId: null // Will be set after company insertion
  },
  {
    role: 'auditor',
    publicAddress: generateStarkNetAddress(),
    name: 'BobSecurityExpert',
    customerReportId: [],
    companyId: null
  },
  
  // BlockSecure Labs team
  {
    role: 'auditor',
    publicAddress: generateStarkNetAddress(),
    name: 'CarolBlockchainAuditor',
    customerReportId: [],
    companyId: null
  },
  {
    role: 'auditor',
    publicAddress: generateStarkNetAddress(),
    name: 'DaveSmartContractExpert',
    customerReportId: [],
    companyId: null
  },
  
  // StarkSwap Protocol team
  {
    role: 'client',
    publicAddress: generateStarkNetAddress(),
    name: 'EveProtocolLead',
    customerReportId: [],
    companyId: null
  },
  {
    role: 'client',
    publicAddress: generateStarkNetAddress(),
    name: 'FrankDeveloper',
    customerReportId: [],
    companyId: null
  },
  
  // CairoLend Finance team
  {
    role: 'client',
    publicAddress: generateStarkNetAddress(),
    name: 'GraceFinanceLead',
    customerReportId: [],
    companyId: null
  },
  
  // NFTBridge Platform team
  {
    role: 'client',
    publicAddress: generateStarkNetAddress(),
    name: 'HenryNFTDev',
    customerReportId: [],
    companyId: null
  }
];

// Mock Scopes representing the workflow
const mockScopes = [
  // Pending scope - StarkSwap wants CyberShield to audit
  {
    protocol: 'StarkSwap AMM',
    website: 'https://starkswap.io',
    description: 'Automated Market Maker protocol for StarkNet with concentrated liquidity',
    cairoVer: '2.5.0',
    repo: 'https://github.com/starkswap/amm-contracts',
    initialCommit: 'a1b2c3d4e5f6a7b8',
    docs: 'https://docs.starkswap.io',
    status: 'pending',
    clientCompanyId: null, // Will be set after company insertion
    auditorCompanyId: null, // Will be set after company insertion  
    createdBy: null // Will be set after user insertion
  },
  
  // Approved scope - CairoLend approved by BlockSecure, audit will be created
  {
    protocol: 'CairoLend Lending Pool',
    website: 'https://cairolend.com',
    description: 'Decentralized lending protocol with flash loans and liquidation mechanisms',
    cairoVer: '2.4.3',
    repo: 'https://github.com/cairolend/lending-protocol',
    initialCommit: 'f1e2d3c4b5a6c7d8',
    docs: 'https://docs.cairolend.com',
    status: 'pending', // Will be approved and become audit_created
    clientCompanyId: null,
    auditorCompanyId: null,
    createdBy: null,
    approvedBy: null,
    approvalDate: null
  },
  
  // Rejected scope - NFTBridge rejected by CyberShield
  {
    protocol: 'NFTBridge Cross-Chain',
    website: 'https://nftbridge.xyz',
    description: 'Cross-chain NFT bridge between StarkNet and Ethereum',
    cairoVer: '2.4.0',
    repo: 'https://github.com/nftbridge/bridge-contracts',
    initialCommit: 'a9b8c7d6e5f4a3b2',
    docs: 'https://docs.nftbridge.xyz',
    status: 'rejected',
    clientCompanyId: null,
    auditorCompanyId: null,
    createdBy: null,
    approvedBy: null,
    approvalDate: new Date('2024-01-10'),
    rejectionReason: 'The codebase is not ready for audit. Please complete unit tests and fix compilation errors before resubmitting.'
  }
];

async function insertMockData() {
  try {
    console.log('🚀 Starting mock data insertion with new workflow...');
    await mongodb.connect();
    
    // Clear existing collections
    console.log('🧹 Clearing existing data...');
    await Company.deleteMany({});
    await User.deleteMany({});
    await Audit.deleteMany({});
    await Comment.deleteMany({});
    await Scope.deleteMany({});
    
    // Insert companies
    console.log('🏢 Inserting companies...');
    const insertedCompanies = await Company.insertMany(mockCompanies);
    console.log(`✅ Inserted ${insertedCompanies.length} companies`);
    
    // Map companies for easy reference
    const cyberShield = insertedCompanies[0]; // auditor
    const blockSecure = insertedCompanies[1]; // auditor
    const starkSwap = insertedCompanies[2];   // client
    const cairoLend = insertedCompanies[3];   // client
    const nftBridge = insertedCompanies[4];   // client
    
    // Update user company references
    mockUsers[0].companyId = null; // Admin has no company
    mockUsers[1].companyId = cyberShield._id; // Alice -> CyberShield
    mockUsers[2].companyId = cyberShield._id; // Bob -> CyberShield
    mockUsers[3].companyId = blockSecure._id; // Carol -> BlockSecure
    mockUsers[4].companyId = blockSecure._id; // Dave -> BlockSecure
    mockUsers[5].companyId = starkSwap._id;   // Eve -> StarkSwap
    mockUsers[6].companyId = starkSwap._id;   // Frank -> StarkSwap
    mockUsers[7].companyId = cairoLend._id;   // Grace -> CairoLend
    mockUsers[8].companyId = nftBridge._id;   // Henry -> NFTBridge
    
    // Insert users
    console.log('👥 Inserting users...');
    const insertedUsers = await User.insertMany(mockUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);
    
    // Map users for easy reference
    const [admin, alice, bob, carol, dave, eve, frank, grace, henry] = insertedUsers;
    
    // Update company user references
    await Company.findByIdAndUpdate(cyberShield._id, {
      companyManagers: [alice._id],
      companyUsers: [alice._id, bob._id]
    });
    
    await Company.findByIdAndUpdate(blockSecure._id, {
      companyManagers: [carol._id],
      companyUsers: [carol._id, dave._id]
    });
    
    await Company.findByIdAndUpdate(starkSwap._id, {
      companyManagers: [eve._id],
      companyUsers: [eve._id, frank._id]
    });
    
    await Company.findByIdAndUpdate(cairoLend._id, {
      companyManagers: [grace._id],
      companyUsers: [grace._id]
    });
    
    await Company.findByIdAndUpdate(nftBridge._id, {
      companyManagers: [henry._id],
      companyUsers: [henry._id]
    });
    
    // Update scope references
    mockScopes[0].clientCompanyId = starkSwap._id;
    mockScopes[0].auditorCompanyId = cyberShield._id;
    mockScopes[0].createdBy = eve._id;
    
    mockScopes[1].clientCompanyId = cairoLend._id;
    mockScopes[1].auditorCompanyId = blockSecure._id;
    mockScopes[1].createdBy = grace._id;
    
    mockScopes[2].clientCompanyId = nftBridge._id;
    mockScopes[2].auditorCompanyId = cyberShield._id;
    mockScopes[2].createdBy = henry._id;
    mockScopes[2].approvedBy = alice._id;
    
    // Insert scopes
    console.log('📋 Inserting scopes...');
    const insertedScopes = await Scope.insertMany(mockScopes);
    console.log(`✅ Inserted ${insertedScopes.length} scopes`);
    
    // Approve the CairoLend scope and create audit
    console.log('✅ Approving CairoLend scope and creating audit...');
    const cairoLendScope = insertedScopes[1];
    cairoLendScope.status = 'approved';
    cairoLendScope.approvedBy = carol._id;
    cairoLendScope.approvalDate = new Date();
    await cairoLendScope.save();
    
    // Create audit from approved scope
    const auditFromScope = new Audit({
      status: 'In Progress',
      scope: [cairoLendScope.repo],
      summary: {
        protocol: cairoLendScope.protocol,
        website: cairoLendScope.website,
        description: cairoLendScope.description,
        cairoVer: cairoLendScope.cairoVer,
        finalReportDate: '',
        repo: cairoLendScope.repo,
        initialCommit: cairoLendScope.initialCommit,
        finalCommit: '',
        docs: cairoLendScope.docs,
        testSuiteAssesment: 'Initial test coverage assessment pending'
      },
      issues: {
        critical: [],
        high: [
          {
            title: 'Flash Loan Reentrancy Vulnerability',
            files: ['src/lending_pool.cairo'],
            description: 'The flash loan function does not properly protect against reentrancy attacks during the callback execution.',
            recommendation: 'Implement reentrancy guard and follow checks-effects-interactions pattern.',
            status: 'Open',
            clientUpdate: 'Acknowledged, investigating the issue',
            code: 'fn execute_flash_loan(recipient: ContractAddress, amount: u256, data: Span<felt252>) {\n    // vulnerable pattern\n    IERC20Dispatcher { contract_address: token }.transfer(recipient, amount);\n    IFlashLoanReceiver { contract_address: recipient }.execute_operation(token, amount, fee, data);\n    // balance check after external call\n}'
          }
        ],
        medium: [
          {
            title: 'Interest Rate Calculation Precision Loss',
            files: ['src/interest_rate_model.cairo'],
            description: 'Integer division in interest rate calculations may cause precision loss.',
            recommendation: 'Use fixed-point arithmetic for more precise calculations.',
            status: 'Open',
            clientUpdate: 'Will implement in next version',
            code: 'let interest_rate = utilization_rate * base_rate / PRECISION;'
          }
        ],
        low: [],
        info: [],
        bestPractices: [
          {
            title: 'Add More Comprehensive Events',
            files: ['src/lending_pool.cairo'],
            description: 'Consider adding more detailed events for better off-chain monitoring.',
            recommendation: 'Add events for all state changes including interest rate updates.',
            status: 'Open',
            clientUpdate: 'Good suggestion, will implement',
            code: 'fn update_interest_rates() {\n    // add event emission here\n    self.emit(InterestRatesUpdated { ... });\n}'
          }
        ]
      },
      test: {
        compilation: 'All contracts compile successfully with Cairo 2.4.3',
        tests: 'Test coverage: 70% - Need more integration tests for flash loan scenarios'
      }
    });
    
    await auditFromScope.save();
    console.log('✅ Created audit from approved scope');
    
    // Update scope with audit reference
    cairoLendScope.status = 'audit_created';
    cairoLendScope.auditId = auditFromScope._id;
    await cairoLendScope.save();
    
    // Update user and company references
    await User.findByIdAndUpdate(grace._id, { 
      $addToSet: { customerReportId: auditFromScope._id }
    });
    await User.findByIdAndUpdate(carol._id, { 
      $addToSet: { customerReportId: auditFromScope._id }
    });
    
    await Company.findByIdAndUpdate(cairoLend._id, {
      $addToSet: { companyReportId: auditFromScope._id }
    });
    await Company.findByIdAndUpdate(blockSecure._id, {
      $addToSet: { companyReportId: auditFromScope._id }
    });
    
    // Create comments for the audit
    const mockComments = [
      {
        content: 'The flash loan vulnerability is critical and needs immediate attention. This could lead to significant funds being drained.',
        author: {
          id: carol._id,
          name: 'CarolBlockchainAuditor'
        },
        auditId: auditFromScope._id,
        issueId: auditFromScope.issues.high[0]._id
      },
      {
        content: 'We understand the severity of this issue. Our team is already working on implementing the reentrancy guard. Expected fix by end of week.',
        author: {
          id: grace._id,
          name: 'GraceFinanceLead'
        },
        auditId: auditFromScope._id,
        issueId: auditFromScope.issues.high[0]._id
      },
      {
        content: 'Overall, the protocol architecture is well-designed. The interest rate model is innovative and the liquidation logic is sound.',
        author: {
          id: dave._id,
          name: 'DaveSmartContractExpert'
        },
        auditId: auditFromScope._id,
        issueId: ''
      },
      {
        content: 'Thank you for the thorough review. We appreciate the detailed feedback and will address all findings systematically.',
        author: {
          id: grace._id,
          name: 'GraceFinanceLead'
        },
        auditId: auditFromScope._id,
        issueId: ''
      }
    ];
    
    console.log('💬 Inserting comments...');
    const insertedComments = await Comment.insertMany(mockComments);
    console.log(`✅ Inserted ${insertedComments.length} comments`);
    
    console.log('\n🎉 Mock data insertion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Companies: ${insertedCompanies.length} (2 auditor, 3 client)`);
    console.log(`- Users: ${insertedUsers.length} (1 admin, 4 auditors, 4 clients)`);
    console.log(`- Scopes: ${insertedScopes.length} (1 pending, 1 audit_created, 1 rejected)`);
    console.log(`- Audits: 1 (created from approved scope)`);
    console.log(`- Comments: ${insertedComments.length}`);
    
    console.log('\n🔄 Workflow Examples Created:');
    console.log('1. StarkSwap -> CyberShield: Pending scope waiting for approval');
    console.log('2. CairoLend -> BlockSecure: Approved scope, audit created and in progress');
    console.log('3. NFTBridge -> CyberShield: Rejected scope with feedback');
    
  } catch (error) {
    console.error('❌ Error inserting mock data:', error);
  } finally {
    await mongodb.disconnect();
    process.exit(0);
  }
}

insertMockData();