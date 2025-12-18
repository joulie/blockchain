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
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-green-400 mb-4">Proposer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description de la proposition
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre proposition..."
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !description.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isConfirming ? 'Envoi en cours...' : 'Soumettre la proposition'}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-4 text-sm text-green-600 text-center">
          Proposition ajoutée avec succès !
        </p>
      )}
    </div>
  );
}
