'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import AdminPanel from '@/components/AdminPanel';
import ProposalForm from '@/components/ProposalForm';
import ProposalList from '@/components/ProposalList';
import VoteSection from '@/components/VoteSection';
import Results from '@/components/Results';
import WorkflowStatus from '@/components/WorkflowStatus';
import VotersList from '@/components/VotersList';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🗳️ Voting DApp
          </h1>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Connectez votre wallet pour commencer
            </h2>
            <p className="text-gray-500">
              Utilisez le bouton ci-dessus pour connecter votre portefeuille MetaMask
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statut du workflow */}
            <WorkflowStatus />

            {/* Panel Admin */}
            <AdminPanel />

            {/* Propositions et Vote */}
            <div className="space-y-8">
              <div className="space-y-8">
                <ProposalForm />
                <VoteSection />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VotersList />
                <ProposalList />
              </div>
            </div>

            {/* Résultats */}
            <Results />
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>Projet Alyra - DApp Système de Vote Décentralisé</p>
          {address && (
            <p className="text-sm mt-2">
              Connecté avec : {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
