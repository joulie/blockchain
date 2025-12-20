// Directive pour indiquer que ce composant s'exécute côté client
'use client';

// Import des hooks React pour la gestion d'état
import { useState, useEffect } from 'react';
// Import des hooks Wagmi pour interagir avec la blockchain
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
// Import de l'ABI du contrat Voting
import VotingABI from '@/lib/contracts/VotingABI.json';

// Adresse du contrat de vote depuis les variables d'environnement
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Composant ProposalForm - Formulaire de soumission de proposition
 * 
 * Ce composant permet aux votants enregistrés de soumettre des propositions
 * pendant la phase d'enregistrement des propositions (WorkflowStatus = 1).
 * 
 * Le composant est automatiquement masqué en dehors de cette phase.
 * 
 * Fonctionnalités :
 * - Formulaire avec zone de texte pour la description
 * - Validation de la saisie (non vide)
 * - Réinitialisation automatique après soumission réussie
 * - Message de confirmation visuel
 */
export default function ProposalForm() {
  // État pour la description de la proposition
  const [description, setDescription] = useState('');
  
  // Lecture du statut actuel du workflow
  const { data: workflowStatus, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });

  // Écoute des changements de statut du workflow pour mettre à jour l'affichage
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      refetch();
    },
  });
  
  // Hook pour écrire sur la blockchain (ajouter une proposition)
  const { writeContract, data: hash, isPending } = useWriteContract();
  // Hook pour attendre la confirmation de la transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Effet pour réinitialiser le formulaire après une soumission réussie
   */
  useEffect(() => {
    if (isSuccess) {
      setDescription('');
    }
  }, [isSuccess]);

  /**
   * Gestionnaire de soumission du formulaire
   * Envoie la transaction pour ajouter la proposition sur la blockchain
   * 
   * @param e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Vérification que la description n'est pas vide
    if (!description.trim()) return;

    // Appel de la fonction addProposal du contrat
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
