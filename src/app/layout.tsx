import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | GarimpoLocal',
    default: 'GarimpoLocal - Diretório Nacional de Empresas',
  },
  description: 'Diretório local confiável, rápido e útil para moradores e empresas do Brasil.',
  keywords: ['diretório de empresas', 'busca local', 'guarulhos', 'empresas locais'],
  openGraph: {
    title: 'GarimpoLocal - Diretório Nacional de Empresas',
    description:
      'Encontre as melhores empresas na sua cidade ou bairro de forma rápida e confiável.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GarimpoLocal',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
