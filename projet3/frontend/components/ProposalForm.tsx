'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

export default function ProposalForm() {
  const [description, setDescription] = useState('');
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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

  if (isSuccess) {
    setDescription('');
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">✍️ Proposer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description de la proposition
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre proposition..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !description.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isConfirming ? '⏳ Envoi en cours...' : '📤 Soumettre la proposition'}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-4 text-sm text-green-600 text-center">
          ✅ Proposition ajoutée avec succès !
        </p>
      )}
    </div>
  );
}
