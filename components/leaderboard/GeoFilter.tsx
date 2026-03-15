'use client';
import { useState, useEffect, useRef } from 'react';

interface FilterOption { name: string; count: number; }

interface Props {
    type: 'college' | 'city';
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder: string;
}

export default function GeoFilter({ type, value, onChange, options, placeholder }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 20);

    return (
        <div ref={ref} className='relative'>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-bold
          transition-all duration-300 group ${value
                        ? 'bg-blue-600/10 border-blue-600/50 text-blue-400'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
                    }`}
            >
                <span className="truncate max-w-[150px]">{value || placeholder}</span>
                {value && (
                    <div onClick={e => { e.stopPropagation(); onChange(''); }}
                        className='w-5 h-5 flex items-center justify-center rounded-full bg-blue-600/20 hover:bg-rose-500/20 text-blue-400 hover:text-rose-500 transition-colors ml-1'>
                        <span className="text-[10px]">✕</span>
                    </div>
                )}
                <span className={`text-[10px] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {open && (
                <div className='absolute top-full left-0 mt-3 w-80 bg-gray-900 border
          border-gray-800 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in zoom-in duration-200'>
                    <div className='p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl'>
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${type}...`}
                            className='w-full bg-gray-800/50 text-white text-sm px-4 py-3 rounded-xl
                outline-none border border-gray-700/50 focus:border-blue-500/50 placeholder-gray-600'
                        />
                    </div>
                    <div className='max-h-72 overflow-y-auto custom-scrollbar p-2'>
                        {filtered.length === 0 ? (
                            <div className='p-8 text-center'>
                                <span className="text-2xl opacity-50 block mb-2">🔍</span>
                                <p className='text-gray-500 text-xs font-bold uppercase tracking-widest'>No results found</p>
                            </div>
                        ) : filtered.map(opt => (
                            <button
                                key={opt.name}
                                onClick={() => { onChange(opt.name); setOpen(false); setSearch(''); }}
                                className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center
                  rounded-xl hover:bg-gray-800 transition-all group ${value === opt.name ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300'
                                    }`}
                            >
                                <span className="font-bold">{opt.name}</span>
                                <span className='text-[10px] font-black bg-gray-800 group-hover:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-tighter transition-colors'>
                                    {opt.count} Users
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
