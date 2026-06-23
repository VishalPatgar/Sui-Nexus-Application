# 🌐 Sui Nexus - Testnet Setup & Deployment Guide

This guide provides step-by-step instructions to deploy and run **Sui Nexus** on the Sui Testnet.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Sui CLI** - Install via: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`
- **Walrus CLI** (Optional) - For verifying Walrus storage integration

### Verify Installations

```bash
node --version      # Should be v18+
npm --version       # Should be v9+
sui --version       # Should show testnet build
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Setup Repository

```bash
git clone https://github.com/VishalPatgar/Sui-Nexus-Application.git
cd Sui-Nexus-Application
npm install
```

### 2. Configure Environment Variables

Copy and update the environment file:

```bash
cp .env.example .env
```

Update `.env` with your testnet settings:

```env
# Sui Network (testnet is default)
VITE_NETWORK="testnet"

# Backend API
VITE_API_URL="http://localhost:3000"

# Gemini API (optional, for AI features)
GEMINI_API_KEY="your_gemini_api_key_here"

# Database
DATABASE_URL="file:./dev.db"
```

### 3. Request Testnet Gas

Get testnet SUI tokens from the faucet:

1. **Generate an address** (if you don't have one):
   ```bash
   sui client new-address ed25519
   ```

2. **Request gas tokens** from the [Sui Testnet Faucet](https://faucet.testnet.sui.io/)
   - Paste your address in the form
   - Click "Request SUI"
   - You should receive **100 SUI** tokens (~$0 testnet currency)

3. **Verify your balance**:
   ```bash
   sui client balance
   ```

### 4. Deploy Move Smart Contracts

Deploy the Sui Nexus Move contracts to testnet:

```bash
cd move/sui_nexus
sui client publish --gas-budget 200000000 --env testnet
```

**Important:** Copy the **Package ID** from the deployment output. You'll need this for frontend configuration.

### 5. Update Package ID

Create a `src/constants.ts` file with your deployed package:

```typescript
export const PACKAGE_CONFIG = {
  testnet: {
    packageId: '0x_YOUR_PACKAGE_ID_FROM_DEPLOYMENT',
    adminCap: '0x_ADMIN_CAP_ID_IF_APPLICABLE',
  },
};

export const DEFAULT_ENVIRONMENT = 'testnet';
```

### 6. Start Development

```bash
# Terminal 1: Backend API Server
npm run dev

# Terminal 2: Frontend Development Server (in another terminal)
npm run build && npm run start
```

Frontend should be available at: `http://localhost:5173`
Backend API at: `http://localhost:3000`

---

## 📱 Network Configuration

### Sui Networks

| Network | URL | Faucet | Status |
|---------|-----|--------|--------|
| **Testnet** (Default) | `https://fullnode.testnet.sui.io:443` | [Link](https://faucet.testnet.sui.io/) | ✅ Active |
| Devnet | `https://fullnode.devnet.sui.io:443` | [Link](https://faucet.devnet.sui.io/) | ⚠️ Development |
| Mainnet | `https://fullnode.mainnet.sui.io:443` | N/A | 🔒 Production |

### Walrus Storage Configuration

Sui Nexus integrates with **Walrus Testnet** for decentralized storage:

```env
VITE_WALRUS_PUBLISHER_URL="https://publisher.walrus-testnet.walrus.space/v1/store"
VITE_WALRUS_EPOCHS="5"
```

Knowledge node metadata is automatically stored on Walrus with 5-epoch certification.

---

## 📂 Project Structure

```
sui-nexus/
├── src/
│   ├── config.ts              # 🎯 Centralized network configuration
│   ├── main.tsx               # App entry point (uses testnet by default)
│   ├── App.tsx                # Root component
│   ├── components/            # React components
│   │   ├── GraphCanvas.tsx    # Knowledge graph visualization
│   │   ├── WalletConnect.tsx  # Wallet integration
│   │   ├── SuiTerminal.tsx    # Ledger explorer
│   │   └── ...
│   └── types.ts               # TypeScript type definitions
├── move/
│   └── sui_nexus/
│       ├── Move.toml          # Move package manifest
│       ├── sources/
│       │   ├── nexus.move     # Core protocol smart contracts
│       │   └── sui_nexus.move
│       └── build/             # Compiled bytecode
├── server.ts                  # Express.js backend + API
├── prisma/
│   └── schema.prisma          # Database schema (Prisma ORM)
├── .env                       # Environment variables
└── package.json               # Dependencies
```

---

## 🛠️ Common Operations

### Create a Knowledge Node

Via API:

```bash
curl -X POST http://localhost:3000/api/node \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sui Consensus Mechanism",
    "description": "Explanation of Sui's Byzantine-Fault-Tolerant consensus...",
    "tags": ["sui", "consensus", "blockchain"],
    "references": ["https://docs.sui.io"],
    "owner": "0x_your_address"
  }'
```

### Create a Relationship Edge

```bash
curl -X POST http://localhost:3000/api/relationship \
  -H "Content-Type: application/json" \
  -d '{
    "source": "0x_source_node_id",
    "target": "0x_target_node_id",
    "relationshipType": "cites",
    "weight": 85,
    "createdBy": "0x_your_address"
  }'
```

### Query the Knowledge Graph

```bash
curl http://localhost:3000/api/graph
```

---

## 🔍 Testing & Validation

### Run Tests

```bash
npm run lint        # TypeScript type checking
npm run test        # Run test suite (if available)
```

### Verify Testnet Connection

```bash
# Check you can connect to testnet
sui client active-address

# View your wallet
sui client addresses

# Check transaction history
sui client tx-history
```

### Verify Move Contract

```bash
# Show package info
sui client object 0x_YOUR_PACKAGE_ID

# View module info
sui client call --package 0x_YOUR_PACKAGE_ID --module nexus --function version
```

---

## 🌊 Walrus Integration Verification

To verify Walrus storage is working:

1. Create a knowledge node via the UI
2. Check the server logs for `[Walrus]` messages
3. Note the returned `walrusBlobId`
4. Query the blob info (if needed for verification)

---

## 🚨 Troubleshooting

### Issue: "Cannot find module 'sui'"

**Solution:**
```bash
npm install
```

### Issue: Testnet connection times out

**Solution:**
- Verify internet connection
- Check Sui network status: https://sui-rpc-status.com/
- Try a different Sui fullnode: `sui client switch --env testnet`

### Issue: Gas budget exceeded during Move deployment

**Solution:**
```bash
# Increase gas budget
sui client publish --gas-budget 500000000 --env testnet
```

### Issue: Wallet not connecting

**Solution:**
1. Install Sui Wallet: https://chrome.google.com/webstore/detail/sui-wallet/
2. Import your keypair or create a new address
3. Switch to Testnet network in wallet settings
4. Refresh the page

### Issue: Package ID not found

**Solution:**
- Ensure you deployed the Move contracts first
- Copy the correct Package ID from deployment output
- Update `src/constants.ts` with the new ID

---

## 📊 Monitoring & Debugging

### Backend Logs

The backend logs all transactions and Walrus operations:

```
[Sui Nexus] Seeding initial knowledge graph data...
[Walrus] Storing metadata for node...
[Sui Nexus] Database seeded successfully.
```

### Database Inspection

View SQLite database:

```bash
# Install sqlite3 CLI if needed
npm install -g sqlite3

# Open database
sqlite3 dev.db

# List tables
.tables

# Query knowledge nodes
SELECT id, name, owner FROM "KnowledgeNode" LIMIT 5;
```

### API Response Format

All API responses follow this format:

```json
{
  "nodes": [
    {
      "id": "0x...",
      "name": "Knowledge Node Name",
      "description": "...",
      "tags": ["tag1", "tag2"],
      "owner": "0x...",
      "trustScore": 95,
      "walrusBlobId": "...",
      "createdAt": 1703001600000
    }
  ]
}
```

---

## 🔐 Security Considerations

1. **Never commit `.env` files** with real API keys - add to `.gitignore`
2. **Use testnet only for development** - never use mainnet APIs with test code
3. **Validate all user inputs** on the backend before processing
4. **Use HTTPS in production** - configure proper SSL/TLS
5. **Rotate credentials regularly** - regenerate Gemini API keys periodically

---

## 🌟 Next Steps

After successful deployment:

1. **Explore the UI:** Visualize the knowledge graph on the GraphCanvas
2. **Test Walrus integration:** Create nodes and verify Walrus storage
3. **Deploy custom contracts:** Extend the Move code for your use cases
4. **Configure governance:** Set up DAO voting mechanisms
5. **Deploy to production:** Migrate to Mainnet when ready

---

## 📚 Resources

- **Sui Documentation:** https://docs.sui.io
- **Move Language Docs:** https://move-language.github.io/move/
- **Walrus Documentation:** https://docs.walrus.site
- **Sui Testnet Explorer:** https://suiscan.xyz/testnet
- **GitHub Repository:** https://github.com/VishalPatgar/Sui-Nexus-Application

---

## 🤝 Contributing

Found an issue? Want to improve the guide?

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Submit a pull request

---

## 📝 License

Sui Nexus is licensed under the **Apache License 2.0**. See [LICENSE](../LICENSE) for details.

---

## ❓ Support

For issues, questions, or suggestions:

- **GitHub Issues:** https://github.com/VishalPatgar/Sui-Nexus-Application/issues
- **Discord:** Join the Sui community
- **Telegram:** Sui Nexus community channels

---

**Last Updated:** June 2026  
**Status:** ✅ Testnet Ready
