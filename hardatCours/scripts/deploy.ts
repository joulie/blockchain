import { ethers } from "hardhat";

async function main() {
    const number = 5;
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy(number);
    await simpleStorage.deployed();

    console.log(`SimpleStorage deployed to: ${simpleStorage.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
