'use client';

import { useReadContract } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

interface Proposal {
  description: string;
  voteCount: bigint;
}

export default function Results() {
  const { data: workflowStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });

  const { data: winningProposal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'getWinningProposal',
  }) as { data: Proposal | undefined };

  const { data: winningProposalID } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'winningProposalID',
  });

  // Workflow status 5 = VotesTallied
  if (workflowStatus !== 5) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-yellow-400">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🏆 Résultats du Vote
      </h2>
      
      {winningProposal ? (
        <div className="text-center space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">Proposition gagnante</p>
            <p className="text-xl font-bold text-blue-600 mb-2">
              #{winningProposalID?.toString()}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              {winningProposal.description}
            </p>
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <span className="font-semibold">
                {winningProposal.voteCount.toString()} vote{Number(winningProposal.voteCount) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            🎉 Les votes ont été comptabilisés avec succès !
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Chargement des résultats...</p>
      )}
    </div>
  );
}
