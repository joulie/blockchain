'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

interface Proposal {
  description: string;
  voteCount: bigint;
}

export default function VoteSection() {
  const [selectedProposal, setSelectedProposal] = useState('');
  
  const { data: proposals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'getAllProposals',
  }) as { data: Proposal[] | undefined };

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: 'setVote',
      args: [BigInt(selectedProposal)],
    });
  };

  if (!proposals || proposals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🗳️ Voter</h2>
      <form onSubmit={handleVote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionnez une proposition
          </label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isConfirming ? '⏳ Vote en cours...' : '✅ Confirmer mon vote'}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-4 text-sm text-green-600 text-center">
          ✅ Vote enregistré avec succès !
        </p>
      )}
    </div>
  );
}
