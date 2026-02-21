import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface BaseLayoutProps {
    children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
    return (
        <div className="min-h-screen bg-brand-light flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow container mx-auto p-4 md:p-6">
                {children}
            </main>
            <footer className="bg-brand-dark text-white p-4 text-center text-sm">
                &copy; 2026 Madness Draft Pool
            </footer>
        </div>
    );
}
