'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { codeforcesAPI } from '@/lib/codeforces/api';
import {
    UserCircleIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrophyIcon,
    ChartBarIcon,
    FireIcon,
    UserIcon
} from '@heroicons/react/24/outline';

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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [syncing, setSyncing] = useState(false);

    // Fetch existing profile on mount
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
            setError('Please enter a Codeforces handle');
            return;
        }

        setValidating(true);
        setError('');
        setSuccess('');

        try {
            // Validate handle
            const userInfo = await codeforcesAPI.fetchUserInfo(handle);

            if (!userInfo) {
                setError('Invalid Codeforces handle. Please check and try again.');
                setValidating(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('You must be logged in to connect a profile');
                return;
            }

            // Save to database
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
            setSuccess('Codeforces profile connected successfully!');
            setHandle('');
        } catch (err: any) {
            setError(err.message || 'Failed to connect profile');
        } finally {
            setValidating(false);
        }
    };

    const handleSync = async () => {
        if (!profile) return;

        setSyncing(true);
        setError('');

        try {
            const userInfo = await codeforcesAPI.fetchUserInfo(profile.codeforces_handle);

            if (!userInfo) {
                throw new Error('Could not fetch profile data');
            }

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
            setSuccess('Profile synced successfully!');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to sync profile');
        } finally {
            setSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your Codeforces profile?')) return;

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('codeforces_profiles')
            .delete()
            .eq('user_id', user?.id);

        if (error) {
            setError('Failed to disconnect profile');
        } else {
            setProfile(null);
            setSuccess('Profile disconnected');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-8 h-8" />
                    <div>
                        <h2 className="text-xl font-bold font-display">Connect Codeforces Handle</h2>
                        <p className="text-blue-100 text-sm">Competitive programming prowess</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center text-sm">
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center text-sm">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                )}

                {!profile ? (
                    // Connect Form
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Codeforces Handle
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    placeholder="e.g., tourist"
                                    className="flex-1 p-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                                    disabled={validating}
                                />
                                <button
                                    onClick={handleConnect}
                                    disabled={validating || !handle}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                                >
                                    {validating ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                            Validating...
                                        </>
                                    ) : (
                                        'Connect'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            {[
                                { label: 'Current Rating', icon: '⭐', color: 'blue' },
                                { label: 'Max Rating', icon: '📈', color: 'indigo' },
                                { label: 'Current Rank', icon: '👤', color: 'purple' },
                                { label: 'Max Rank', icon: '👑', color: 'yellow' },
                            ].map((item, i) => (
                                <div key={i} className="bg-surface border border-border p-4 rounded-xl text-center">
                                    <div className="text-2xl mb-1">{item.icon}</div>
                                    <div className="text-xs text-text-muted font-medium">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Connected Profile View
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                                    {profile.codeforces_handle[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {profile.codeforces_handle}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Last synced: {new Date(profile.last_synced_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-100"
                                    title="Sync now"
                                >
                                    <ArrowPathIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-100"
                                    title="Disconnect"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl hover:shadow-sm transition">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {profile.rating}
                                </div>
                                <div className="text-xs text-gray-500 mb-2 font-medium">Current Rating</div>
                                <div className="text-xs text-blue-600/80">Rank: <span className="font-bold">{profile.rank}</span></div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl hover:shadow-sm transition">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">
                                    {profile.max_rating}
                                </div>
                                <div className="text-xs text-gray-500 mb-2 font-medium">Peak Rating</div>
                                <div className="text-xs text-indigo-600/80">Peak: <span className="font-bold">{profile.max_rank}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
