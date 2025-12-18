import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Déploiement du contrat Voting...\n");

  // Récupération du déployeur
  const [deployer] = await ethers.getSigners();
  console.log("📍 Déployeur:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Déploiement
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("✅ Voting déployé à l'adresse:", address);
  console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/address/${address}\n`);

  // Sauvegarde de l'adresse pour le frontend
  console.log("📝 Ajoutez cette adresse dans votre fichier .env du frontend:");
  console.log(`NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
