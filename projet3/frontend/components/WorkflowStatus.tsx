// Directive pour indiquer que ce composant s'exécute côté client
'use client';

// Import des hooks React pour la gestion d'état
import { useState, useEffect } from 'react';
// Import des hooks Wagmi pour interagir avec la blockchain
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// Import de l'ABI du contrat Voting
import VotingABI from '@/lib/contracts/VotingABI.json';

// Adresse du contrat de vote depuis les variables d'environnement
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

// Définition des 6 étapes du workflow de vote avec leurs propriétés visuelles
const workflowStages = [
  { name: 'Enregistrement Votants', icon: '👥', color: '#00d4ff', short: 'Registering voters' },
  { name: 'Enregistrement Propositions', icon: '📝', color: '#7c3aed', short: 'Registering proposals' },
  { name: 'Fin Propositions', icon: '🔒', color: '#10b981', short: 'End of proposals' },
  { name: 'Session de Vote', icon: '🗳️', color: '#f59e0b', short: 'Voting' },
  { name: 'Fin du Vote', icon: '⏱️', color: '#ef4444', short: 'Vote ended' },
  { name: 'Votes Comptabilisés', icon: '📊', color: '#06b6d4', short: 'Results' }
];

// Définition des actions disponibles pour chaque étape du workflow
// La première étape (null) est non cliquable car c'est l'état initial
const workflowActions = [
  { function: null, label: 'Registering Voters', icon: '👥' }, // Étape 0 (déjà là, non cliquable)
  { function: 'startProposalsRegistering', label: 'Start Proposals', icon: '📝' },
  { function: 'endProposalsRegistering', label: 'End Proposals', icon: '🔒' },
  { function: 'startVotingSession', label: 'Start Voting', icon: '🗳️' },
  { function: 'endVotingSession', label: 'End Voting', icon: '⏱️' },
  { function: 'tallyVotes', label: 'Tally Votes', icon: '📊' }
];

/**
 * Composant WorkflowStatus - Affichage du cycle de vote
 * 
 * Ce composant affiche le statut actuel du workflow de vote de manière visuelle :
 * - Cercle de progression central montrant l'étape actuelle
 * - Pour les admins : 6 boutons positionnés autour du cercle pour contrôler le workflow
 * - Pour les non-admins : 6 indicateurs visuels montrant les étapes (lecture seule)
 * 
 * Particularités :
 * - Les boutons sont décalés de 30° dans le sens horaire pour l'alignement visuel
 * - Seul le bouton de l'étape suivante est cliquable pour l'admin
 * - Les messages de succès/erreur sont affichés temporairement
 */
