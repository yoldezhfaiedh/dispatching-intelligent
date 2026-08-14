import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DashboardShell } from '@/components/dashboard-shell'
import { AuthProvider } from '@/lib/auth'
import './globals.css'
export const metadata: Metadata = { title: 'Dispatching Intelligent · Orange Tunisie', description: 'Pilotage intelligent des stocks Orange Tunisie' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#ff7900' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr" className="bg-[#f6f6f6]"><body className="antialiased"><AuthProvider><DashboardShell>{children}</DashboardShell></AuthProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
