// Import de la librairie d'assertions Chai pour les tests
import { expect } from "chai";
// Import de l'API Hardhat pour interagir avec Ethereum
import { ethers } from "hardhat";
// Import du type généré pour notre contrat Voting
import { Voting } from "../typechain-types"; 

/**
 * Tests Unitaires sur Voting 
 */
describe("Voting", function () {
  /**
   * Vérification de l'émission de l'event VoterRegistered
   * il faut que il y ait émission d'un event avec l'adresse du votant
   */
  it("Should emit event VoterRegistered when we add a voter", async function () {
    // Déploiement du contrat
    const voting = await ethers.deployContract("Voting");
    // Récupération des comptes de test
    const signers = await ethers.getSigners();
    const voter1 = signers[1];

    await expect(voting.addVoter(voter1.address)).to.emit(voting, "VoterRegistered").withArgs(voter1.address);
  });

  /**
   * Test : Comptage des events VoterRegistered
   * Utilise queryFilter pour récupérer tous les events émis depuis le déploiement
   * et vérifier que leur nombre correspond au nombre de votants enregistrés
   */
  it("La somme des events VoterRegistered devrait correspondre au nombre de votants", async function () {
    // Déploiement du contrat
    const voting = await ethers.deployContract("Voting");
    // Récupération de 3 votants
    const signers = await ethers.getSigners();
    const voter1 = signers[1];
    const voter2 = signers[2];
    const voter3 = signers[3];
    // Enregistrement du numéro de bloc au moment du déploiement
    // pour filtrer les events depuis ce point
    const deploymentBlockNumber = await ethers.provider.getBlockNumber();

    // Enregistrement de plusieurs votants
    await voting.addVoter(voter1.address);
    await voting.addVoter(voter2.address);
    await voting.addVoter(voter3.address);

    // Récupération de tous les events VoterRegistered émis depuis le déploiement
    const events = await voting.queryFilter(
      voting.filters.VoterRegistered(),
      deploymentBlockNumber
    );

    // Vérification : 3 votants ajoutés = 3 events émis
    expect(events.length).to.equal(3);
  });

});
