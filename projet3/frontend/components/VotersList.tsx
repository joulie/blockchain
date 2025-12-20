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
    <div className="glass rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Registered Voters</h2>
            <p className="text-xs text-gray-400">{voters.length} total</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
          <span className="text-purple-400 font-bold">{voters.length}</span>
        </div>
      </div>
      
      {voters.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-gray-400 text-sm">No voters registered yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {voters.map((voter, index) => (
            <div 
              key={voter}
              className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/15 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <span className="text-xs font-mono text-gray-300 block truncate">
                    {voter}
                  </span>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30 font-mono whitespace-nowrap">
                  #{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
