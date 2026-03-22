// components/profile/VerificationModal.tsx
'use client';

import React, { useState } from 'react';
import { 
    CheckBadgeIcon, 
    XMarkIcon,
    CloudArrowUpIcon,
    LinkIcon,
    BuildingOfficeIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        linkedinUrl: '',
        offerLetterUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/verify-placement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Verification Request Submitted');
                onClose();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error('Submission Failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="size-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                            <CheckBadgeIcon className="size-6" />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                            <XMarkIcon className="size-6" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Official Verification</h2>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Placement_Proof_Protocol_v1.0</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Company_Target</label>
                            <div className="relative group">
                                <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                                    placeholder="e.g. Google"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Operational_Role</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                                    placeholder="e.g. SDE-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">LinkedIn_Profile_Intel</label>
                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <input 
                                type="url" 
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Verification_Documentation</label>
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                            <CloudArrowUpIcon className="size-10 text-white/20 mx-auto mb-4 group-hover:text-emerald-400 transition-colors" />
                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Click to Uplink Proof</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase">Offer Letter / ID Card (PDF/JPG)</p>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            Abort_Mission
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Transmitting...' : 'Initialize_Auth'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
