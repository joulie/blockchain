'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

interface Proposal {
  description: string;
  voteCount: bigint;
}

export default function Results() {
  const { data: workflowStatus, refetch: refetchStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });

  // Écouter les changements de statut
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      refetchStatus();
    },
  });

  // Workflow status 5 = VotesTallied
  const isVotesTallied = workflowStatus === 5;

  const { data: winningProposal, refetch: refetchWinner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'getWinningProposal',
    query: {
      enabled: isVotesTallied, // N'appelle la fonction que si les votes sont comptabilisés
    }
  }) as { data: Proposal | undefined };

  // Recharger le gagnant quand le statut change
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      if (isVotesTallied) {
        refetchWinner();
      }
    },
  });

  const { data: winningProposalID } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'winningProposalID',
    query: {
      enabled: isVotesTallied,
    }
  });

  if (!isVotesTallied) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 border border-yellow-500/30 relative overflow-hidden">
      {/* Effet de brillance */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-3xl">🏆</span>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">
            Vote Results
          </h2>
          <p className="text-gray-400 text-sm">Winner announcement</p>
        </div>
        
        {winningProposal ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-mono">Winning Proposal</span>
                <span className="text-lg font-bold text-yellow-400">#{winningProposalID?.toString()}</span>
              </div>
              <p className="text-white text-lg mb-4 font-medium">
                {winningProposal.description}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                  <span className="text-yellow-400 font-bold text-lg">
                    {winningProposal.voteCount.toString()}
                  </span>
                  <span className="text-yellow-400/70 text-sm ml-2">
                    vote{Number(winningProposal.voteCount) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              ✅ Votes successfully tallied
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading results...</p>
          </div>
        )}
      </div>
    </div>
  );
}
