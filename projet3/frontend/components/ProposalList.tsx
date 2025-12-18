'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

interface Proposal {
  description: string;
  voteCount: bigint;
}

export default function ProposalList() {
  const { data: proposals, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'getAllProposals',
  }) as { data: Proposal[] | undefined; isLoading: boolean; refetch: () => void };

  // Écouter les nouvelles propositions et les votes
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'ProposalRegistered',
    onLogs() {
      refetch();
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'Voted',
    onLogs() {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Propositions</h2>
        <p className="text-gray-500 text-center">Chargement...</p>
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Propositions</h2>
        <p className="text-gray-500 text-center">Aucune proposition pour le moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📋 Propositions ({proposals.length})
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {proposals.map((proposal, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500">
                Proposition #{index}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {proposal.voteCount.toString()} vote{Number(proposal.voteCount) !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-gray-700">{proposal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
