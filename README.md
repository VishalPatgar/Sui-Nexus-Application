# 🌌 Sui Nexus

<img src="src/sui-nexus-logo.png" alt="Sui Nexus Logo" width="200"/>

> **Sui Nexus** — a decentralized knowledge canvas built on the **Sui blockchain**, where facts become living digital objects, disputes are resolved through staking consensus, and ideas evolve transparently.

---

## ⚙️ What It Is
Sui Nexus is a **next‑generation dApp** that transforms how information is stored, verified, and upgraded.  
It uses **Move smart contracts** and **DAO governance** to create a **trust layer for human knowledge** — permanent yet adaptable.

---

## 🔮 Core Features
- **Immutable Knowledge Objects:** Facts stored as blockchain entities with full provenance.  
- **Dynamic Upgrades:** Facts can evolve while preserving their history.  
- **Concept Graphs:** Link ideas through transaction‑backed edges to form a living web of truth.  
- **Community Governance:** Disputes resolved via staking votes and DAO moderation.  
- **Developer Terminal:** Explore, query, and interact with the Sui ledger directly.
- **Walrus Integration:** Decentralized off-chain storage for knowledge node metadata.

---

## 🌍 Potential Use Cases
| Domain | Application |
|--------|--------------|
| **Research & Academia** | Publish peer‑reviewed facts as immutable objects. |
| **Open Source** | Document evolving standards and protocols transparently. |
| **Decentralized Journalism** | Store verified claims and resolve disputes publicly. |
| **Education** | Build a blockchain‑backed encyclopedia curated by learners. |
| **AI & Data Science** | Feed verifiable, auditable knowledge into AI models. |

---

## 💡 Vision
Imagine **Wikipedia meets GitHub**, powered by blockchain consensus — a **living library of truth** where every idea, correction, and connection is recorded forever.  
That's **Sui Nexus**: the **Nexus of Knowledge**, decentralized, transparent, and unstoppable.

---

