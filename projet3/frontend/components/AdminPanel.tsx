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

  if (!address || !owner) {
    return null; // Chargement en cours
  }

  if (!isOwner) {
    return null; // Pas le propriétaire
  }

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

  const changeWorkflowStatus = (functionName: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName,
      });
    } catch (err) {
      setErrorMessage('❌ Erreur lors du changement de statut');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
      <h2 className="text-xl font-bold text-purple-800 mb-4">Panel Administrateur</h2>
      
      {/* Messages d'erreur et de succès */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-h-32 overflow-y-auto text-sm break-words">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
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
            className="px-4 py-2 bg-blue-400 text-white text-sm rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
          >
            Démarrer propositions
          </button>
          <button
            onClick={() => changeWorkflowStatus('endProposalsRegistering')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-blue-400 text-white text-sm rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
          >
            Fin propositions
          </button>
          <button
            onClick={() => changeWorkflowStatus('startVotingSession')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-blue-400 text-white text-sm rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
          >
            Démarrer vote
          </button>
          <button
            onClick={() => changeWorkflowStatus('endVotingSession')}
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-blue-400 text-white text-sm rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
          >
            Fin vote
          </button>
          <button
            onClick={() => changeWorkflowStatus('tallyVotes')}
            disabled={isPending || isConfirming}
            className="col-span-2 px-4 py-2 bg-blue-400 text-white text-sm rounded-lg hover:bg-blue-500 disabled:bg-gray-300 transition-colors"
          >
            Comptabiliser les votes
          </button>
        </div>
      </div>

      {(isPending || isConfirming) && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          {isPending && 'Confirmation en cours...'}
          {isConfirming && 'Transaction en cours...'}
        </p>
      )}
    </div>
  );
}
