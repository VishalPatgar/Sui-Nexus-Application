# ✅ Sui Nexus - Testnet Deployment Checklist

**Project:** Sui Nexus - Decentralized Knowledge Graph  
**Network:** Sui Testnet (Default)  
**Status:** Ready for Deployment

---

## 🎯 Pre-Deployment Setup (Developer Machine)

### Step 1: Environment Setup
- [ ] Install Node.js v18+ ([Download](https://nodejs.org/))
- [ ] Install Sui CLI: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`
- [ ] Verify installation: `sui --version`
- [ ] Verify Node.js: `node -v` (should be v18+)

### Step 2: Project Setup
- [ ] Clone repository: `git clone https://github.com/VishalPatgar/Sui-Nexus-Application.git`
- [ ] Navigate to project: `cd Sui-Nexus-Application`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env`

### Step 3: Verify Configuration Files
- [ ] Check `src/config.ts` exists ✅
- [ ] Check `src/constants.ts` exists ✅
- [ ] Check `server-config.ts` exists ✅
- [ ] Check `.env` is configured ✅
- [ ] Check `TESTNET_SETUP.md` exists ✅

---

## 🔐 Testnet Account Setup

### Step 4: Create Sui Wallet Address
```bash
sui client new-address ed25519
```
- [ ] New address created (note down the address)
- [ ] Address format: `0x...` (64 hex characters)

### Step 5: Request Testnet Gas
- [ ] Open faucet: https://faucet.testnet.sui.io/
- [ ] Paste your address from Step 4
- [ ] Click "Request SUI"
- [ ] Wait for confirmation
- [ ] Check balance: `sui client balance`
- [ ] Should show: **100 SUI** tokens

### Step 6: Verify Connection
```bash
sui client active-address
```
- [ ] Should show your address
- [ ] Network should be: `testnet`

---

## 📦 Move Contract Deployment

### Step 7: Navigate to Move Package
```bash
cd move/sui_nexus
```
- [ ] Directory changed successfully
- [ ] Can see `Move.toml` file

### Step 8: Publish Contract to Testnet
```bash
sui client publish --gas-budget 200000000 --env testnet
```
- [ ] Command executed without errors
- [ ] See output with: `----- Transaction executed successfully. -----`
- [ ] **COPY THE PACKAGE ID** from output (marked as `Package ID: 0x...`)

### Step 9: Record Package ID
```
Your Package ID: ____________________________________
(Paste the 0x... value from Step 8)
```

---

## ⚙️ Update Application Configuration

### Step 10: Update Package ID in Constants
Edit `src/constants.ts`:

1. [ ] Locate `PACKAGE_CONFIG` object
2. [ ] Find `testnet:` section
3. [ ] Update `packageId` field:
   ```typescript
   testnet: {
     packageId: '0x_PASTE_YOUR_PACKAGE_ID_HERE',
     // ...
   }
   ```
4. [ ] Save file

### Step 11: Verify Frontend Configuration
- [ ] Open `src/main.tsx`
- [ ] Confirm: `defaultNetwork={DEFAULT_NETWORK}`
- [ ] Should use testnet (DEFAULT_NETWORK = 'testnet')

### Step 12: Verify Backend Configuration
- [ ] Open `server-config.ts`
- [ ] Confirm: `network: 'testnet'` in SUI_CONFIG
- [ ] Check Walrus URL is testnet endpoint

---

## 🚀 Running the Application

### Step 13: Start Backend Server

**Terminal 1:**
```bash
npm run dev
```
- [ ] Command executed
- [ ] See output: `Server running on port 3000`
- [ ] No errors in console

### Step 14: Start Frontend

**Terminal 2 (new terminal):**
```bash
npm run build
npm run start
```
- [ ] Build completed successfully
- [ ] Frontend server started
- [ ] See message: `Local: http://localhost:5173`

### Step 15: Access Application
- [ ] Open browser: http://localhost:5173
- [ ] Application loads without errors
- [ ] Can see the knowledge graph interface
- [ ] No red error messages

---

## 🔗 Wallet Integration

### Step 16: Install Sui Wallet
- [ ] Have browser installed (Chrome/Brave/Firefox)
- [ ] Install Sui Wallet extension: https://chrome.google.com/webstore/detail/sui-wallet/

### Step 17: Configure Wallet for Testnet
- [ ] Open Sui Wallet extension
- [ ] Click settings (gear icon)
- [ ] Select network: **Testnet**
- [ ] Should be on testnet (check network indicator)

### Step 18: Connect Wallet to Application
- [ ] Click "Connect Wallet" in application
- [ ] Approve in wallet popup
- [ ] Should show your address in UI
- [ ] Wallet icon should show connected status

---

## 🧪 Testing Functionality

### Step 19: Create Knowledge Node
- [ ] Click "Create Node" or "Add Knowledge"
- [ ] Fill in test data:
  - Name: "Test Sui Node"
  - Description: "Testing Sui Nexus on testnet"
  - Tags: "test, sui, testnet"
- [ ] Submit form
- [ ] See success message
- [ ] Node appears in graph
- [ ] Node ID displayed

### Step 20: Create Relationship Edge
- [ ] Click "Create Relationship"
- [ ] Select source and target nodes
- [ ] Choose relationship type: "cites"
- [ ] Set weight: 75
- [ ] Submit form
- [ ] See success message
- [ ] Edge appears in graph

### Step 21: Verify Walrus Storage
- [ ] Check backend logs for: `[Walrus]` messages
- [ ] Should see: `Storing metadata for node...`
- [ ] Should see: `walrus_blob_id` in response
- [ ] Transaction should show blob reference

### Step 22: View Transactions
- [ ] Open "Ledger Explorer" tab
- [ ] Should see recent transactions
- [ ] Each transaction shows:
  - [ ] Digest
  - [ ] Sender address
  - [ ] Timestamp
  - [ ] Gas used
  - [ ] Status (success/failure)

### Step 23: Query Knowledge Graph
Via API (Terminal 3):
```bash
curl http://localhost:3000/api/graph | jq
```
- [ ] Returns JSON with nodes and edges
- [ ] Nodes include your test node
- [ ] Edges include your test relationship
- [ ] All data persisted in database

---

## 📊 Verification Tests

### Step 24: API Endpoint Tests
- [ ] `GET /api/graph` - Returns nodes and edges ✅
- [ ] `POST /api/node` - Creates new node ✅
- [ ] `POST /api/relationship` - Creates edge ✅
- [ ] `GET /api/transactions` - Returns tx history ✅
- [ ] `GET /api/proposals` - Returns proposals ✅
- [ ] `GET /api/events` - Returns SSE stream ✅

### Step 25: Database Verification
```bash
sqlite3 dev.db "SELECT COUNT(*) FROM KnowledgeNode;"
```
- [ ] Returns count > 0 (has seed data + your test node)
- [ ] Data persists across sessions

### Step 26: Network Configuration
- [ ] Check `src/config.ts` is using testnet endpoint
- [ ] Verify: `testnet: { url: 'https://fullnode.testnet.sui.io:443' }`
- [ ] Check `server-config.ts` uses testnet endpoint

---

## 🔍 Final Verification

### Step 27: UI Functionality Check
- [ ] [ ] Graph renders without errors
- [ ] [ ] Can pan/zoom the graph
- [ ] [ ] Can create nodes via UI
- [ ] [ ] Can create edges via UI
- [ ] [ ] Transaction history displays
- [ ] [ ] Wallet connects properly
- [ ] [ ] All buttons respond

### Step 28: No Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Should show NO red error messages
- [ ] Only warnings/info messages OK

### Step 29: Backend Logs Clean
- [ ] Terminal 1 shows no errors
- [ ] All Walrus operations successful
- [ ] All database operations successful
- [ ] Port 3000 accessible

---

## 🎉 Pre-Commit Checklist

### Step 30: Code Quality
- [ ] Run: `npm run lint`
- [ ] No TypeScript errors
- [ ] No linting warnings

### Step 31: File Organization
- [ ] Check all new files created:
  - [ ] `src/config.ts` ✅
  - [ ] `src/constants.ts` ✅
  - [ ] `server-config.ts` ✅
  - [ ] `TESTNET_SETUP.md` ✅
  - [ ] `CHANGES_SUMMARY.md` ✅
- [ ] Check modified files:
  - [ ] `README.md` (updated) ✅
  - [ ] `src/main.tsx` (testnet default) ✅
  - [ ] `.env` (testnet config) ✅
  - [ ] `.env.example` (template) ✅

### Step 32: Documentation Review
- [ ] README.md is comprehensive ✅
- [ ] TESTNET_SETUP.md is detailed ✅
- [ ] CHANGES_SUMMARY.md is clear ✅
- [ ] Comments in code are clear ✅
- [ ] No TODO comments left ✅

---

## 📤 GitHub Repository Update

### Step 33: Prepare Repository
```bash
git status
```
- [ ] See all changes listed
- [ ] No unexpected files

### Step 34: Stage Changes
```bash
git add .
```
- [ ] All files staged

### Step 35: Commit Changes
```bash
git commit -m "Configure Sui Nexus for testnet with centralized config and enhanced documentation"
```
- [ ] Commit created with message

### Step 36: Push to Repository
```bash
git push origin main
```
- [ ] Changes pushed to GitHub
- [ ] Verify on GitHub.com

### Step 37: Verify GitHub Update
- [ ] Go to: https://github.com/VishalPatgar/Sui-Nexus-Application
- [ ] Check: Latest commit shows your message
- [ ] Check: Files updated
  - [ ] README.md shows new content
  - [ ] New files visible (config.ts, etc.)
  - [ ] .env shows testnet variables

---

## 🚀 Production Deployment (Future)

### Step 38: Create Release (Optional)
```bash
git tag -a v1.0.0-testnet -m "Testnet release with centralized config"
git push origin v1.0.0-testnet
```
- [ ] Tag created
- [ ] Visible in GitHub Releases

### Step 39: Document Deployment
On GitHub, create Release Notes with:
- [ ] List of changes from CHANGES_SUMMARY.md
- [ ] Links to TESTNET_SETUP.md
- [ ] Known issues (if any)
- [ ] Next steps for developers

---

## ✨ Post-Deployment

### Step 40: Announce Update
- [ ] Update project status to "Testnet Ready"
- [ ] Share TESTNET_SETUP.md link with users
- [ ] Highlight new configuration files
- [ ] Mention Walrus integration

### Step 41: Monitor Operations
For next 24 hours, monitor:
- [ ] No spike in errors
- [ ] Walrus storage working
- [ ] Database operations normal
- [ ] Network connection stable

### Step 42: Gather Feedback
- [ ] Ask users about experience
- [ ] Note any issues
- [ ] Collect improvement ideas
- [ ] Document for v1.0.1

---

## 📋 Summary

**Total Steps:** 42  
**Estimated Time:** 30-45 minutes  
**Difficulty:** Easy to Moderate  
**Prerequisites:** Node.js, Git, Sui CLI

### Critical Checkpoints:
1. ✅ Testnet gas acquired (Step 5)
2. ✅ Move contract deployed (Step 8)
3. ✅ Package ID recorded (Step 9)
4. ✅ Constants updated (Step 10)
5. ✅ Application running (Step 14)
6. ✅ Test node created (Step 19)
7. ✅ GitHub updated (Step 36)

---

## 🆘 If Something Goes Wrong

### Issue: "Cannot connect to testnet"
→ See [TESTNET_SETUP.md - Troubleshooting](./TESTNET_SETUP.md#-troubleshooting)

### Issue: "Move deployment failed"
→ Check gas budget and try: `sui client publish --gas-budget 500000000 --env testnet`

### Issue: "No nodes appearing"
→ Check if database was seeded and backend is running

### Issue: "Wallet not connecting"
→ Verify wallet is on testnet network and has gas

### Issue: "Cannot push to GitHub"
→ Check git credentials and repository access

---

## ✅ Completion

**When all 42 steps are complete:**
- ✅ Sui Nexus is configured for Testnet
- ✅ Code is clean and organized
- ✅ Documentation is comprehensive
- ✅ GitHub is updated
- ✅ Ready for production use on testnet

---

**Status:** Ready to proceed → [Continue with Step 1](#-pre-deployment-setup-developer-machine)

**Need help?** See [TESTNET_SETUP.md](./TESTNET_SETUP.md) or [README.md](./README.md)
