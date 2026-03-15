'use client';

import React from 'react';
import { Bell, Sparkles, Building2, Trophy, Clock } from 'lucide-react';

interface NotificationBellProps {
    count: number;
}

export function NotificationBell({ count }: NotificationBellProps) {
    return (
        <div className="relative group/notif">
            <button className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all relative">
                <Bell size={20} />
                {count > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand-danger text-white text-[9px] font-black flex items-center justify-center rounded-full border border-bg-base shadow-lg pulse">
                        {count}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-80 opacity-0 translate-y-2 pointer-events-none group-hover/notif:opacity-100 group-hover/notif:translate-y-0 group-hover/notif:pointer-events-auto transition-all duration-200 z-50">
                <div className="glass-card bg-bg-elevated/95 backdrop-blur-2xl border-border-strong divide-y divide-border-subtle overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-bg-overlay/50">
                        <h3 className="font-display font-bold text-xs uppercase tracking-widest text-text-primary">Notifications</h3>
                        <button className="text-[10px] font-bold text-brand-primary hover:underline">Mark all read</button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        <div className="p-4 flex items-start gap-3 hover:bg-bg-overlay/60 transition-colors cursor-pointer group/item">
                            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                                <Building2 size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-primary leading-tight font-medium">
                                    <span className="font-bold">Flipkart</span> just added 2025 interview data for SDE-1
                                </p>
                                <p className="text-[10px] text-text-muted mt-1">2 hours ago</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-brand-primary mt-1" />
                        </div>

                        <div className="p-4 flex items-start gap-3 hover:bg-bg-overlay/60 transition-colors cursor-pointer group/item">
                            <div className="p-2 rounded-xl bg-brand-warning/10 text-brand-warning">
                                <Flame size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-primary leading-tight font-medium">
                                    Don't break your <span className="font-bold">12-day streak!</span> Solve one question to maintain.
                                </p>
                                <p className="text-[10px] text-text-muted mt-1">5 hours ago</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-brand-warning mt-1" />
                        </div>

                        <div className="p-4 flex items-start gap-3 hover:bg-bg-overlay/60 transition-colors cursor-pointer group/item">
                            <div className="p-2 rounded-xl bg-brand-success/10 text-brand-success">
                                <Trophy size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-primary leading-tight font-medium">
                                    Achievement unlocked: <span className="font-bold">DSA Master</span> Level 2.
                                </p>
                                <p className="text-[10px] text-text-muted mt-1">Yesterday</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 text-center bg-bg-overlay/30">
                        <button className="text-[10px] font-black tracking-widest text-text-muted hover:text-brand-primary transition-colors">VIEW ALL ACTIVITY</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Flame } from 'lucide-react';
