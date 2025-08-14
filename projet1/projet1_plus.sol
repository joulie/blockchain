// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}
    // Structures
    struct Voter {
        bool isRegistered; // indique si l'électeur est enregistré
        bool hasVoted; // indique si l'électeur a voté
        uint votedProposalId; // identifiant de la proposition votée
    }

    struct Proposal {
        string description; // texte de la proposition
        uint voteCount; // nombre de votes pour la proposition
    }

    // Enum workflow
    enum WorkflowStatus {
        RegisteringVoters, // Inscription des électeurs
        ProposalsRegistrationStarted, // Début du dépôt des propositions
        ProposalsRegistrationEnded, // Fin du dépôt des propositions
        VotingSessionStarted, // Début du vote
        VotingSessionEnded, // Fin du vote
        VotesTallied // Dépouillement terminé
    }

    // Variables d'état
    WorkflowStatus public workflowStatus; // Statut du workflow
    mapping(address => Voter) public voters; // Liste des électeurs
    Proposal[] public proposals; // Liste des propositions
    uint public winningProposalId; // Identifiant de la proposition gagnante

    // Événements
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    // Modificateurs
    modifier isVoterRegistered() {
        require(voters[msg.sender].isRegistered, "You have to be registered to vote");
        _;
    }

    modifier isAtStatus(WorkflowStatus _status) {
        require(
            workflowStatus == _status,
            string(abi.encodePacked("You are not in the right workflow status. Current status: ",
                    getWorkflowStatusName() ))
        );
        _;
    }

    modifier onlyOwnerWithError() {
        require(msg.sender == owner(), string(abi.encodePacked("You are not the owner. Sender: ", toAsciiString(msg.sender))));
        _;
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            uint8 b = uint8(uint(uint160(x)) / (2**(8*(19 - i))));
            uint8 hi = b / 16;
            uint8 lo = b - 16 * hi;
            s[2*i+2] = char(hi);
            s[2*i+3] = char(lo);
        }
        return string(s);
    }
    function char(uint8 b) internal pure returns (bytes1) {
        return bytes1(uint8(b + (b < 10 ? 48 : 87)));
    }

    // onlyOwner de la lib OpenZeppelin Ownable : ne peuvent être appelées que par l'administrateur du contrat
    function registerVoter(address _voter) external onlyOwner isAtStatus(WorkflowStatus.RegisteringVoters) {
        require(voters[_voter].isRegistered == false, "Voter is already registered");
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    function startProposalsRegistration() external onlyOwnerWithError isAtStatus(WorkflowStatus.RegisteringVoters) {
        WorkflowStatus previous = workflowStatus;
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(previous, workflowStatus);
    }

    function endProposalsRegistration() external onlyOwnerWithError isAtStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        WorkflowStatus previous = workflowStatus;
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(previous, workflowStatus);
    }

    function startVotingSession() external onlyOwnerWithError isAtStatus(WorkflowStatus.ProposalsRegistrationEnded) {
        WorkflowStatus previous = workflowStatus;
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(previous, workflowStatus);
    }

    function endVotingSession() external onlyOwnerWithError isAtStatus(WorkflowStatus.VotingSessionStarted) {
        WorkflowStatus previous = workflowStatus;
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(previous, workflowStatus);
    }

    function tallyVotes() external onlyOwnerWithError isAtStatus(WorkflowStatus.VotingSessionEnded) {
        uint _winningProposalId;
        uint highestVoteCount = 0;
        bool tie = false;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > highestVoteCount) {
                highestVoteCount = proposals[i].voteCount;
                _winningProposalId = i;
                tie = false;
            } else if (proposals[i].voteCount == highestVoteCount && highestVoteCount != 0) {
                // Si égalité, garder la première proposition enregistrée (index le plus bas)
                tie = true;
            }
        }
        winningProposalId = _winningProposalId;
        WorkflowStatus previous = workflowStatus;
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(previous, workflowStatus);
    }

    // Fonctions accessibles aux électeurs
    function registerProposal(string calldata _description) external isVoterRegistered isAtStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    function vote(uint _proposalId) external isVoterRegistered isAtStatus(WorkflowStatus.VotingSessionStarted) {
        Voter storage sender = voters[msg.sender];
        require(sender.hasVoted == false, "Already voted");
        require(_proposalId < proposals.length, "Invalid proposal id");
        sender.hasVoted = true;
        sender.votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    // Lecture
    function getWinner() external view isAtStatus(WorkflowStatus.VotesTallied) returns (Proposal memory) {
        return proposals[winningProposalId];
    }

    function getProposalsCount() external view returns (uint) {
        return proposals.length;
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function getWorkflowStatusName() public view returns (string memory) {
        if (workflowStatus == WorkflowStatus.RegisteringVoters) return "RegisteringVoters";
        if (workflowStatus == WorkflowStatus.ProposalsRegistrationStarted) return "ProposalsRegistrationStarted";
        if (workflowStatus == WorkflowStatus.ProposalsRegistrationEnded) return "ProposalsRegistrationEnded";
        if (workflowStatus == WorkflowStatus.VotingSessionStarted) return "VotingSessionStarted";
        if (workflowStatus == WorkflowStatus.VotingSessionEnded) return "VotingSessionEnded";
        if (workflowStatus == WorkflowStatus.VotesTallied) return "VotesTallied";
        return "Unknown";
    }

    //ajoutés : gestion des exequos (le premier qui a étét le plus haut est retenu)
    //          lister les propositions
    //          gérer l'erreur si ce n'est pas l'owner qui tente les appels
}