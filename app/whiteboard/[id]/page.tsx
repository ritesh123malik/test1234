'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header as Navbar } from '@/components/layout/Header';
import {
    ChevronLeft,
    Save,
    Share2,
    Settings,
    LayoutGrid,
    Cpu,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import Excalidraw as it only works in the browser
const Excalidraw = dynamic(
    async () => (await import('@excalidraw/excalidraw')).Excalidraw,
    { ssr: false }
);

export default function WhiteboardSession() {
    const { id } = useParams();
    const router = useRouter();
    const [elements, setElements] = useState([]);
    const [appState, setAppState] = useState({});
    const [title, setTitle] = useState('New System Design');
    const [isSaving, setIsSaving] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        // Fetch existing data
        const loadBoard = async () => {
            try {
                const res = await fetch('/api/whiteboard');
                const data = await res.json();
                const currentBoard = data.find((b: any) => b.id === id);
                if (currentBoard) {
                    setTitle(currentBoard.title);
                    if (currentBoard.content_json?.elements) {
                        setInitialData(currentBoard.content_json);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadBoard();
    }, [id]);

    const handleSave = async (exElements: any, exAppState: any) => {
        setIsSaving(true);
        try {
            await fetch('/api/whiteboard', {
                method: 'POST',
                body: JSON.stringify({
                    id,
                    title,
                    content_json: { elements: exElements, appState: exAppState }
                })
            });
            toast.success('Canvas Synchronized', { description: 'State saved to neural cloud.' });
        } catch (e) {
            toast.error('Sync error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen bg-black flex flex-col overflow-hidden">
            {/* Header / Toolbar */}
            <div className="h-20 bg-black/80 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => router.push('/whiteboard')}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-xl font-black uppercase tracking-tight text-white focus:outline-none"
                        />
                        <div className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Cpu size={10} /> Active_Canvas_Sector_{id?.slice(0, 4)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleSave(elements, appState)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                    >
                        {isSaving ? 'Syncing...' : 'Synchronize'}
                        <Save size={14} />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative">
                <Excalidraw
                    initialData={initialData}
                    onChange={(elements, appState) => {
                        setElements(elements as any);
                        setAppState(appState as any);
                    }}
                    theme="dark"
                    UIOptions={{
                        canvasActions: {
                            toggleTheme: false,
                        }
                    }}
                />

                {/* Proctor/Security Watermark */}
                <div className="absolute bottom-8 right-8 z-20 pointer-events-none opacity-20">
                    <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        <Shield size={12} /> Neural_Vignette_Active
                    </div>
                </div>
            </div>
        </div>
    );
}
