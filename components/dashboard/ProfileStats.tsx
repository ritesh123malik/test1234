'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    GraduationCap,
    Edit3,
    X,
    Check,
    Loader2,
    TrendingUp,
    Star,
    MapPin,
    Building
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CollegeCitySetup from '../leaderboard/CollegeCitySetup';

interface ProfileStatsProps {
    profile: any;
    isPro: boolean;
}

export default function ProfileStats({ profile: initialProfile, isPro }: ProfileStatsProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [newCgpa, setNewCgpa] = useState(profile?.cgpa || 0);
    const [isSaving, setIsSaving] = useState(false);
    const [showArenaSetup, setShowArenaSetup] = useState(false);
    const supabase = createClient();

    const handleUpdateCgpa = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ cgpa: newCgpa })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, cgpa: newCgpa });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update CGPA:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveArena = async (college: string, city: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ college, city })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, college, city });
            setShowArenaSetup(false);
            alert('Arena Identity Synchronized Successfully');
        } catch (err: any) {
            console.error('Arena Update Error:', err);
            alert(`Failed to update Arena Identity: ${err.message || 'Unknown Error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] shadow-xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/5 blur-[50px] rounded-full group-hover:bg-[var(--brand-primary)]/10 transition-all" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--brand-primary)] overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Orbit" className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{profile?.full_name || 'Agent_X'}</h3>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{isPro ? 'ELITE_ACCOUNT' : 'STANDARD_ACCOUNT'}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all"
                >
                    <Edit3 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-[var(--brand-primary)]">
                        <Star size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">XP_Score</span>
                    </div>
                    <p className="text-2xl font-black text-white leading-none">{profile?.xp || 0}</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                        <GraduationCap size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">CGPA_VAL</span>
                    </div>
                    <p className="text-2xl font-black text-white leading-none">{profile?.cgpa || '0.00'}</p>
                </div>
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">
                        <Building size={12} /> Institution
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">{profile?.college || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">
                        <MapPin size={12} /> Strategic_Base
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">{profile?.city || 'Not Set'}</span>
                </div>
                <button
                    onClick={() => setShowArenaSetup(true)}
                    className="w-full mt-2 py-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-lg"
                >
                    Update_Arena_Identity
                </button>
            </div>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-10 rounded-[3rem] shadow-2xl"
                        >
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Update Parameters</h3>
                            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-10">Manual_Data_Override</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Academic CGPA (0-10)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={newCgpa}
                                        onChange={(e) => setNewCgpa(parseFloat(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none focus:border-[var(--brand-primary)] transition-all"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-[var(--text-muted)] hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleUpdateCgpa}
                                        disabled={isSaving}
                                        className="flex-1 py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-[var(--brand-primary)]/20 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {isSaving ? 'Syncing...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showArenaSetup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <div className="w-full max-w-lg relative">
                            <button
                                onClick={() => setShowArenaSetup(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-[var(--brand-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <CollegeCitySetup
                                currentCollege={profile?.college || ''}
                                currentCity={profile?.city || ''}
                                onSave={handleSaveArena}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
