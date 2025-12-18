'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

const workflowStatusNames = [
  'Enregistrement des votants',
  'Enregistrement des propositions',
  'Fin enregistrement propositions',
  'Session de vote',
  'Fin session de vote',
  'Votes comptabilisés'
];

export default function WorkflowStatus() {
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
      // Recharger le statut quand il change
      refetch();
    },
  });

  const statusIndex = typeof workflowStatus === 'number' ? workflowStatus : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Statut du Vote</h2>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${((statusIndex + 1) / 6) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Étape {statusIndex + 1}/6
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-blue-600">
            {workflowStatusNames[statusIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
