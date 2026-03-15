'use client';

import React from 'react';
import { Header } from './Header';
import { CommandPalette } from '../search/CommandPalette';
import { MobileDrawer } from './MobileDrawer';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-bg-base flex flex-col">
            <Header />
            <MobileDrawer />
            <main className="flex-grow pt-[63px]">
                {children}
            </main>
            <CommandPalette />

            {/* Global Toast / Notification Container could go here */}
        </div>
    );
}
