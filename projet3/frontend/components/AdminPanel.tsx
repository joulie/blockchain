'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

export default function AdminPanel() {
  const { address } = useAccount();
  const [voterAddress, setVoterAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      console.log('Erreur complète:', error); // Pour le debug
      
      // Convertir l'objet error en string pour chercher partout
      const errorString = JSON.stringify(error).toLowerCase();
      const errorMsg = error.message.toLowerCase();
      
      let cleanMsg = '';
      
      // Chercher "Already registered" dans toute l'erreur
      if (errorString.includes('already registered') || errorMsg.includes('already registered')) {
        cleanMsg = '❌ Ce votant est déjà enregistré';
      }
      // Transaction refusée par l'utilisateur
      else if (errorMsg.includes('user denied') || errorMsg.includes('user rejected')) {
        cleanMsg = '❌ Transaction refusée par l\'utilisateur';
      }
      // Enregistrement pas ouvert
      else if (errorString.includes('voters registration is not open') || errorMsg.includes('not open')) {
        cleanMsg = '❌ L\'enregistrement des votants n\'est pas encore ouvert';
      }
      // Chercher spécifiquement pour addVoter qui a revert
      else if (errorMsg.includes('addvoter') && errorMsg.includes('reverted')) {
        // C'est probablement un votant déjà enregistré
        cleanMsg = '❌ Impossible d\'ajouter ce votant (vérifiez qu\'il n\'est pas déjà enregistré)';
      }
      // Message générique pour les reverts
      else if (errorMsg.includes('reverted') || errorMsg.includes('revert')) {
        cleanMsg = '❌ Transaction refusée par le contrat (vérifiez les conditions)';
      }
      // Autres erreurs
      else {
        cleanMsg = '❌ Erreur: ' + error.message.substring(0, 100);
      }
      
      setErrorMessage(cleanMsg);
      const timer = setTimeout(() => setErrorMessage(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Gérer le succès
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('✅ Transaction réussie!');
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const addVoter = async () => {
    if (!voterAddress) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: 'addVoter',
        args: [voterAddress],
      });
      setVoterAddress('');
    } catch (err) {
      setErrorMessage('❌ Erreur lors de l\'ajout du votant');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (!address || !owner) {
    return null; // Chargement en cours
  }

  if (!isOwner) {
    return null; // Pas le propriétaire
  }

  return (
    <div className="glass rounded-2xl p-6 border border-purple-500/30 glow-purple">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-xl">⚙️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-gray-400">Voter Management</p>
        </div>
      </div>
      
      {/* Messages d'erreur et de succès */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm backdrop-blur">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl backdrop-blur">
          {successMessage}
        </div>
      )}
      
      {/* Ajouter un votant */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          👥 Add Voter
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x..."
            value={voterAddress}
            onChange={(e) => setVoterAddress(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <button
            onClick={addVoter}
            disabled={isPending || isConfirming || !voterAddress}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium glow-purple"
          >
            {isPending || isConfirming ? '⏳' : 'Add'}
          </button>
        </div>
      </div>

      {(isPending || isConfirming) && (
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <p className="text-sm text-cyan-400 text-center animate-pulse">
            {isPending && '⏳ Awaiting confirmation...'}
            {isConfirming && '⚡ Transaction processing...'}
          </p>
        </div>
      )}
    </div>
  );
}