export default function WorkflowStatus() {
  // Récupération de l'adresse du wallet connecté
  const { address } = useAccount();
  // États pour les messages d'erreur et de succès
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lecture du statut actuel du workflow depuis le contrat
  const { data: workflowStatus, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });

  // Lecture de l'adresse du propriétaire du contrat
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  // Vérification si l'utilisateur connecté est le propriétaire du contrat
  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  // Hook pour écrire sur la blockchain (changer le workflow)
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  // Hook pour attendre la confirmation de la transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    query: {
      enabled: !!hash && isOwner, // Seulement actif si hash existe et user est owner
    }
  });

  // Écoute des événements de changement de statut du workflow
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      // Recharger le statut quand il change
      refetch();
    },
  });

  // Gestion de l'affichage des erreurs avec auto-suppression après 5 secondes
  useEffect(() => {
    if (error && isOwner) {
      setErrorMessage('❌ Transaction failed');
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isOwner]);

  // Gestion de l'affichage des messages de succès avec auto-suppression après 3 secondes
  useEffect(() => {
    if (isSuccess && isOwner) {
      setSuccessMessage('✅ Status updated!');
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isOwner]);

  // Conversion du statut en index numérique et calcul de la progression
  const statusIndex = typeof workflowStatus === 'number' ? workflowStatus : 0;
  const currentStage = workflowStages[statusIndex];
  const progress = ((statusIndex + 1) / 6) * 100;

  /**
   * Fonction pour changer l'état du workflow
   * Seul le propriétaire peut appeler cette fonction
   * 
   * @param functionName - Nom de la fonction du contrat à appeler
   */
  const handleWorkflowChange = (functionName: string) => {
    if (!isOwner) return;
    setErrorMessage('');
    setSuccessMessage('');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName,
    });
  };

  /**
   * Calcule la position d'un bouton autour du cercle de progression
   * Les boutons sont disposés en cercle avec un décalage de 30° dans le sens horaire
   * 
   * @param index - Index du bouton (0-5)
   * @param total - Nombre total de boutons (6)
   * @returns Position x et y en pixels depuis le centre
   */
  const getButtonPosition = (index: number, total: number) => {
    // Décalage de 30° dans le sens horaire pour aligner avec la progression du cercle
    const startAngle = -60; // -60° au lieu de -90° pour décaler de 30°
    const angleStep = 360 / total;
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);
    const radius = 180; // Distance du centre
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    // Conteneur principal avec effet glass et lueur cyan
    <div className="glass rounded-2xl p-8 glow-cyan relative">
      {/* Messages d'erreur et de succès positionnés en haut au centre */}
      {errorMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* En-tête avec titre et compteur d'étapes */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Vote Cycle</h2>
          <p className="text-gray-400 text-sm">Current workflow status</p>
        </div>
        {/* Affichage du numéro de l'étape actuelle */}
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {statusIndex + 1}/6
          </div>
          <div className="text-xs text-gray-400">Stages</div>
        </div>
      </div>

      {/* Cercle de progression avec boutons de contrôle */}
      <div className="flex justify-center mb-8 py-12">
        <div className="relative w-96 h-96 flex items-center justify-center">
          
          {/* Vue admin : afficher les 6 boutons d'action autour du cercle */}
          {isOwner && workflowActions.map((action, index) => {
            const position = getButtonPosition(index, 6);
            // Déterminer si c'est la prochaine action disponible
            const isNextAction = index === statusIndex + 1;
            // Déterminer si cette étape est complétée
            const isCompleted = index <= statusIndex;
            // Déterminer si c'est l'étape actuelle
            const isCurrentStep = index === statusIndex;
            
            return (
              <button
                key={index}
                onClick={() => action.function && isNextAction && handleWorkflowChange(action.function)}
                disabled={!action.function || !isNextAction || isPending || isConfirming}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isNextAction && action.function
                    ? 'w-24 h-24 animate-pulse-glow' 
                    : 'w-20 h-20 opacity-50'
                }`}
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                }}
              >
                {/* Contenu du bouton avec styles conditionnels */}
                <div className={`w-full h-full rounded-2xl border-2 backdrop-blur flex flex-col items-center justify-center gap-1 transition-all ${
                  isCurrentStep && !action.function
                    ? 'bg-cyan-400/20 border-cyan-400 cursor-not-allowed'
                    : isCompleted && index < statusIndex
                    ? 'bg-green-500/20 border-green-500/50 cursor-not-allowed'
                    : isNextAction && action.function
                    ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400 hover:scale-110 cursor-pointer'
                    : 'bg-white/5 border-white/20 cursor-not-allowed'
                }`}>
                  {/* Icône de l'action */}
                  <span className="text-3xl">{action.icon}</span>
                  {/* Label de l'action */}
                  <span className={`text-xs font-medium px-2 text-center ${
                    isCurrentStep && !action.function ? 'text-cyan-400' :
                    isCompleted && index < statusIndex ? 'text-green-400' : 
                    isNextAction && action.function ? 'text-cyan-400' : 
                    'text-white'
                  }`}>
                    {action.label}
                  </span>
                  {/* Coche verte pour les étapes complétées */}
                  {isCompleted && index < statusIndex && (
                    <span className="absolute -top-1 -right-1 text-green-400 text-xl">✓</span>
                  )}
                  {/* Spinner de chargement pendant la transaction */}
                  {isNextAction && action.function && (isPending || isConfirming) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Vue non-admin : afficher les étapes en lecture seule autour du cercle */}
          {!isOwner && workflowStages.map((stage, index) => {
            // Calculer la position de chaque étape avec le même décalage de 30°
            const totalSteps = 6;
            const anglePerStep = 360 / totalSteps;
            const angle = (-60 + index * anglePerStep) * (Math.PI / 180); // -60° pour le décalage
            const radius = 180;
            const position = {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            };
            
            // Déterminer si cette étape est l'étape actuelle
            const isCurrent = index === statusIndex;
            // Déterminer si cette étape est complétée
            const isCompleted = index < statusIndex;
            
            return (
              // Indicateur d'étape positionné autour du cercle
              <div
                key={index}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isCurrent ? 'w-24 h-24' : 'w-20 h-20'
                }`}
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                }}
              >
                {/* Contenu de l'indicateur avec styles selon l'état */}
                <div className={`w-full h-full rounded-2xl border-2 backdrop-blur flex flex-col items-center justify-center gap-1 transition-all ${
                  isCurrent
                    ? 'bg-cyan-400/20 border-cyan-400'
                    : isCompleted
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-white/5 border-white/20'
                }`}
                style={isCurrent ? {
                  boxShadow: `0 0 20px ${stage.color}40`
                } : {}}>
                  {/* Icône de l'étape */}
                  <span className="text-3xl">{stage.icon}</span>
                  {/* Label court de l'étape */}
                  <span className={`text-xs font-medium px-2 text-center ${
                    isCurrent ? 'text-cyan-400' :
                    isCompleted ? 'text-green-400' :
                    'text-white'
                  }`}>
                    {stage.short}
                  </span>
                  {/* Coche pour les étapes complétées */}
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 text-green-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Cercle central avec barre de progression SVG */}
          <div className="relative w-64 h-64">
            {/* SVG rotaté de -90° pour commencer en haut */}
            <svg className="transform -rotate-90 w-64 h-64">
              {/* Cercle de fond gris */}
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              {/* Cercle de progression coloré avec gradient */}
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 100}`}
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))'
                }}
              />
              {/* Définition du gradient pour la progression */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Contenu central : icône et nom de l'étape actuelle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl mb-2">{currentStage.icon}</div>
              <div className="text-center px-4">
                <p className="text-white font-semibold text-sm">{currentStage.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression linéaire en bas */}
      <div className="mb-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 transition-all duration-1000 ease-out"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
