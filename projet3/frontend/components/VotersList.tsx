// Directive pour indiquer que ce composant s'exécute côté client
'use client';

// Import des hooks React pour la gestion d'état
import { useEffect, useState } from 'react';
// Import des hooks Wagmi pour interagir avec la blockchain
import { useAccount, useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
// Import de l'ABI du contrat Voting
import VotingABI from '@/lib/contracts/VotingABI.json';

// Adresse du contrat de vote depuis les variables d'environnement
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Composant VotersList - Liste des votants enregistrés
 * 
 * Ce composant affiche la liste de tous les votants enregistrés.
 * Il n'est visible que pour le propriétaire du contrat.
 * 
 * Fonctionnalités :
 * - Affichage du nombre total de votants
 * - Liste scrollable des adresses
 * - Récupération des événements passés au chargement
 * - Mise à jour en temps réel via les événements du contrat
 */
export default function VotersList() {
  // Récupération de l'adresse du wallet connecté
  const { address } = useAccount();
  // État pour stocker la liste des adresses des votants
  const [voters, setVoters] = useState<string[]>([]);
  // Client public pour lire les logs de la blockchain
  const publicClient = usePublicClient();
  
  // Lecture de l'adresse du propriétaire du contrat
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  // Vérification si l'utilisateur connecté est le propriétaire
  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  /**
   * Effet pour récupérer tous les votants enregistrés depuis le début
   * Utilise les logs de la blockchain pour obtenir l'historique complet
   */
  useEffect(() => {
    const fetchPastVoters = async () => {
      if (!publicClient) return;
      
      try {
        // Récupération de tous les événements VoterRegistered depuis le bloc 0
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

        // Extraction des adresses depuis les logs et filtrage des valeurs nulles
        const voterAddresses = logs.map((log: any) => log.args.voterAddress).filter(Boolean);
        setVoters(voterAddresses as string[]);
      } catch (error) {
        console.error('Erreur lors de la récupération des votants:', error);
      }
    };

    // Exécuter uniquement si l'utilisateur est owner
    if (isOwner) {
      fetchPastVoters();
    }
  }, [publicClient, isOwner]);

  /**
   * Écoute des nouveaux événements VoterRegistered en temps réel
   * Ajoute les nouveaux votants à la liste sans doublons
   */
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'VoterRegistered',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const voterAddress = log.args.voterAddress;
        // Vérifier que l'adresse existe et n'est pas déjà dans la liste
        if (voterAddress && !voters.includes(voterAddress)) {
          setVoters(prev => [...prev, voterAddress]);
        }
      });
    },
  });

  // Ne pas afficher le composant si l'utilisateur n'est pas admin
  if (!isOwner) {
    return null;
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
