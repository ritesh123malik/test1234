'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronDown,
    Filter,
    BarChart3,
    TrendingUp,
    Target,
    Zap,
    Briefcase,
    Calendar,
    Users,
    Activity,
    PieChart,
    ArrowUpRight,
    MapPin,
    X,
    CheckCircle2,
    Clock,
    Download
} from 'lucide-react';
import { PLACEMENT_RECORDS, PlacementRecord } from '@/lib/data/placement-data';

/* ═══════════════ UTILS ═══════════════ */
const fmt = (n: number) => n >= 100000 ? '₹' + (n >= 10000000 ? (n / 10000000).toFixed(1) + 'Cr' : n >= 100000 ? (n / 100000).toFixed(1) + 'L' : n) : n > 0 ? '₹' + n.toLocaleString('en-IN') : '—';
const fmtS = (n: number) => n > 0 ? '₹' + n.toLocaleString('en-IN') : null;
const fdate = (s: string) => { const d = new Date(s); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); };
const ctcColor = (c: number) => c >= 2500000 ? 'text-[#ff6584]' : c >= 2000000 ? 'text-[#f7971e]' : c >= 1500000 ? 'text-[#43e97b]' : c >= 1000000 ? 'text-white' : 'text-[#6b6b85]';
const selColor = (n: number) => n >= 10 ? 'text-[#43e97b]' : n >= 5 ? 'text-[#f7971e]' : n >= 1 ? 'text-[#ff6584]' : 'text-[#6b6b85]';

