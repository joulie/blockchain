// Directive pour indiquer que ce composant s'exécute côté client
'use client';

// Import du bouton de connexion RainbowKit
import { ConnectButton } from '@rainbow-me/rainbowkit';
// Import du hook Wagmi pour récupérer l'adresse et le statut de connexion
import { useAccount } from 'wagmi';
// Import des composants de l'application
import AdminPanel from '@/components/AdminPanel';
import ProposalForm from '@/components/ProposalForm';
import ProposalList from '@/components/ProposalList';
import VoteSection from '@/components/VoteSection';
import Results from '@/components/Results';
import WorkflowStatus from '@/components/WorkflowStatus';
import VotersList from '@/components/VotersList';

/**
 * Composant Home - Page principale de l'application
 * 
 * Cette page affiche l'interface complète du système de vote avec :
 * - Un header avec le logo et le bouton de connexion
 * - Une page de connexion si l'utilisateur n'est pas connecté
 * - L'interface complète du vote une fois connecté :
 *   * Cycle de vote visuel (gauche)
 *   * Panneau admin et formulaires (droite)
 *   * Section de vote et résultats (bas)
 */
export default function Home() {
  // Récupération de l'adresse du wallet et du statut de connexion
  // Récupération de l'adresse du wallet et du statut de connexion
  const { address, isConnected } = useAccount();

  return (
    // Conteneur principal avec hauteur minimale et gestion du défilement
    <div className="min-h-screen relative overflow-hidden">
      {/* Effets de fond avec bulles colorées pour le style "glass morphism" */}
      <div className="fixed inset-0 z-0">
        {/* Bulle cyan en haut à gauche */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        {/* Bulle violette en bas à droite */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* En-tête avec effet glass et bordure */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo et titre de l'application */}
          <div className="flex items-center space-x-3">
            {/* Icône du logo avec effet de lueur */}
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center glow-cyan">
              <span className="text-2xl">🗳️</span>
            </div>
            {/* Titre et sous-titre */}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Voting Protocol
              </h1>
              <p className="text-xs text-gray-400">Decentralized Governance</p>
            </div>
          </div>
          {/* Bouton de connexion RainbowKit */}
          <ConnectButton />
        </div>
      </header>

      {/* Contenu principal de la page */}
      <main className="relative z-10 w-full px-2 py-8">
        {/* Affichage conditionnel selon le statut de connexion */}
        {!isConnected ? (
          // Page de connexion si wallet non connecté
          <div className="text-center py-32">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto glow-cyan">
              {/* Icône de sécurité */}
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-cyan">
                <span className="text-4xl">🔐</span>
              </div>
              {/* Message de connexion */}
              <h2 className="text-3xl font-bold text-white mb-4">
                Connect Wallet
              </h2>
              <p className="text-gray-400 mb-6">
                Connect your Web3 wallet to participate in decentralized voting
              </p>
              <div className="inline-block">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          // Interface complète de vote une fois connecté
          <div className="space-y-6">
            {/* Grille principale - Vote Cycle à gauche (50%), autres composants à droite (50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Colonne gauche - Cycle de vote visuel avec boutons de contrôle */}
              <div>
                <WorkflowStatus />
              </div>

              {/* Colonne droite - Panneau admin, formulaire de proposition, liste des propositions et votants */}
              <div className="space-y-6">
                {/* Panneau d'administration (visible uniquement pour l'owner) */}
                <AdminPanel />
                {/* Formulaire de soumission de proposition (visible en phase 1) */}
                <ProposalForm />
                {/* Liste de toutes les propositions */}
                <ProposalList />
                {/* Liste des votants enregistrés (visible uniquement pour l'owner) */}
                <VotersList />
              </div>
            </div>

            {/* Section inférieure - Section de vote et résultats */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Section pour voter (visible en phase 3) */}
              <VoteSection />
              {/* Affichage des résultats (visible en phase 5) */}
              <Results />
            </div>
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="relative z-10 glass border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            {/* Informations sur l'application */}
            <div className="text-gray-400">
              <p className="font-semibold text-cyan-400">Voting Protocol v1.0</p>
              <p className="text-xs mt-1">Powered by Ethereum • Built with ❤️</p>
            </div>
            {/* Affichage de l'adresse connectée */}
            {address && (
              <div className="text-right">
                <p className="text-gray-400 text-xs">Connected</p>
                <p className="text-cyan-400 font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
