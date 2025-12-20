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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center glow-cyan">
              <span className="text-2xl">🗳️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Voting Protocol
              </h1>
              <p className="text-xs text-gray-400">Decentralized Governance</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="relative z-10 w-full px-2 py-8">
        {!isConnected ? (
          <div className="text-center py-32">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto glow-cyan">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-cyan">
                <span className="text-4xl">🔐</span>
              </div>
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
          <div className="space-y-6">
            {/* Main Grid - Vote Cycle à gauche (50%), autres composants à droite (50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column - Vote Cycle */}
              <div>
                <WorkflowStatus />
              </div>

              {/* Right Column - Admin Panel, Proposal Form, Proposals, Registered Voters */}
              <div className="space-y-6">
                <AdminPanel />
                <ProposalForm />
                <ProposalList />
                <VotersList />
              </div>
            </div>

            {/* Bottom Section - Vote Section, Results */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <VoteSection />
              <Results />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-400">
              <p className="font-semibold text-cyan-400">Voting Protocol v1.0</p>
              <p className="text-xs mt-1">Powered by Ethereum • Built with ❤️</p>
            </div>
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
