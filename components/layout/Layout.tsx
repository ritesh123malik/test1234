'use client';

import React from 'react';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { BottomTabBar } from './BottomTabBar';
import { Footer } from './Footer';
import { CommandPalette } from '@/components/search/CommandPalette';
import { PageWrapper } from '@/components/PageWrapper';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-base flex flex-col">
            <Header />
            <MobileDrawer />
            <main className="flex-grow pt-[63px] pb-16 md:pb-0">
                <PageWrapper>
                    {children}
                </PageWrapper>
            </main>
            <Footer />
            <BottomTabBar />
            <CommandPalette />
        </div>
    );
}
