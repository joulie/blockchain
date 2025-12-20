// Directive pour indiquer que ce composant s'exécute côté client
'use client';

// Import du client React Query pour la gestion du cache des requêtes
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import du provider Wagmi pour la connexion Web3
import { WagmiProvider } from 'wagmi';
// Import du provider RainbowKit pour l'interface de connexion wallet
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// Import de la configuration Wagmi personnalisée
import { config } from '@/lib/wagmiConfig';
// Import des styles CSS de RainbowKit
import '@rainbow-me/rainbowkit/styles.css';

// Création d'une instance QueryClient pour gérer le cache des données
// Ce client est utilisé par React Query pour optimiser les requêtes
const queryClient = new QueryClient();

/**
 * Composant Providers - Encapsulation des providers Web3
 * 
 * Ce composant enveloppe l'application avec tous les providers nécessaires
 * pour la connexion Web3 et la gestion des données blockchain
 * 
 * Structure hiérarchique :
 * 1. WagmiProvider : Fournit les hooks Web3 (useAccount, useReadContract, etc.)
 * 2. QueryClientProvider : Gère le cache et l'état des requêtes
 * 3. RainbowKitProvider : Fournit l'interface de connexion wallet
 * 
 * @param children - Les composants enfants de l'application
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Provider Wagmi avec la configuration des chaînes et connecteurs
    <WagmiProvider config={config}>
      {/* Provider React Query pour la gestion du cache */}
      <QueryClientProvider client={queryClient}>
        {/* Provider RainbowKit pour l'interface de connexion */}
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
