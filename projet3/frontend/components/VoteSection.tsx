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
    <div className="glass rounded-2xl p-6 border border-orange-500/30 glow-purple">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">🗳️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Cast Vote</h2>
          <p className="text-xs text-gray-400">Select your choice</p>
        </div>
      </div>
      
      {/* Messages d'erreur et de succès */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm backdrop-blur">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl backdrop-blur">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleVote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📋 Select Proposal
          </label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgb(156, 163, 175)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="" className="bg-gray-800">Choose a proposal...</option>
            {proposals.map((proposal, index) => (
              <option key={index} value={index} className="bg-gray-800">
                #{index} - {proposal.description}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !selectedProposal}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-purple"
        >
          {isPending || isConfirming ? '⏳ Voting...' : '✓ Confirm Vote'}
        </button>
      </form>
    </div>
  );
}
