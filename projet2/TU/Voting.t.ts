// Import de la librairie d'assertions Chai pour les tests
import { expect } from "chai";
// Import de l'API Hardhat pour interagir avec Ethereum
import { ethers } from "hardhat";

describe("Voting", function () {
  /***************************************************************************************************** 
   *                                    TU sur les events
   *****************************************************************************************************/
  // Vérification de l'émission de l'event VoterRegistered : émission d'un event avec l'adresse du votant
  it("Should emit event VoterRegistered when we add a voter", async function () {
    // Déploiement du contrat
    const voting = await ethers.deployContract("Voting");
    // Récupération des comptes de test
    const signers = await ethers.getSigners();
    const voter1 = signers[1];

    await expect(voting.addVoter(voter1.address)).to.emit(voting, "VoterRegistered").withArgs(voter1.address);
  });
  
  // Comptage des events VoterRegistered
  it("Should verify the count of VoterRegistered events matches the number of voters added", async function () {
    // Déploiement du contrat
    const voting = await ethers.deployContract("Voting");
    // Récupération de 3 votants
    const signers = await ethers.getSigners();
    const voter1 = signers[1];
    const voter2 = signers[2];
    const voter3 = signers[3];
    // Enregistrement du numéro de bloc au moment du déploiement pour filtrer les events depuis ce point
    const deploymentBlockNumber = await ethers.provider.getBlockNumber();

    // Enregistrement de plusieurs votants
    await voting.addVoter(voter1.address); // event VoterRegistered 1
    await voting.addVoter(voter2.address); // event VoterRegistered 2
    await voting.addVoter(voter3.address); // event VoterRegistered 3

    // Récupération de tous les events VoterRegistered émis depuis le déploiement
    const events = await voting.queryFilter(voting.filters.VoterRegistered(),deploymentBlockNumber);

    // Vérification : 3 votants ajoutés = 3 events émis
    expect(events.length).to.equal(3);
  }); 

  /***************************************************************************************************** 
  *                                    TU sur les revert
  *****************************************************************************************************/
  // Double enregistrement d'un votant
  it("Should revert if we try to add the same voter twice", async function () {
    const voting = await ethers.deployContract("Voting");
    const signers = await ethers.getSigners();
    const voter1 = signers[1];

    // Premier enregistrement : OK
    await voting.addVoter(voter1.address);
    
    // Deuxième enregistrement : doit échouer avec le message "Already registered"
    await expect(voting.addVoter(voter1.address)).to.be.revertedWith("Already registered");
  });

  // Votant non enregistré propose une proposition
  it("Should revert if a non-voter tries to vote", async function () {
    const voting = await ethers.deployContract("Voting");
    const signers = await ethers.getSigners();
    const voter1 = signers[1];
    const nonVoter = signers[2];

    // On enregistre voter1 mais pas nonVoter
    await voting.addVoter(voter1.address);
    await voting.startProposalsRegistering();

    // nonVoter tente de proposer : doit échouer
    await expect(voting.connect(nonVoter).addProposal("Proposition")).to.be.revertedWith("You're not a voter");
  });

  // Double vote
  it("Should revert if a voter tries to vote twice", async function () {
    const voting = await ethers.deployContract("Voting");
    const signers = await ethers.getSigners();
    const voter1 = signers[1];

    // Préparation de 2 propositions
    await voting.addVoter(voter1.address);
    await voting.startProposalsRegistering();
    await voting.connect(voter1).addProposal("Proposal 1");
    await voting.connect(voter1).addProposal("Proposal 2");
    await voting.endProposalsRegistering();
    await voting.startVotingSession();

    // Premier vote : OK
    await voting.connect(voter1).setVote(1);

    // Deuxième vote : doit échouer
    await expect(voting.connect(voter1).setVote(2)).to.be.revertedWith("You have already voted");
  });

  /***************************************************************************************************** 
  *                                    Cycle complet de vote
  *****************************************************************************************************/
  it("Should test the entire vote cycle and number of events", async function () {
    const voting = await ethers.deployContract("Voting");
    const signers = await ethers.getSigners();
    const voter1 = signers[1];
    const voter2 = signers[2];
    const voter3 = signers[3];

    // Sauvegarde du bloc pour filtrer tous les events depuis le début
    const deploymentBlockNumber = await ethers.provider.getBlockNumber();

    // Phase 1 : Enregistrement des votants
    await voting.addVoter(voter1.address);
    await voting.addVoter(voter2.address);
    await voting.addVoter(voter3.address);

    // Phase 2 : Enregistrement des propositions
    await voting.startProposalsRegistering(); // Event WorkflowStatusChange 1 (RegisteringVoters -> ProposalsRegistrationStarted)
    await voting.connect(voter1).addProposal("Halving every 4 years");
    await voting.connect(voter2).addProposal("Buy back and burn");
    await voting.connect(voter3).addProposal("Keep 90% of the supply like CZ on Aster");
    await voting.endProposalsRegistering(); // Event WorkflowStatusChange 2 (ProposalsRegistrationStarted -> ProposalsRegistrationEnded)

    // Phase 3 : Session de vote
    await voting.startVotingSession(); // Event WorkflowStatusChange 3 (ProposalsRegistrationEnded -> VotingSessionStarted)
    await voting.connect(voter1).setVote(1); 
    await voting.connect(voter2).setVote(2); 
    await voting.connect(voter3).setVote(1); 
    await voting.endVotingSession(); // Event WorkflowStatusChange 4 (VotingSessionStarted -> VotingSessionEnded)
   
    // Phase 4 : Décompte des votes
    await voting.tallyVotes(); // Event WorkflowStatusChange 5 (VotingSessionEnded -> VotesTallied)

    // Affichage du vote gagnant (sans accès aux détails parce que getOneProposal nécessite onlyVoters donc qu'on mette un voter en argument)
    const winningId = await voting.winningProposalID();
    console.log("Winning Proposal ID:", winningId.toString());

    // Vérification du résultat : "Halving every 4 years" (index 1) doit gagner avec 2 votes
    expect(await voting.winningProposalID()).to.equal(1);

    // Vérification des events WorkflowStatusChange : 5 transitions = 5 events
    const workflowEvents = await voting.queryFilter(voting.filters.WorkflowStatusChange(),deploymentBlockNumber);  
    expect(workflowEvents.length).to.equal(5);
  });
});
