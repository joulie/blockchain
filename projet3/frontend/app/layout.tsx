// Import des types TypeScript de Next.js pour les métadonnées
import type { Metadata } from "next";
// Import des polices Google Fonts Geist pour l'interface
import { Geist, Geist_Mono } from "next/font/google";
// Import des styles globaux de l'application (dark mode, glass morphism)
import "./globals.css";
// Import du composant Providers qui encapsule les fournisseurs Web3
import { Providers } from "./providers";

// Configuration de la police Geist Sans
// Cette police est utilisée pour le texte principal de l'interface
const geistSans = Geist({
  variable: "--font-geist-sans", // Variable CSS pour utiliser la police
  subsets: ["latin"], // Sous-ensemble de caractères à charger
});

// Configuration de la police Geist Mono
// Cette police monospace est utilisée pour les adresses et codes
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Variable CSS pour la police monospace
  subsets: ["latin"], // Sous-ensemble de caractères à charger
});

// Métadonnées de l'application pour le SEO et l'affichage
export const metadata: Metadata = {
  title: "Voting DApp - Système de Vote Décentralisé",
  description: "Application décentralisée pour un système de vote transparent et sécurisé",
};

/**
 * Composant RootLayout - Structure principale de l'application
 * 
 * Ce composant définit la structure HTML de base de toute l'application
 * Il encapsule tous les composants enfants avec les providers Web3
 * 
 * @param children - Les composants enfants à afficher dans le layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Balise HTML principale avec langue française
    <html lang="fr">
      <body
        // Application des polices via variables CSS et activation de l'antialiasing
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Encapsulation des enfants avec les providers Wagmi et RainbowKit */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
