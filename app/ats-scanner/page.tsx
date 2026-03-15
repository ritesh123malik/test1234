'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Upload,
    Check,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Lightbulb,
    Target,
    Shield,
    X,
    ChevronDown
} from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import ScoreGauge from '@/components/ats/ScoreGauge';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { toast } from 'sonner';

export default function ATSScanner() {
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jd) {
            toast.error('Missing Data', { description: 'Please provide both a resume and a job description.' });
            return;
        }

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('jd', jd);

            const res = await fetch('/api/ats-scanner', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.status === 403 && data.upgrade) {
                setIsUpgradeModalOpen(true);
                return;
            }

            if (data.score !== undefined) {
                setResult(data);
                toast.success('Analysis Complete', { description: 'Your resume has been evaluated.' });
            } else {
                toast.error('Analysis Failed', { description: data.error || 'Check server logs.' });
            }
        } catch (e) {
            console.error(e);
            toast.error('Neural Logic Error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} featureName="Advanced Resume Scanning" />

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Shield size={12} /> Recruitment_Bypass_Active
                        </motion.div>
                        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                            ATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Scanner.</span>
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            Don't get ghosted. See exactly how an enterprise ATS views your resume against any job description.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Input Area */}
                        <div className="space-y-8">
                            {/* File Upload */}
                            <div className={`group relative p-10 border-2 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center justify-center bg-white/[0.02] ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-blue-500/30'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${file ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-gray-500 border-white/5 group-hover:border-blue-500/30'}`}>
                                    {file ? <Check size={32} /> : <Upload size={32} />}
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                                    {file ? file.name : 'Upload_Resume_PDF'}
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Click or Drag Resume'}
                                </p>
                            </div>

                            {/* JD Input */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-6 flex items-center gap-3">
                                    <Target size={12} /> Target_Job_Description
                                </label>
                                <div className="relative group">
                                    <textarea
                                        value={jd}
                                        onChange={(e) => setJd(e.target.value)}
                                        placeholder="Paste the job description here (Role, Responsibilities, Requirements)..."
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-sm font-medium placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.04] transition-all min-h-[300px] resize-none"
                                    />
                                    <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                        {jd.length} chars
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !file || !jd}
                                className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-700 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4 group mt-8"
                            >
                                {isAnalyzing ? 'Decoding_Symmetry...' : 'Initialize_Analysis'}
                                {!isAnalyzing && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>

                        {/* Result Area */}
                        <div className="relative min-h-[600px]">
                            <AnimatePresence mode="wait">
                                {!result && !isAnalyzing && (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]"
                                    >
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-8">
                                            <Sparkles size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-4">Awaiting_Neural_Input</h3>
                                        <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                                            Upload your resume and the target JD to see your match score and improvement intelligence.
                                        </p>
                                    </motion.div>
                                )}

                                {isAnalyzing && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/[0.03] border border-blue-500/20 rounded-[3rem] overflow-hidden relative"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.3, 0.6, 0.3]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-blue-600/5"
                                        />
                                        <div className="relative z-10">
                                            <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin mb-8 mx-auto" />
                                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Analyzing_DNA</h3>
                                            <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Running Llama 3.3 70B Engine</p>
                                        </div>
                                    </motion.div>
                                )}

                                {result && !isAnalyzing && (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Score Block */}
                                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center text-center">
                                            <ScoreGauge score={result.score} />
                                            <div className={`mt-8 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${result.jd_alignment === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    result.jd_alignment === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                Alignment: {result.jd_alignment}_Symmetry
                                            </div>
                                        </div>

                                        {/* Matches */}
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                                                <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-emerald-500/10 pb-4">
                                                    <Check size={14} /> Strong_Signals
                                                </div>
                                                <ul className="space-y-3">
                                                    {result.match_reasons.map((r: string, i: number) => (
                                                        <li key={i} className="text-xs font-bold text-gray-300 flex items-start gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                            {r}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                                                <div className="flex items-center gap-3 text-rose-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-rose-500/10 pb-4">
                                                    <AlertCircle size={14} /> Missing_Nodes
                                                </div>
                                                <ul className="space-y-3">
                                                    {result.missing_keywords.map((k: string, i: number) => (
                                                        <li key={i} className="text-xs font-bold text-gray-300 flex items-start gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                                                            {k}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8">
                                            <div className="flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-blue-500/10 pb-4">
                                                <Lightbulb size={14} /> Optimization_Roadmap
                                            </div>
                                            <div className="space-y-4">
                                                {result.improvement_tips.map((tip: string, i: number) => (
                                                    <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                        <div className="text-blue-500 font-black text-sm">0{i + 1}</div>
                                                        <p className="text-xs font-bold text-gray-200 leading-relaxed">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
