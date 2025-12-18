import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Récupération sécurisée des variables avec Hardhat Vars
let PRIVATE_KEY: string | undefined;
try {
  const key = vars.get("PRIVATE_KEY", "");
  // Vérifier que la clé a une longueur valide (66 caractères avec le 0x)
  PRIVATE_KEY = key && key.length === 66 ? key : undefined;
} catch {
  PRIVATE_KEY = undefined;
}

const SEPOLIA_RPC_URL = vars.get("SEPOLIA_RPC_URL", "https://eth-sepolia.g.alchemy.com/v2/demo");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY", "");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    tests: "./TU",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    ...(PRIVATE_KEY && PRIVATE_KEY.length === 66 && {
      sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 11155111
      },
      holesky: {
        url: "https://ethereum-holesky.publicnode.com",
        accounts: [PRIVATE_KEY],
        chainId: 17000
      }
    })
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};

export default config;
