// Licence MIT pour le contrat
// SPDX-License-Identifier: MIT

// Définition de la version du compilateur Solidity à utiliser
pragma solidity 0.8.28;

// Import du contrat Ownable d'OpenZeppelin qui gère les permissions
import "@openzeppelin/contracts/access/Ownable.sol";

// Définition du contrat Voting qui hérite des fonctionnalités de Ownable
contract Voting is Ownable {
    // Variable publique qui stocke l'identifiant de la proposition gagnante
    uint public winningProposalID;
    
    // Structure qui définit les propriétés d'un votant
    struct Voter {
        // Booléen indiquant si le votant est enregistré dans le système
        bool isRegistered;
        // Booléen indiquant si le votant a déjà voté
        bool hasVoted;
        // Identifiant de la proposition pour laquelle le votant a voté
        uint votedProposalId;
    }

    // Structure qui définit les propriétés d'une proposition
    struct Proposal {
        // Description textuelle de la proposition
        string description;
        // Compteur du nombre de votes reçus par la proposition
        uint voteCount;
    }

    // Énumération qui définit tous les états possibles du processus de vote
    enum  WorkflowStatus {
        // État initial : enregistrement des votants
        RegisteringVoters,
        // État : début de l'enregistrement des propositions
        ProposalsRegistrationStarted,
        // État : fin de l'enregistrement des propositions
        ProposalsRegistrationEnded,
        // État : début de la session de vote
        VotingSessionStarted,
        // État : fin de la session de vote
        VotingSessionEnded,
        // État final : votes comptabilisés
        VotesTallied
    }

    // Variable publique qui stocke l'état actuel du workflow
    WorkflowStatus public workflowStatus;
    // Tableau dynamique qui stocke toutes les propositions
    Proposal[] proposalsArray;
    // Mapping qui associe chaque adresse à un votant
    mapping (address => Voter) voters;

    // Événement émis quand un nouveau votant est enregistré
    event VoterRegistered(address voterAddress); 
    // Événement émis quand l'état du workflow change
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    // Événement émis quand une nouvelle proposition est enregistrée
    event ProposalRegistered(uint proposalId);
    // Événement émis quand un votant vote
    event Voted (address voter, uint proposalId);

    // Constructeur du contrat qui initialise le propriétaire
    constructor() Ownable(msg.sender) {    }
    
    // Modificateur qui vérifie si l'appelant est un votant enregistré
    modifier onlyVoters() {
        // Vérifie si l'adresse de l'appelant est enregistrée comme votant
        require(voters[msg.sender].isRegistered, "You're not a voter"); // On aurait aussi pu utiliser une Custom Error
        // Continue l'exécution de la fonction si la condition est remplie
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    // Fonction qui retourne les informations d'un votant spécifique
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        // Retourne les informations du votant à l'adresse spécifiée
        return voters[_addr];
    }
    
    // Fonction qui retourne les informations d'une proposition spécifique
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        // Retourne la proposition à l'index spécifié
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: // 

    // Fonction pour ajouter un nouveau votant (accessible uniquement par le propriétaire)
    function addVoter(address _addr) external onlyOwner {
        // Vérifie si on est dans la phase d'enregistrement des votants
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        // Vérifie si le votant n'est pas déjà enregistré
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        // Enregistre le votant
        voters[_addr].isRegistered = true;
        // Émet l'événement d'enregistrement
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    // Fonction pour ajouter une nouvelle proposition
    function addProposal(string calldata _desc) external onlyVoters {
        // Vérifie si on est dans la phase d'enregistrement des propositions
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        // Vérifie que la description n'est pas vide
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer');

        // Crée une nouvelle proposition
        Proposal memory proposal;
        // Définit la description de la proposition
        proposal.description = _desc;
        // Ajoute la proposition au tableau
        proposalsArray.push(proposal);
        // Émet l'événement d'enregistrement de la proposition
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    // Fonction pour voter pour une proposition
    function setVote( uint _id) external onlyVoters {
        // Vérifie si on est dans la phase de vote
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        // Vérifie si le votant n'a pas déjà voté
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        // Vérifie si l'ID de la proposition est valide
        require(_id < proposalsArray.length, 'Proposal not found');

        // Enregistre le vote du votant
        voters[msg.sender].votedProposalId = _id;
        // Marque le votant comme ayant voté
        voters[msg.sender].hasVoted = true;
        // Incrémente le compteur de votes de la proposition
        proposalsArray[_id].voteCount++;

        // Émet l'événement de vote
        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    // Fonction pour démarrer l'enregistrement des propositions
    function startProposalsRegistering() external onlyOwner {
        // Vérifie si on est dans la phase d'enregistrement des votants
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        // Change l'état vers l'enregistrement des propositions
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        // Crée et ajoute la proposition GENESIS
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        // Émet l'événement de changement d'état
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Fonction pour terminer l'enregistrement des propositions
    function endProposalsRegistering() external onlyOwner {
        // Vérifie si on est dans la phase d'enregistrement des propositions
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        // Change l'état vers la fin de l'enregistrement des propositions
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        // Émet l'événement de changement d'état
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Fonction pour démarrer la session de vote
    function startVotingSession() external onlyOwner {
        // Vérifie si on est dans la phase de fin d'enregistrement des propositions
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        // Change l'état vers le début de la session de vote
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        // Émet l'événement de changement d'état
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Fonction pour terminer la session de vote
    function endVotingSession() external onlyOwner {
        // Vérifie si on est dans la phase de vote
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        // Change l'état vers la fin de la session de vote
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        // Émet l'événement de changement d'état
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Fonction pour comptabiliser les votes et déterminer le gagnant
    function tallyVotes() external onlyOwner {
        // Vérifie si on est dans la phase de fin de session de vote
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        // Variable temporaire pour stocker l'ID de la proposition gagnante
        uint _winningProposalId;
        // Parcourt toutes les propositions pour trouver celle avec le plus de votes
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            // Compare le nombre de votes de la proposition courante avec la meilleure proposition actuelle
            if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
                // Met à jour l'ID de la proposition gagnante si nécessaire
                _winningProposalId = p;
            }
        }
        // Stocke l'ID de la proposition gagnante
        winningProposalID = _winningProposalId;
        
        // Change l'état vers la fin du processus (votes comptabilisés)
        workflowStatus = WorkflowStatus.VotesTallied;
        // Émet l'événement de changement d'état
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}