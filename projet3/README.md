# Projet 3 - DApp Système de Vote

## Objectif
Créer une DApp complète avec interface frontend pour le système de vote décentralisé.

## Spécifications

### Fonctionnalités Admin
- Enregistrer une liste blanche d'électeurs
- Commencer la session d'enregistrement des propositions
- Mettre fin à la session d'enregistrement des propositions
- Commencer la session de vote
- Mettre fin à la session de vote
- Comptabiliser les votes

### Fonctionnalités Électeurs
- Enregistrer des propositions (si inscrit)
- Voter pour une proposition (si inscrit)

### Fonctionnalités Publiques
- Consulter le résultat du vote

## Architecture du Projet

```
projet3/
├── contracts/          # Smart contracts Solidity
│   └── Voting.sol
├── TU/                 # Tests unitaires
│   └── Voting.t.ts
├── frontend/           # Application Next.js 
│   ├── app/
│   ├── components/
│   └── lib/
├── hardhat.config.ts
├── package.json
└── README.md
```

## Stack Technique

### Backend (Smart Contract)
- Solidity ^0.8.28
- Hardhat
- OpenZeppelin Contracts
- TypeScript pour les tests

### Frontend (DApp)
- Next.js 15 (App Router)
- React 19
- TypeScript
- ethers.js v6
- Wagmi / RainbowKit (pour la connexion wallet)
- TailwindCSS (styling)

### Déploiement
- Smart Contract : Sepolia Testnet
- Frontend : Vercel

## Guide de Mise en Place

### Phase 1 : Optimisation du Smart Contract 

#### 1.2 Améliorations fonctionnelles
- [ ] Permettre à tout le monde de voir les propositions (getter public)
- [ ] Permettre à tout le monde de voir le résultat (getter public)
- [ ] Gérer les cas d'égalité dans le vote

### Phase 2 : Création du Frontend 

#### 2.1 Initialisation du projet Next.js
```bash
cd /home/alex/dev/blockchain/projet3
npx create-next-app@latest frontend
```

#### 2.2 Installation des dépendances web3
```bash
cd frontend
npm install ethers@^6.4.0
npm install wagmi viem@2.x @tanstack/react-query
npm install @rainbow-me/rainbowkit --legacy-peer-deps
```

## Commandes utilisées
```cd /home/alex/dev/blockchain/projet3 && npm install @openzeppelin/contracts --legacy-peer-deps```

passage de uint à uint256 : pour la DAPP quand on n'est pas exclusivement en solidity il faut spécifier uint256

specification des private : pas accessible depuis une DAPP si on ecrit seulement Proposal[]   proposalsArray; : si on n'ecrit pas private c'est internal et non accessible par la DAPP  

utilisation de .env
`cd /home/alex/dev/blockchain/projet3 && npm install dotenv --legacy-peer-deps`

tester le deploiement sur sepolia  
`cd /home/alex/dev/blockchain/projet3 && npx hardhat run scripts/deploy.ts`

utilisation de hardat vars plutot que le .env
```bash
cd /home/alex/dev/blockchain/projet3

# Configurer la clé privée
npx hardhat vars set PRIVATE_KEY

# Configurer l'URL RPC Sepolia
npx hardhat vars set SEPOLIA_RPC_URL

# Configurer la clé API Etherscan (optionnel)
npx hardhat vars set ETHERSCAN_API_KEY
```
aller sur reOwn pour avoir un ID d'app https://dashboard.reown.com/ 
renseigner sa NEXT_project_id de reown dans son .env.local
copier l'ABI du contrat
cd /home/alex/dev/blockchain/projet3 && mkdir -p frontend/lib/contracts && node -e "const fs = require('fs'); const abi = require('./artifacts/contracts/Voting.sol/Voting.json').abi; fs.writeFileSync('frontend/lib/contracts/VotingABI.json', JSON.stringify(abi, null, 2));"