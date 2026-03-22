'use client';
import { useState, useEffect } from 'react';

interface Props {
    currentCollege: string;
    currentCity: string;
    currentCgpa?: number;
    onSave: (college: string, city: string, cgpa: number) => Promise<void>;
}

export default function CollegeCitySetup({ currentCollege, currentCity, currentCgpa, onSave }: Props) {
    const [college, setCollege] = useState(currentCollege ?? '');
    const [city, setCity] = useState(currentCity ?? '');
    const [cgpa, setCgpa] = useState(currentCgpa ?? 0);
    const [collegeResults, setCollegeResults] = useState([]);
    const [cityResults, setCityResults] = useState([]);
    const [saving, setSaving] = useState(false);

    // ... (useEffect for college/city search stays same)
    
    // Debounced college search
    useEffect(() => {
        if (college.length < 2) { setCollegeResults([]); return; }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/leaderboard?action=search_colleges&q=${college}`);
            const { results } = await res.json();
            setCollegeResults(results ?? []);
        }, 300);
        return () => clearTimeout(t);
    }, [college]);

    // Debounced city search
    useEffect(() => {
        if (city.length < 2) { setCityResults([]); return; }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/leaderboard?action=search_cities&q=${city}`);
            const { results } = await res.json();
            setCityResults(results ?? []);
        }, 300);
        return () => clearTimeout(t);
    }, [city]);

    const handleSave = async () => {
        setSaving(true);
        await onSave(college, city, cgpa);
        setSaving(false);
    };

    return (
        <div className='bg-gray-900 rounded-3xl border border-gray-800 p-8 space-y-6 shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full" />

            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <span className="text-xl">📍</span>
                </div>
                <div>
                    <h3 className='text-white font-black text-xl tracking-tight'>Arena Identity</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Compete in local and college brackets</p>
                </div>
            </div>

            {/* College input */}
            <div className='relative'>
                <label className='text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block'>Target Institution</label>
                <div className="relative group">
                    <input
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                        placeholder='e.g. IIT Bombay'
                        className='w-full bg-gray-800/50 text-white rounded-2xl px-5 py-4 text-sm font-bold
                border border-gray-700/50 outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600'
                    />
                </div>
                {collegeResults.length > 0 && (
                    <div className='absolute top-full left-0 right-0 mt-3 bg-gray-900/95 backdrop-blur-xl
            border border-gray-800 rounded-2xl z-[100] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 p-1'>
                        {collegeResults.map((c: any) => (
                            <button key={c.name} onClick={() => { setCollege(c.name); setCollegeResults([]); }}
                                className='w-full text-left px-4 py-3 text-sm text-gray-300 font-bold hover:bg-blue-600 hover:text-white rounded-xl flex justify-between items-center transition-all group'>
                                <span>{c.name}</span>
                                <span className='text-[10px] opacity-50 group-hover:opacity-100 uppercase tracking-tighter'>{c.city}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* City input */}
            <div className='relative'>
                <label className='text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block'>Current Base / City</label>
                <div className="relative group">
                    <input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder='e.g. Mumbai'
                        className='w-full bg-gray-800/50 text-white rounded-2xl px-5 py-4 text-sm font-bold
                border border-gray-700/50 outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600'
                    />
                </div>
                {cityResults.length > 0 && (
                    <div className='absolute top-full left-0 right-0 mt-3 bg-gray-900/95 backdrop-blur-xl
            border border-gray-800 rounded-2xl z-[100] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 p-1'>
                        {cityResults.map((c: any) => (
                            <button key={c.name} onClick={() => { setCity(c.name); setCityResults([]); }}
                                className='w-full text-left px-4 py-3 text-sm text-gray-300 font-bold hover:bg-blue-600 hover:text-white rounded-xl flex justify-between items-center transition-all group'>
                                <span>{c.name}</span>
                                <span className='text-[10px] opacity-50 group-hover:opacity-100 uppercase tracking-tighter'>{c.state}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* CGPA Slider */}
            <div className="space-y-3">
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 block">CGPA / GPA (0 – 10)</label>
                <div className="flex items-center gap-6">
                    <input
                        type="range" min="0" max="10" step="0.1"
                        value={cgpa}
                        onChange={e => setCgpa(parseFloat(e.target.value))}
                        className="flex-1 accent-blue-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-blue-400 font-mono font-bold w-12 text-right text-lg">
                        {cgpa.toFixed(1)}
                    </span>
                </div>
            </div>

            <button onClick={handleSave} disabled={saving}
                className='w-full py-4 bg-blue-600 hover:bg-blue-500 text-white
          font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 mt-2'>
                {saving ? 'Synchronizing...' : 'Update Records'}
            </button>
        </div>
    );
}
