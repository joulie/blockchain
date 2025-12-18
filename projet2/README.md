# Projet Voting - Tests Unitaires

## Description

le contrat Solidity `Voting.sol` implémente un système de vote décentralisé avec gestion de workflow. Les test unitaires sont dans le répertoire TU

## Architecture du Contrat

Le contrat Voting gère un processus de vote en 6 étapes :

0. **RegisteringVoters** - Enregistrement des votants
1. **ProposalsRegistrationStarted** - Début de l'enregistrement des propositions
2. **ProposalsRegistrationEnded** - Fin de l'enregistrement des propositions
3. **VotingSessionStarted** - Début de la session de vote
4. **VotingSessionEnded** - Fin de la session de vote
5. **VotesTallied** - Votes comptabilisés

## Contenu du répertoire TU concernant les Tests Unitaires

#### 🎯 Tests sur les Events
- **Émission de VoterRegistered** : Vérifie qu'un event est émis lors de l'ajout d'un votant
- **Comptage de VoterRegistered** : Vérifie que le nombre d'events correspond au nombre de votants ajoutés (3 votants = 3 events)

#### ⛔ Tests sur les Reverts
- **Double enregistrement** : Vérifie qu'on ne peut pas ajouter le même votant deux fois
- **Vote d'un non-votant** : Vérifie qu'une personne non enregistrée ne peut pas proposer
- **Double vote** : Vérifie qu'un votant ne peut pas voter deux fois

#### 🔄 Test du Cycle Complet
- **Workflow complet** : Teste toutes les phases du vote de bout en bout
  - Enregistrement de 3 votants
  - Enregistrement de 3 propositions
  - 3 votes (proposition 1 gagne avec 2 votes)
  - Vérification du gagnant
  - Vérification des 5 transitions d'état (5 events WorkflowStatusChange)

## Technologies Utilisées

- **Hardhat 2.22.0** - Framework de développement Ethereum
- **Solidity 0.8.28** - Langage du smart contract
- **ethers.js v6** - Bibliothèque d'interaction blockchain
- **TypeScript** - Langage des tests
- **Chai** - Assertions
- **OpenZeppelin Contracts v5.0.1** - Contrat Ownable

## Installation

```bash
npm install
```

## Compilation

```bash
npx hardhat compile
```

## Lancer les Tests

### Tests ciblés (Voting.t.ts)
```bash
npx hardhat test TU/Voting.t.ts
```

### Couverture de code (84% de coverage sur Voting.t.ts)
```bash
npx hardhat coverage --testfiles "TU/Voting.t.ts"
```

## Scenarios de tests

### Événements Testés
- `VoterRegistered(address)` - Émis lors de l'ajout d'un votant
- `WorkflowStatusChange(WorkflowStatus, WorkflowStatus)` - Émis lors des transitions
### Événements restants à tester 
- `ProposalRegistered(uint)` - Émis lors de l'ajout d'une proposition
- `Voted(address, uint)` - Émis lors d'un vote

## Structure du Projet

```
projet2/
├── contracts/
│   └── Voting.sol          # Contrat principal
├── TU/
│   ├── Voting.t.ts         # 6 tests ciblés
├── hardhat.config.ts       # Configuration Hardhat
├── package.json
└── README.md
```

## Contexte

Projet réalisé dans le cadre de la formation Alyra

# Commandes linux utiles

## Installation initiale
npm init -y

## Installation des dépendances Hardhat (avec --legacy-peer-deps pour éviter les conflits)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers @typechain/hardhat typechain --legacy-peer-deps

## Installation d'OpenZeppelin
npm install @openzeppelin/contracts --legacy-peer-deps

## Installation des packages pour les tests
npm install --save-dev @nomicfoundation/hardhat-chai-matchers chai --legacy-peer-deps

## Organisation des fichiers
mkdir -p contracts

## En cas de problème : Réinitialisation complète du projet
rm -rf node_modules package-lock.json
# Puis réinstaller avec npm install

## Compilation du contrat
npx hardhat compile

## Lancer les tests
npx hardhat test

## Lancer un test spécifique
npx hardhat test TU/Voting.test.ts

## Autres commandes utiles

# Nettoyer les artifacts et cache
npx hardhat clean

# Voir les comptes disponibles
npx hardhat accounts

# Obtenir de l'aide
npx hardhat help

# Voir les comptes de test hardhat utilisables
npx hardhat node

# Recompiler et relancer
cd /home/alex/dev/blockchain/projet2 && npx hardhat clean && npx hardhat compile --force
cd /home/alex/dev/blockchain/projet2 && npx hardhat test TU/Voting.t.ts