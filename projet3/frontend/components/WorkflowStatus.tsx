'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import VotingABI from '@/lib/contracts/VotingABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`;

const workflowStages = [
  { name: 'Enregistrement Votants', icon: '👥', color: '#00d4ff', short: 'Registering voters' },
  { name: 'Enregistrement Propositions', icon: '📝', color: '#7c3aed', short: 'Registering proposals' },
  { name: 'Fin Propositions', icon: '🔒', color: '#10b981', short: 'End of proposals' },
  { name: 'Session de Vote', icon: '🗳️', color: '#f59e0b', short: 'Voting' },
  { name: 'Fin du Vote', icon: '⏱️', color: '#ef4444', short: 'Vote ended' },
  { name: 'Votes Comptabilisés', icon: '📊', color: '#06b6d4', short: 'Results' }
];

const workflowActions = [
  { function: null, label: 'Registering Voters', icon: '👥' }, // Étape 0 (déjà là, non cliquable)
  { function: 'startProposalsRegistering', label: 'Start Proposals', icon: '📝' },
  { function: 'endProposalsRegistering', label: 'End Proposals', icon: '🔒' },
  { function: 'startVotingSession', label: 'Start Voting', icon: '🗳️' },
  { function: 'endVotingSession', label: 'End Voting', icon: '⏱️' },
  { function: 'tallyVotes', label: 'Tally Votes', icon: '📊' }
];

export default function WorkflowStatus() {
  const { address } = useAccount();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: workflowStatus, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'workflowStatus',
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: 'owner',
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    query: {
      enabled: !!hash && isOwner, // Seulement actif si hash existe et user est owner
    }
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    eventName: 'WorkflowStatusChange',
    onLogs() {
      // Recharger le statut quand il change
      refetch();
    },
  });

  useEffect(() => {
    if (error && isOwner) {
      setErrorMessage('❌ Transaction failed');
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isOwner]);

  useEffect(() => {
    if (isSuccess && isOwner) {
      setSuccessMessage('✅ Status updated!');
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isOwner]);

  const statusIndex = typeof workflowStatus === 'number' ? workflowStatus : 0;
  const currentStage = workflowStages[statusIndex];
  const progress = ((statusIndex + 1) / 6) * 100;

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

  // Calculer les positions des boutons autour du cercle (comme une horloge)
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
    <div className="glass rounded-2xl p-8 glow-cyan relative">
      {/* Messages */}
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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Vote Cycle</h2>
          <p className="text-gray-400 text-sm">Current workflow status</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {statusIndex + 1}/6
          </div>
          <div className="text-xs text-gray-400">Stages</div>
        </div>
      </div>

      {/* Circular Progress with Control Buttons */}
      <div className="flex justify-center mb-8 py-12">
        <div className="relative w-96 h-96 flex items-center justify-center">
          
          {/* Pour les admins: afficher les 6 boutons (incluant l'étape 0) */}
          {isOwner && workflowActions.map((action, index) => {
            const position = getButtonPosition(index, 6);
            const isNextAction = index === statusIndex + 1;
            const isCompleted = index <= statusIndex;
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
                <div className={`w-full h-full rounded-2xl border-2 backdrop-blur flex flex-col items-center justify-center gap-1 transition-all ${
                  isCurrentStep && !action.function
                    ? 'bg-cyan-400/20 border-cyan-400 cursor-not-allowed'
                    : isCompleted && index < statusIndex
                    ? 'bg-green-500/20 border-green-500/50 cursor-not-allowed'
                    : isNextAction && action.function
                    ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400 hover:scale-110 cursor-pointer'
                    : 'bg-white/5 border-white/20 cursor-not-allowed'
                }`}>
                  <span className="text-3xl">{action.icon}</span>
                  <span className={`text-xs font-medium px-2 text-center ${
                    isCurrentStep && !action.function ? 'text-cyan-400' :
                    isCompleted && index < statusIndex ? 'text-green-400' : 
                    isNextAction && action.function ? 'text-cyan-400' : 
                    'text-white'
                  }`}>
                    {action.label}
                  </span>
                  {isCompleted && index < statusIndex && (
                    <span className="absolute -top-1 -right-1 text-green-400 text-xl">✓</span>
                  )}
                  {isNextAction && action.function && (isPending || isConfirming) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Pour les non-admins: afficher les étapes autour du cercle */}
          {!isOwner && workflowStages.map((stage, index) => {
            // Positionner uniquement les étapes jusqu'à l'étape actuelle + 1
            // L'angle commence à -60° (décalé de 30° dans le sens horaire depuis le haut) et progresse dans le sens horaire
            const totalSteps = 6;
            const anglePerStep = 360 / totalSteps;
            const angle = (-60 + index * anglePerStep) * (Math.PI / 180); // -60° au lieu de -90° pour décaler de 30°
            const radius = 180;
            const position = {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            };
            
            const isCurrent = index === statusIndex;
            const isCompleted = index < statusIndex;
            
            return (
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
                  <span className="text-3xl">{stage.icon}</span>
                  <span className={`text-xs font-medium px-2 text-center ${
                    isCurrent ? 'text-cyan-400' :
                    isCompleted ? 'text-green-400' :
                    'text-white'
                  }`}>
                    {stage.short}
                  </span>
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 text-green-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Central Circle with Progress */}
          <div className="relative w-64 h-64">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
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
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl mb-2">{currentStage.icon}</div>
              <div className="text-center px-4">
                <p className="text-white font-semibold text-sm">{currentStage.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
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
