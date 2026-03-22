'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { leetcodeAPI } from '@/lib/leetcode/api';
import { 
    User, 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    Trophy, 
    Activity, 
    Flame, 
    GraduationCap,
    Unlink,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface LeetCodeProfile {
    id: string;
    leetcode_username: string;
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    acceptance_rate: number;
    ranking: number;
    streak: number;
    last_synced_at: string;
}

export default function LeetCodeConnect() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('leetcode_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setProfile(data);
            fetchStats(data.leetcode_username);
        }
    };

    const fetchStats = async (username: string) => {
        const profileData = await leetcodeAPI.fetchUserProfile(username);
        if (profileData) {
            setStats(profileData);
        }
    };

    const handleConnect = async () => {
        if (!username.trim()) {
            toast.error('LeetCode Identity Required');
            return;
        }

        setValidating(true);
        try {
            const isValid = await leetcodeAPI.validateUsername(username);
            if (!isValid) {
                toast.error('Invalid LeetCode Username');
                setValidating(false);
                return;
            }

            const profileData = await leetcodeAPI.fetchUserProfile(username);
            if (!profileData) {
                toast.error('Protocol Error: Data Fetch Failed');
                setValidating(false);
                return;
            }

            setStats(profileData);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error: dbError } = await supabase
                .from('leetcode_profiles')
                .upsert({
                    user_id: user.id,
                    leetcode_username: username,
                    total_solved: profileData.totalSolved,
                    easy_solved: profileData.easySolved,
                    medium_solved: profileData.mediumSolved,
                    hard_solved: profileData.hardSolved,
                    acceptance_rate: profileData.acceptanceRate,
                    ranking: profileData.ranking,
                    streak: profileData.streak,
                    last_synced_at: new Date().toISOString(),
                    profile_data: profileData
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (dbError) throw dbError;

            // Also update main profiles table for central sync
            await supabase.from('profiles').update({ leetcode_handle: username }).eq('id', user.id);

            setProfile(data);
            toast.success('LeetCode Protocol Linked');
            setUsername('');
            
            // Trigger initial sync to populate heatmap/history
            await handleSync();
        } catch (err: any) {
            toast.error('Linkage Failed: ' + err.message);
        } finally {
            setValidating(false);
        }
    };

    const handleSync = async () => {
        if (!profile) return;
        setSyncing(true);
        try {
            const res = await fetch('/api/neural/sync', { method: 'POST' });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Sync Failed');
            }
            
            await fetchProfile(); // Reload local state from DB
            toast.success('Neural Link Synchronized');
        } catch (err: any) {
            toast.error('Sync Interrupted: ' + err.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Authorize Protocol Disconnection?')) return;
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('leetcode_profiles')
            .delete()
            .eq('user_id', user?.id);

        if (error) {
            toast.error('De-linkage Aborted');
        } else {
            setProfile(null);
            setStats(null);
            toast.success('LeetCode Connection Offline');
        }
    };

    return (
        <div className="p-8 h-full flex flex-col pt-20">
            {!profile ? (
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#FFA116]/60 ml-2">LeetCode_ID</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., neetcode"
                                className="flex-1 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] text-white p-4 rounded-2xl outline-none focus:border-[#FFA116]/50 transition-all font-mono text-sm"
                                disabled={validating}
                            />
                            <button
                                onClick={handleConnect}
                                disabled={validating || !username}
                                className="px-8 bg-[#FFA116] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#FFB84D] transition-all shadow-lg shadow-[#FFA116]/20 active:scale-95 disabled:opacity-50"
                            >
                                {validating ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Connect'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'DATA_SYNC', icon: Activity, color: 'text-blue-400' },
                            { label: 'RANK_TRACK', icon: Trophy, color: 'text-amber-400' },
                        ].map((item, i) => (
                            <div key={i} className="bg-[var(--bg-base)]/30 border border-[var(--border-subtle)] p-4 rounded-2xl flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FFA116] to-[#FFB84D] rounded-2xl flex items-center justify-center text-black shadow-xl shadow-[#FFA116]/20">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white leading-tight">
                                    {profile.leetcode_username}
                                </h3>
                                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                    Last_Sync: {new Date(profile.last_synced_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSync} 
                                disabled={syncing}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-[#FFA116]' : 'text-[var(--text-muted)]'}`} />
                            </button>
                            <button 
                                onClick={handleDisconnect}
                                className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all text-rose-500"
                            >
                                <Unlink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/60 mb-1">Solved</p>
                                <p className="text-3xl font-display font-bold text-white">{profile.total_solved}</p>
                                <div className="mt-3 space-y-1.5 opacity-60">
                                    <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-emerald-400">EASY</span>
                                        <span className="text-white">{profile.easy_solved}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-amber-400">MED</span>
                                        <span className="text-white">{profile.medium_solved}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-rose-400">HARD</span>
                                        <span className="text-white">{profile.hard_solved}</span>
                                    </div>
                                </div>
                            </div>
                            <CheckCircle2 className="absolute -right-4 -bottom-4 w-20 h-20 text-[#10B981]/10 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex-1 bg-sky-500/5 border border-sky-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 mb-1">Ranking</p>
                                    <p className="text-xl font-display font-bold text-white">#{profile.ranking?.toLocaleString()}</p>
                                </div>
                                <Trophy className="absolute -right-4 -bottom-4 w-16 h-16 text-sky-500/10 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 bg-[#FFA116]/5 border border-[#FFA116]/20 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FFA116]/60 mb-1">Streak</p>
                                    <p className="text-xl font-display font-bold text-white flex items-center gap-2">
                                        {profile.streak} <Flame size={18} className="text-[#FFA116]" />
                                    </p>
                                </div>
                                <Activity className="absolute -right-4 -bottom-4 w-16 h-16 text-[#FFA116]/10 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
    );
}
