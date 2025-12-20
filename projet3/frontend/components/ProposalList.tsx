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
      <div className="glass rounded-2xl p-6 border border-green-500/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📋</span> Proposals
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 border border-green-500/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📋</span> Proposals
        </h2>
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400">No proposals yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-green-500/30 glow-green">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Proposals</h2>
            <p className="text-xs text-gray-400">{proposals.length} active</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
          <span className="text-green-400 font-bold">{proposals.length}</span>
        </div>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {proposals.map((proposal, index) => (
          <div
            key={index}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-green-500/50 hover:bg-white/10 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-400">
                Proposal #{index}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 font-mono">
                  {proposal.voteCount.toString()} 🗳️
                </span>
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed">{proposal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
