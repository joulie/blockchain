'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

export default function AdminPanel() {
  const { address } = useAccount();
  const [voterAddress, setVoterAddress] = useState('');
  
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const isOwner = address?.toLowerCase() === (owner as string)?.toLowerCase();

  if (!isOwner) {
    return null;
  }

  const addVoter = async () => {
    if (!voterAddress) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: 'addVoter',
      args: [voterAddress],
    });
    setVoterAddress('');
  };

  const changeWorkflowStatus = (functionName: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName,
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
      <h2 className="text-xl font-bold text-purple-800 mb-4">👑 Panel Administrateur</h2>
      
      {/* Ajouter un votant */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter un votant
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x..."
            value={voterAddress}
            onChange={(e) => setVoterAddress(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={addVoter}
            disabled={isPending || isConfirming || !voterAddress}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isConfirming ? '⏳' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Gestion du workflow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gestion du workflow
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => changeWorkflowStatus('startProposalsRegistering')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            ▶️ Démarrer propositions
          </button>
          <button
            onClick={() => changeWorkflowStatus('endProposalsRegistering')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
          >
            ⏸️ Fin propositions
          </button>
          <button
            onClick={() => changeWorkflowStatus('startVotingSession')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            ▶️ Démarrer vote
          </button>
          <button
            onClick={() => changeWorkflowStatus('endVotingSession')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            ⏹️ Fin vote
          </button>
          <button
            onClick={() => changeWorkflowStatus('tallyVotes')}
            disabled={isPending || isConfirming}
            className="col-span-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            🧮 Comptabiliser les votes
          </button>
        </div>
      </div>

      {(isPending || isConfirming) && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          {isPending && '⏳ Confirmation en cours...'}
          {isConfirming && '⏳ Transaction en cours...'}
        </p>
      )}
    </div>
  );
}
