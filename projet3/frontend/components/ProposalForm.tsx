'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

export default function ProposalForm() {
  const [description, setDescription] = useState('');
  
  const { data: workflowStatus, refetch } = useReadContract({
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
      refetch();
    },
  });
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Réinitialiser le formulaire après succès
  useEffect(() => {
    if (isSuccess) {
      setDescription('');
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: 'addProposal',
      args: [description],
    });
  };

  // N'affiche le composant que si on est en phase d'enregistrement des propositions (WorkflowStatus = 1)
  if (workflowStatus !== 1) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 border border-cyan-500/30 glow-cyan">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">📝</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Submit Proposal</h2>
          <p className="text-xs text-gray-400">Add your proposal</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            💡 Proposal Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your proposal..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none placeholder-gray-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !description.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-cyan"
        >
          {isPending || isConfirming ? '⏳ Submitting...' : '🚀 Submit Proposal'}
        </button>
      </form>
      {isSuccess && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-center">
          ✅ Proposal added successfully!
        </div>
      )}
    </div>
  );
}
