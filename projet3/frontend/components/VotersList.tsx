'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

export default function VotersList() {
  const { address } = useAccount();
  const [voters, setVoters] = useState<string[]>([]);
  const publicClient = usePublicClient();
  
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  // Récupérer les événements passés au chargement
  useEffect(() => {
    const fetchPastVoters = async () => {
      if (!publicClient) return;
      
      try {
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'VoterRegistered',
            inputs: [
              { type: 'address', name: 'voterAddress', indexed: false }
            ]
          },
          fromBlock: 0n,
          toBlock: 'latest'
        });

        const voterAddresses = logs.map((log: any) => log.args.voterAddress).filter(Boolean);
        setVoters(voterAddresses as string[]);
      } catch (error) {
        console.error('Erreur lors de la récupération des votants:', error);
      }
    };

    if (isOwner) {
      fetchPastVoters();
    }
  }, [publicClient, isOwner]);

  // Écouter les nouveaux événements VoterRegistered
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'VoterRegistered',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const voterAddress = log.args.voterAddress;
        if (voterAddress && !voters.includes(voterAddress)) {
          setVoters(prev => [...prev, voterAddress]);
        }
      });
    },
  });

  if (!isOwner) {
    return null; // Pas visible si pas admin
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
      <h2 className="text-xl font-bold text-purple-800 mb-4">Votants Enregistrés</h2>
      
      {voters.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Aucun votant enregistré pour le moment
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">
            Total : <span className="font-semibold text-purple-700">{voters.length}</span> votant{voters.length > 1 ? 's' : ''}
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {voters.map((voter, index) => (
              <div 
                key={voter}
                className="bg-purple-50 p-3 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-700 break-all">
                    {voter}
                  </span>
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
