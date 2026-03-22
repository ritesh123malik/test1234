'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { codeforcesAPI } from '@/lib/codeforces/api';
import { 
    User, 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    Trophy, 
    Activity, 
    Flame, 
    Unlink,
    Globe,
    TrendingUp,
    Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CodeforcesProfile {
    id: string;
    codeforces_handle: string;
    rating: number;
    max_rating: number;
    rank: string;
    max_rank: string;
    last_synced_at: string;
}

export default function CodeforcesConnect() {
    const [handle, setHandle] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [profile, setProfile] = useState<CodeforcesProfile | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('codeforces_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setProfile(data);
        }
    };

    const handleConnect = async () => {
        if (!handle.trim()) {
            toast.error('Codeforces Handle Required');
            return;
        }

        setValidating(true);
        try {
            const userInfo = await codeforcesAPI.fetchUserInfo(handle);
            if (!userInfo) {
                toast.error('Invalid Codeforces Handle');
                setValidating(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error: dbError } = await supabase
                .from('codeforces_profiles')
                .upsert({
                    user_id: user.id,
                    codeforces_handle: handle,
                    rating: userInfo.rating,
                    max_rating: userInfo.maxRating,
                    rank: userInfo.rank,
                    max_rank: userInfo.maxRank,
                    last_synced_at: new Date().toISOString(),
                    profile_data: userInfo
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (dbError) throw dbError;

            setProfile(data);
            toast.success('Codeforces Protocol Established');
            setHandle('');
        } catch (err: any) {
            toast.error('Connection Failed: ' + err.message);
        } finally {
            setValidating(false);
        }
    };

    const handleSync = async () => {
        if (!profile) return;
        setSyncing(true);
        try {
            const userInfo = await codeforcesAPI.fetchUserInfo(profile.codeforces_handle);
            if (!userInfo) throw new Error('Sync Protocol Error');

            const { data: { user } } = await supabase.auth.getUser();
            const { error: updateError } = await supabase
                .from('codeforces_profiles')
                .update({
                    rating: userInfo.rating,
                    max_rating: userInfo.maxRating,
                    rank: userInfo.rank,
                    max_rank: userInfo.maxRank,
                    last_synced_at: new Date().toISOString(),
                    profile_data: userInfo
                })
                .eq('user_id', user?.id);

            if (updateError) throw updateError;

            setProfile({
                ...profile,
                rating: userInfo.rating,
                max_rating: userInfo.maxRating,
                rank: userInfo.rank,
                max_rank: userInfo.maxRank,
                last_synced_at: new Date().toISOString()
            });
            toast.success('Competitive Metrics Synchronized');
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
            .from('codeforces_profiles')
            .delete()
            .eq('user_id', user?.id);

        if (error) {
            toast.error('De-linkage Aborted');
        } else {
            setProfile(null);
            toast.success('Codeforces Connection Offline');
        }
    };

    return (
        <div className="p-8 h-full flex flex-col pt-20">
            {!profile ? (
                <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 ml-2">CF_Handle</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="e.g., tourist"
                                className="flex-1 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] text-white p-4 rounded-2xl outline-none focus:border-sky-500/50 transition-all font-mono text-sm"
                                disabled={validating}
                            />
                            <button
                                onClick={handleConnect}
                                disabled={validating || !handle}
                                className="px-8 bg-sky-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {validating ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Connect'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'CALENDAR_SYNC', icon: Globe, color: 'text-indigo-400' },
                            { label: 'RATING_TRACK', icon: TrendingUp, color: 'text-emerald-400' },
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
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
                                <Award className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white leading-tight">
                                    {profile.codeforces_handle}
                                </h3>
                                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                    Rank: {profile.rank}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSync} 
                                disabled={syncing}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-sky-400' : 'text-[var(--text-muted)]'}`} />
                            </button>
                            <button 
                                onClick={handleDisconnect}
                                className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all text-rose-500"
                            >
                                <Unlink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-sky-500/5 border border-sky-500/20 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 mb-1">Rating</p>
                                <p className="text-4xl font-display font-bold text-white">{profile.rating}</p>
                                <p className="text-[10px] font-bold text-sky-400/80 mt-2 uppercase tracking-tighter">MAX: {profile.max_rating} ({profile.max_rank})</p>
                            </div>
                            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-sky-500/10 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Last_Activity</p>
                                <p className="text-sm font-mono font-bold text-white mt-4 uppercase">
                                    {new Date(profile.last_synced_at).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest">Protocol_Active</p>
                            </div>
                            <Activity className="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-500/10 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
