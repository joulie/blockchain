'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

interface Proposal {
  description: string;
  voteCount: bigint;
}

export default function VoteSection() {
  const [selectedProposal, setSelectedProposal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { data: workflowStatus, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });
  
  const { data: proposals, refetch: refetchProposals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'getAllProposals',
  }) as { data: Proposal[] | undefined; refetch: () => void };

  // Écouter les changements de statut
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      refetchStatus();
    },
  });

  // Écouter les nouvelles propositions
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'ProposalRegistered',
    onLogs() {
      refetchProposals();
    },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      console.log('Erreur vote complète:', error);
      
      const errorMsg = error.message.toLowerCase();
      
      let cleanMsg = '';
      
      if (errorMsg.includes('already voted') || errorMsg.includes('have already voted')) {
        cleanMsg = '❌ Vous avez déjà voté';
      } else if (errorMsg.includes('user denied') || errorMsg.includes('user rejected')) {
        cleanMsg = '❌ Transaction refusée par l\'utilisateur';
      } else if (errorMsg.includes('voting session')) {
        cleanMsg = '❌ La session de vote n\'est pas ouverte';
      } else if (errorMsg.includes('setvote') && errorMsg.includes('reverted')) {
        cleanMsg = '❌ Impossible de voter (vérifiez que vous n\'avez pas déjà voté)';
      } else if (errorMsg.includes('reverted') || errorMsg.includes('revert')) {
        cleanMsg = '❌ Transaction refusée par le contrat';
      } else {
        cleanMsg = '❌ Erreur: ' + error.message.substring(0, 100);
      }
      
      setErrorMessage(cleanMsg);
      const timer = setTimeout(() => setErrorMessage(''), 8000);
      return () => clearTimeout(timer);
    } else {
      // Réinitialiser le message d'erreur quand il n'y a plus d'erreur
      setErrorMessage('');
    }
  }, [error]);

  // Gérer le succès
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('✅ Vote enregistré avec succès!');
      setSelectedProposal('');
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;

    // Réinitialiser les messages avant de voter
    setErrorMessage('');
    setSuccessMessage('');

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: 'setVote',
      args: [BigInt(selectedProposal)],
    });
  };

  // N'affiche le composant que si on est en phase de vote (WorkflowStatus = 3)
  if (workflowStatus !== 3) {
    return null;
  }

  if (!proposals || proposals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Voter</h2>
      
      {/* Messages d'erreur et de succès */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-h-32 overflow-y-auto text-sm break-words">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleVote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionnez une proposition
          </label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choisir une proposition...</option>
            {proposals.map((proposal, index) => (
              <option key={index} value={index}>
                #{index} - {proposal.description}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !selectedProposal}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isConfirming ? 'Vote en cours...' : 'Confirmer mon vote'}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-4 text-sm text-green-600 text-center">
          Vote enregistré avec succès !
        </p>
      )}
    </div>
  );
}