export default function PlacementTracker() {
    const [tab, setTab] = useState<'tracker' | 'insights'>('tracker');
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    /* ═══════════════ FILTERING ═══════════════ */
    const filtered = useMemo(() => {
        let result = PLACEMENT_RECORDS.filter(r => {
            if (searchTerm && !r.company.toLowerCase().includes(searchTerm.toLowerCase()) && !r.roles.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) && !r.branches.join(' ').toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (branchFilter && !r.branches.includes(branchFilter) && branchFilter !== 'All Branches') return false;
            if (typeFilter && r.type !== typeFilter) return false;
            if (activeChips.has('completed') && !activeChips.has('pending') && r.status !== 'Completed') return false;
            if (activeChips.has('pending') && !activeChips.has('completed') && r.status !== 'Pending') return false;
            return true;
        });

        result.sort((a, b) => {
            if (sortOrder === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOrder === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortOrder === 'ctc-desc') return b.ctc - a.ctc;
            if (sortOrder === 'ctc-asc') return a.ctc - b.ctc;
            if (sortOrder === 'selected-desc') return b.selected - a.selected;
            return 0;
        });

        return result;
    }, [searchTerm, branchFilter, typeFilter, sortOrder, activeChips]);

    const toggleChip = (id: string) => {
        const next = new Set(activeChips);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setActiveChips(next);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setBranchFilter('');
        setTypeFilter('');
        setSortOrder('date-desc');
        setActiveChips(new Set());
    };

    /* ═══════════════ ANALYTICS LOGIC ═══════════════ */
    const stats = useMemo(() => {
        const allCTC = PLACEMENT_RECORDS.filter(r => r.ctc > 0).map(r => r.ctc);
        const allFixed = PLACEMENT_RECORDS.filter(r => r.fixed > 0).map(r => r.fixed);
        const allStipend = PLACEMENT_RECORDS.filter(r => r.stipend > 0).map(r => r.stipend);
        const totalSel = PLACEMENT_RECORDS.reduce((a, r) => a + r.selected, 0);
        const avgCTC = Math.round(allCTC.reduce((a, b) => a + b, 0) / allCTC.length);
        const avgFixed = Math.round(allFixed.reduce((a, b) => a + b, 0) / allFixed.length);
        const avgStip = Math.round(allStipend.reduce((a, b) => a + b, 0) / allStipend.length);
        const sortedCTC = [...allCTC].sort((a, b) => a - b);
        const medianCTC = sortedCTC[Math.floor(sortedCTC.length / 2)];

        return { totalSel, avgCTC, avgFixed, avgStip, medianCTC };
    }, []);

    const insights = useMemo(() => {
        // By selected
        const bySel = [...PLACEMENT_RECORDS].filter(r => r.selected > 0).sort((a, b) => b.selected - a.selected).slice(0, 10);
        // By type
        const typeMap: Record<string, number> = {};
        PLACEMENT_RECORDS.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
        // CTC buckets
        const buckets = { '< 7L': 0, '7–10L': 0, '10–15L': 0, '15–20L': 0, '20L+': 0 };
        PLACEMENT_RECORDS.filter(r => r.ctc > 0).forEach(r => {
            if (r.ctc < 700000) buckets['< 7L']++;
            else if (r.ctc < 1000000) buckets['7–10L']++;
            else if (r.ctc < 1500000) buckets['10–15L']++;
            else if (r.ctc < 2000000) buckets['15–20L']++;
            else buckets['20L+']++;
        });
        // Scatter: CGPA vs CTC
        const scatData = PLACEMENT_RECORDS.filter(r => r.cgpa > 0 && r.ctc > 0);
        const maxCTC = Math.max(...scatData.map(r => r.ctc));
        // Timeline
        const recent = [...PLACEMENT_RECORDS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12);

        return { bySel, typeMap, buckets, scatData, maxCTC, recent };
    }, []);

    return (
        <div className="space-y-12">
            {/* Header controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setTab('tracker')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'tracker' ? 'bg-[#6c63ff] text-white shadow-lg' : 'text-[#6b6b85] hover:text-white'}`}
                    >
                        Sector Tracker
                    </button>
                    <button
                        onClick={() => setTab('insights')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'insights' ? 'bg-[#6c63ff] text-white shadow-lg' : 'text-[#6b6b85] hover:text-white'}`}
                    >
                        Salary Insights
                    </button>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-[#43e97b]/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-[#43e97b] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#43e97b]">Live_Placement_Cycle_2026</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'tracker' ? (
                    <motion.div
                        key="tracker"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Stats Hero */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Total Companies', value: PLACEMENT_RECORDS.length, sub: `${PLACEMENT_RECORDS.filter(r => r.status === 'Completed').length} Completed`, icon: Briefcase, color: 'text-[#6c63ff]' },
                                { label: 'Students Selected', value: `${stats.totalSel} / 490`, sub: `${((stats.totalSel / 490) * 100).toFixed(1)}% Rate`, icon: Users, color: 'text-[#43e97b]' },
                                { label: 'Average CTC', value: fmt(stats.avgCTC), sub: `Across all offers`, icon: TrendingUp, color: 'text-[#f7971e]' },
                                { label: 'Median CTC', value: fmt(stats.medianCTC), sub: `Avg Fixed: ${fmt(stats.avgFixed)}`, icon: Activity, color: 'text-white' },
                                { label: 'Avg Stipend', value: stats.avgStip > 0 ? fmtS(stats.avgStip) : '—', sub: `Monthly average`, icon: Zap, color: 'text-[#6c63ff]' }
                            ].map((s, i) => (
                                <div key={i} className="bg-[#111118] border border-[#252538] p-6 rounded-2xl relative overflow-hidden group hover:border-[#6c63ff] transition-all">
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6c63ff] to-[#ff6584] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-[#6b6b85] mb-2">{s.label}</p>
                                    <h3 className={`text-2xl font-black tracking-tighter mb-1 ${s.color}`}>{s.value}</h3>
                                    <p className="text-[9px] text-[#6b6b85] font-bold">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4 bg-[#111118] border border-[#252538] p-4 rounded-xl">
                            <div className="flex-1 min-w-[300px] flex items-center gap-3 bg-[#171726] border border-[#252538] rounded-lg px-4 focus-within:border-[#6c63ff] transition-all">
                                <Search size={16} className="text-[#6b6b85]" />
                                <input
                                    type="text"
                                    placeholder="Search company, role, branch…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none py-3 text-sm text-white placeholder-[#6b6b85] w-full"
                                />
                            </div>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="bg-[#171726] border border-[#252538] rounded-lg px-4 py-3 text-[11px] font-black uppercase outline-none cursor-pointer hover:border-[#6c63ff] transition-all"
                            >
                                <option value="">All Branches</option>
                                <option>CSE</option><option>CCE</option><option>ECE</option><option>Mech</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-[#171726] border border-[#252538] rounded-lg px-4 py-3 text-[11px] font-black uppercase outline-none cursor-pointer hover:border-[#6c63ff] transition-all"
                            >
                                <option value="">All Types</option>
                                <option>SLI + FTE</option><option>FTE</option><option>SLI</option><option>Intern</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-[#171726] border border-[#252538] rounded-lg px-4 py-3 text-[11px] font-black uppercase outline-none cursor-pointer hover:border-[#6c63ff] transition-all"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="ctc-desc">Highest CTC</option>
                                <option value="ctc-asc">Lowest CTC</option>
                                <option value="selected-desc">Most Selected</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleChip('completed')}
                                    className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${activeChips.has('completed') ? 'bg-[#43e97b]/10 border-[#43e97b] text-[#43e97b]' : 'bg-[#171726] border-[#252538] text-[#6b6b85]'}`}
                                >
                                    ✓ Completed
                                </button>
                                <button
                                    onClick={() => toggleChip('pending')}
                                    className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${activeChips.has('pending') ? 'bg-[#f7971e]/10 border-[#f7971e] text-[#f7971e]' : 'bg-[#171726] border-[#252538] text-[#6b6b85]'}`}
                                >
                                    ⏳ Pending
                                </button>
                            </div>
                            <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85] hover:text-white underline underline-offset-4 decoration-white/20">Clear all</button>
                            <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">
                                {filtered.length} Companies Identified
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-[#111118] border border-[#252538] rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-[40px_100px_1fr_100px_100px_140px_80px_100px_40px] gap-4 p-4 bg-[#171726] border-b border-[#252538] text-[9px] font-black uppercase tracking-widest text-[#6b6b85]">
                                <div className="text-center">#</div>
                                <div>Date</div>
                                <div>Company / Domain</div>
                                <div>Type</div>
                                <div className="text-center">CGPA</div>
                                <div>Compensation</div>
                                <div className="text-center">Selected</div>
                                <div className="text-center">Status</div>
                                <div></div>
                            </div>
                            <div className="divide-y divide-[#252538]">
                                {filtered.map((r, i) => (
                                    <React.Fragment key={r.id}>
                                        <div
                                            onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}
                                            className={`grid grid-cols-[40px_100px_1fr_100px_100px_140px_80px_100px_40px] gap-4 p-5 hover:bg-white/[0.03] transition-all cursor-pointer items-center ${expandedRow === r.id ? 'bg-[#6c63ff]/5' : ''}`}
                                        >
                                            <div className="text-center text-[10px] font-bold text-[#6b6b85]">{i + 1}</div>
                                            <div className="text-[11px] text-[#6b6b85] font-bold">{fdate(r.date)}</div>
                                            <div>
                                                <div className="text-sm font-black text-white uppercase tracking-tight">{r.company}</div>
                                                <div className="text-[10px] text-[#6b6b85] font-bold uppercase tracking-widest">{r.branches.length ? r.branches.join(', ') : 'Open Recipient'}</div>
                                            </div>
                                            <div>
                                                <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] font-black text-[#6b6b85]">{r.type}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="px-2 py-1 bg-[#1e1e30] border border-[#252538] rounded text-[10px] font-bold text-white">{r.cgpa > 0 ? r.cgpa + '+' : 'Open'}</span>
                                            </div>
                                            <div>
                                                <div className={`text-[12px] font-black ${ctcColor(r.ctc)}`}>{r.ctc > 0 ? fmt(r.ctc) : 'Stipend Only'}</div>
                                                {r.fixed > 0 && <div className="text-[10px] text-[#6b6b85] font-bold">Fixed: {fmt(r.fixed)}</div>}
                                                {r.stipend > 0 && <div className="text-[9px] text-[#43e97b] font-bold">+{fmtS(r.stipend)}/mo Stipend</div>}
                                            </div>
                                            <div className="text-center">
                                                <span className={`text-lg font-black ${selColor(r.selected)}`}>{r.selected}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'Completed' ? 'bg-[#43e97b]/10 text-[#43e97b] border border-[#43e97b]/30' : 'bg-[#f7971e]/10 text-[#f7971e] border border-[#f7971e]/30'}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center text-[#6b6b85]">
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${expandedRow === r.id ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {expandedRow === r.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-[#6c63ff]/[0.02]"
                                                >
                                                    <div className="p-10 pl-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-[#252538]">
                                                        <div className="space-y-6">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">Compensation Breakdown</div>
                                                            <div className="space-y-2">
                                                                {r.ctc > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">Total CTC</span><span className={ctcColor(r.ctc)}>{fmt(r.ctc)}</span></div>}
                                                                {r.fixed > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">Fixed</span><span className="text-white">{fmt(r.fixed)}</span></div>}
                                                                {r.stipend > 0 && <div className="flex justify-between py-2 text-[11px] font-bold"><span className="text-[#6b6b85]">Monthly Stipend</span><span className="text-[#43e97b]">{fmtS(r.stipend)}</span></div>}
                                                                {r.variable > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">Variable</span><span className="text-white">{fmt(r.variable)}</span></div>}
                                                                {r.esops > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">ESOPs</span><span className="text-white">{fmt(r.esops)}</span></div>}
                                                                {r.rsus && r.rsus > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">RSUs</span><span className="text-white">{fmt(r.rsus)}</span></div>}
                                                                {r.joining && r.joining > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">Joining Bonus</span><span className="text-white">{fmt(r.joining)}</span></div>}
                                                                {r.lti && r.lti > 0 && <div className="flex justify-between py-2 border-b border-[#252538] text-[11px] font-bold"><span className="text-[#6b6b85]">LTI</span><span className="text-white">{fmt(r.lti)}</span></div>}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">Operational Roles & Scope</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {r.roles.map((ro, ri) => <span key={ri} className="px-3 py-1 bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded text-[10px] font-black text-[#6c63ff] uppercase">{ro}</span>)}
                                                            </div>
                                                            <div className="space-y-2 pt-4">
                                                                <div className="text-[9px] font-black uppercase text-[#6b6b85]">Min Eligibility Cutoff</div>
                                                                <div className="text-sm font-black text-white">{r.cgpa > 0 ? r.cgpa + ' CGPA & Above' : 'No Critical Cutoff Identified'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">Sector Drive Analytics</div>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between text-[11px] font-bold"><span className="text-[#6b6b85]">Deployment Date</span><span className="text-white">{fdate(r.date)}</span></div>
                                                                <div className="flex justify-between text-[11px] font-bold"><span className="text-[#6b6b85]">Tactical Status</span><span className={r.status === 'Completed' ? 'text-[#43e97b]' : 'text-[#f7971e]'}>{r.status}</span></div>
                                                                <div className="flex justify-between text-[11px] font-bold"><span className="text-[#6b6b85]">Successful Extractions</span><span className="text-white">{r.selected} Assets</span></div>
                                                            </div>
                                                            <button className="w-full mt-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                                <Download size={12} />
                                                                Export Drive Report
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Top CTC */}
                        <div className="bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <Trophy className="text-[#ff6584]" size={20} />
                                Elite CTC Rankings
                            </h3>
                            <div className="space-y-4">
                                {PLACEMENT_RECORDS.filter(r => r.ctc > 0).sort((a, b) => b.ctc - a.ctc).slice(0, 8).map((r, i) => (
                                    <div key={i} className="flex items-center gap-4 py-3 border-b border-[#252538] last:border-none">
                                        <div className="text-[11px] font-black text-[#6b6b85] w-6">#{i + 1}</div>
                                        <div className="flex-1 font-syne font-bold uppercase text-sm text-white">{r.company}</div>
                                        <div className={`text-sm font-black ${ctcColor(r.ctc)}`}>{fmt(r.ctc)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Hiring */}
                        <div className="bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <Users className="text-[#6c63ff]" size={20} />
                                Mass Hiring Leaders
                            </h3>
                            <div className="space-y-6">
                                {insights.bySel.map((r, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                            <span className="text-white">{r.company}</span>
                                            <span className="text-[#6b6b85]">{r.selected} Sels</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(r.selected / insights.bySel[0].selected) * 100}%` }}
                                                className="h-full bg-[#6c63ff]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Drive Types */}
                        <div className="bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <PieChart className="text-[#43e97b]" size={20} />
                                Drive Archetype Mix
                            </h3>
                            <div className="flex items-center gap-8">
                                <div className="relative w-32 h-32 flex-shrink-0">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const typeTotal = Object.values(insights.typeMap).reduce((a, b) => a + b, 0);
                                            let cumul = 0;
                                            return Object.entries(insights.typeMap).map(([k, v], i) => {
                                                const pct = v / typeTotal;
                                                const stroke = 2 * Math.PI * 40;
                                                const dash = pct * stroke;
                                                const offset = -(cumul / typeTotal) * stroke;
                                                cumul += v;
                                                const colors = ['#6c63ff', '#ff6584', '#43e97b', '#f7971e'];
                                                return (
                                                    <circle
                                                        key={k}
                                                        cx="50" cy="50" r="40"
                                                        fill="transparent"
                                                        stroke={colors[i % 4]}
                                                        strokeWidth="12"
                                                        strokeDasharray={`${dash} ${stroke - dash}`}
                                                        strokeDashoffset={offset}
                                                        opacity="0.8"
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                </div>
                                <div className="space-y-3 flex-1">
                                    {Object.entries(insights.typeMap).map(([k, v], i) => (
                                        <div key={k} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6c63ff', '#ff6584', '#43e97b', '#f7971e'][i % 4] }} />
                                            <span className="flex-1">{k}</span>
                                            <span className="text-white">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTC Distribution */}
                        <div className="lg:col-span-2 bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <BarChart3 className="text-[#f7971e]" size={20} />
                                Compensation Density (CTC Bands)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    {Object.entries(insights.buckets).map(([k, v]) => (
                                        <div key={k} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-[#6b6b85]">{k} PACKAGE</span>
                                                <span className="text-white">{v} Drives</span>
                                            </div>
                                            <div className="h-4 bg-white/5 rounded-lg overflow-hidden flex">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(v / Math.max(...Object.values(insights.buckets))) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-[#f7971e] to-[#ff6584]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#171726] border border-[#252538] rounded-2xl p-8 flex flex-col justify-center gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Activity size={100} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">Sector Median</p>
                                        <h4 className="text-4xl font-black text-white tracking-tighter">{fmt(stats.medianCTC)}</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b85]">Avg Deployment Value</p>
                                        <h4 className="text-4xl font-black text-[#43e97b] tracking-tighter">{fmt(stats.avgCTC)}</h4>
                                    </div>
                                    <div className="pt-4 border-t border-[#252538]">
                                        <p className="text-[10px] font-bold text-[#6b6b85] leading-relaxed">
                                            Deployment density is highest in the <span className="text-white">7–15L</span> range, with strategic peaks in Fintech and core tech domains.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CGPA vs CTC */}
                        <div className="bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <Target className="text-[#6c63ff]" size={20} />
                                Benchmarking: CGPA vs CTC
                            </h3>
                            <div className="relative h-64 bg-[#0a0a0f] border border-[#252538] rounded-xl overflow-hidden p-4">
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-black text-[#6b6b85] uppercase tracking-widest">
                                    <span>CGPA 4.0</span>
                                    <span>CGPA 10.0</span>
                                </div>
                                <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-[8px] font-black text-[#6b6b85] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                                    <span>MAX CTC</span>
                                    <span>MIN CTC</span>
                                </div>
                                {insights.scatData.map(r => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 2, zIndex: 10 }}
                                        className="absolute w-2 h-2 rounded-full bg-[#6c63ff] cursor-pointer"
                                        style={{
                                            left: `${((r.cgpa - 4.5) / 5.5) * 90 + 5}%`,
                                            top: `${95 - ((r.ctc / insights.maxCTC) * 88 + 2)}%`
                                        }}
                                        title={`${r.company}: ${fmt(r.ctc)}`}
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] text-[#6b6b85] font-bold leading-relaxed">
                                Data shows strong correlation between CGPA {'>'} 7.0 and high-CTC extractions, though outliers exist in niche tech sectors.
                            </p>
                        </div>

                        {/* Recent Timeline */}
                        <div className="lg:col-span-3 bg-[#111118] border border-[#252538] rounded-2xl p-8 space-y-8">
                            <h3 className="font-syne font-black text-white uppercase tracking-tight text-lg flex items-center gap-3">
                                <Calendar className="text-[#6c63ff]" size={20} />
                                Strategic Deployment Timeline
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {insights.recent.map(r => (
                                    <div key={r.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex gap-4 items-start">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'Pending' ? 'bg-[#f7971e] animate-pulse' : 'bg-[#43e97b]'}`} />
                                        <div className="space-y-2 flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black uppercase text-[#6b6b85]">{fdate(r.date)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${r.status === 'Completed' ? 'border-[#43e97b]/30 text-[#43e97b]' : 'border-[#f7971e]/30 text-[#f7971e]'}`}>{r.status}</span>
                                            </div>
                                            <div className="text-sm font-black text-white uppercase tracking-tight">{r.company}</div>
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-[#6b6b85]">{r.roles[0]}</span>
                                                <span className={ctcColor(r.ctc)}>{r.ctc > 0 ? fmt(r.ctc) : fmtS(r.stipend)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .font-syne { font-family: var(--font-syne), sans-serif; }
            `}</style>
        </div>
    );
}

const Trophy = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);