## 🧩 Tech Stack
- **Blockchain:** Sui (Testnet)
- **Smart Contracts:** Move Language
- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Express.js + Node.js
- **Database:** Prisma ORM + SQLite (scalable to PostgreSQL)
- **Storage:** Walrus Decentralized Storage (Testnet)
- **State Management:** TanStack React Query
- **UI Components:** Lucide React + Tailwind CSS
- **AI Integration:** Google Generative AI (Gemini)
- **Visualization:** D3.js for Knowledge Graph

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js v18+
- Git
- Sui CLI ([Install Guide](https://docs.sui.io/guides/developer/getting-started/sui-install))

### Installation

```bash
# Clone repository
git clone https://github.com/VishalPatgar/Sui-Nexus-Application.git
cd Sui-Nexus-Application

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Run Locally

```bash
# Terminal 1: Start backend API server
npm run dev

# Terminal 2: Start frontend (in another terminal)
npm run build
npm run start
```

Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## 🌐 Testnet Deployment

Sui Nexus is **fully configured for Testnet by default**.

For complete setup instructions including:
- Requesting testnet gas from the faucet
- Deploying Move contracts to testnet
- Configuring Walrus storage
- Running on different networks (devnet, mainnet)

👉 **See [TESTNET_SETUP.md](./TESTNET_SETUP.md)** for detailed deployment guide.

---

## 📂 Project Structure

```
sui-nexus/
├── src/
│   ├── config.ts              # 🎯 Frontend network configuration
│   ├── constants.ts           # 📋 Package IDs and constants
│   ├── main.tsx               # App entry (testnet by default)
│   ├── App.tsx                # Root component
│   ├── types.ts               # TypeScript interfaces
│   ├── index.css              # Global styles
│   └── components/
│       ├── GraphCanvas.tsx    # Knowledge graph visualization
│       ├── WalletConnect.tsx  # Sui wallet integration
│       ├── SuiTerminal.tsx    # Ledger explorer
│       ├── LedgerExplorer.tsx # Transaction history
│       ├── DaoCuration.tsx    # Governance interface
│       ├── FeatureShowcase.tsx
│       └── SevenWonders.tsx
├── move/
│   └── sui_nexus/
│       ├── Move.toml          # Move package (testnet configured)
│       ├── sources/
│       │   ├── nexus.move     # Core protocol
│       │   └── sui_nexus.move
│       └── build/             # Compiled bytecode
├── api/
│   └── index.ts               # API route handlers
├── server.ts                  # Express.js backend server
├── server-config.ts           # Backend configuration
├── prisma/
│   └── schema.prisma          # Database schema
├── .env                       # Environment variables (testnet)
├── .env.example               # Environment template
├── TESTNET_SETUP.md           # 📖 Detailed deployment guide
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server (backend + frontend)
npm run build        # Build frontend
npm run start        # Run production build
npm run lint         # TypeScript type checking
npm run clean        # Clean build artifacts
```

### Environment Configuration

**Frontend Network Selection:** Edit `src/config.ts` to change networks.

**Current Default:** `testnet` (as configured in `src/main.tsx`)

**Available Networks:**
- `testnet` - Sui Testnet (default) ✅
- `devnet` - Sui Devnet
- `mainnet` - Sui Mainnet (production)

---

## 📡 API Endpoints

### Knowledge Graph

```
GET  /api/graph               # Fetch all nodes and edges
POST /api/node                # Create knowledge node
POST /api/node/update         # Update existing node
GET  /api/node/:id            # Get specific node
```

### Relationships

```
POST /api/relationship        # Create relationship edge
GET  /api/relationships       # List all relationships
```

### Transactions & History

```
GET  /api/transactions        # Fetch recent transactions
GET  /api/transactions/:id    # Get transaction details
```

### Governance

```
GET  /api/proposals           # List all proposals
POST /api/proposal/create     # Create new proposal
POST /api/proposal/:id/vote   # Vote on proposal
```

### Real-time Updates

```
GET  /api/events              # Server-Sent Events stream
```

---

## 🔐 Network Configuration

### Sui Testnet
- **RPC Endpoint:** `https://fullnode.testnet.sui.io:443`
- **Faucet:** https://faucet.testnet.sui.io/
- **Explorer:** https://suiscan.xyz/testnet
- **Status:** ✅ Active

### Walrus Testnet
- **Publisher:** `https://publisher.walrus-testnet.walrus.space/v1/store`
- **Aggregator:** `https://aggregator.walrus-testnet.walrus.space`
- **Documentation:** https://docs.walrus.site

---

## 📚 Key Files & Configuration

### Frontend Network Config
- **File:** [src/config.ts](src/config.ts)
- **Controls:** Network endpoints, Walrus configuration
- **Default:** Testnet

### Frontend Constants
- **File:** [src/constants.ts](src/constants.ts)
- **Contains:** Package IDs, contract addresses, feature flags
- **Update After Deploy:** Package IDs from Move contract deployment

### Backend Configuration
- **File:** [server-config.ts](server-config.ts)
- **Controls:** Server port, network URLs, database settings

### Environment Variables
- **File:** [.env](.env)
- **Template:** [.env.example](.env.example)
- **Key Variables:**
  - `VITE_NETWORK` - Sui network selection
  - `DATABASE_URL` - Prisma database path
  - `VITE_WALRUS_PUBLISHER_URL` - Walrus storage endpoint

---

## 🎓 Learning Resources

### Sui Documentation
- [Sui Official Docs](https://docs.sui.io)
- [Move Language Guide](https://move-language.github.io/move/)
- [Sui Object Model](https://docs.sui.io/concepts/object-model)

### Walrus Documentation
- [Walrus Getting Started](https://docs.walrus.site)
- [Blob Storage Guide](https://docs.walrus.site/docs/use/blob-storage)

### Developer Guides
- [Building dApps on Sui](https://docs.sui.io/guides/developer)
- [Sui CLI Reference](https://docs.sui.io/references/cli)

---

## 🚨 Troubleshooting

### Issue: "Cannot find module..."
```bash
npm install
```

### Issue: Testnet connection failed
- Check internet connection
- Verify Sui network status: https://sui-rpc-status.com/
- Try switching networks: `sui client switch --env testnet`

### Issue: Move contract deployment fails
```bash
# Increase gas budget
sui client publish --gas-budget 500000000 --env testnet
```

### Issue: Port already in use
```bash
# Change port in .env or server.ts
PORT=3001 npm run dev
```

👉 **For more troubleshooting, see [TESTNET_SETUP.md](./TESTNET_SETUP.md#-troubleshooting)**

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📝 License

Sui Nexus is licensed under the **Apache License 2.0**.  
See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Vishal Patgar**  
- GitHub: [@VishalPatgar](https://github.com/VishalPatgar)
- Project: [Sui-Nexus-Application](https://github.com/VishalPatgar/Sui-Nexus-Application)

---

## 🌟 Acknowledgments

- Built for **Sui Overflow 2026** - Walrus Track
- Uses **Walrus Testnet** for decentralized storage
- Integrated with **Sui L1 Blockchain**
- Inspired by Wikipedia, GitHub, and decentralized knowledge protocols

---

## ❓ Support & Community

- **GitHub Issues:** [Report bugs & request features](https://github.com/VishalPatgar/Sui-Nexus-Application/issues)
- **Sui Community:** [Discord](https://discord.gg/sui) | [Twitter](https://twitter.com/mysten_labs)
- **Walrus Community:** https://walrus.space

---

## 📊 Status

| Feature | Status |
|---------|--------|
| Frontend (React) | ✅ Ready |
| Backend (Express) | ✅ Ready |
| Move Contracts | ✅ Ready |
| Testnet Deployment | ✅ Ready |
| Walrus Integration | ✅ Ready |
| Devnet Support | ✅ Available |
| Mainnet Support | 🔄 Future |

---

**Last Updated:** June 2026  
**Network:** Testnet (default)  
**Status:** ✅ Production Ready
