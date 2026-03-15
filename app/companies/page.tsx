'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Breadcrumbs from '@/components/Breadcrumbs';
import CompanyCard from '@/components/CompanyCard';

const DREAM_50 = [
  'Celebal Technologies', 'FreeCharge', 'Provakil', 'ShodhAI', 'Unicommerce',
  'Nagarro Software', 'TITAN.email', 'Treebo Hotels', 'Spring Financial',
  'APMSE (Eagleview)', 'ZS Associates', 'DEShaw', 'EPAM', 'ProcDNA',
  'Media.net', 'Triology', 'E2E Networks', 'Tekion', 'Signzy',
  'Whatfix (Quiko)', 'Eatclub', 'MakeMyTrip', 'Sprinklr', 'Addverb Technologies',
  'Triumph Motorcycles', 'Bajaj Finserv Health Limited', 'BNY Mellon', 'Deloitte',
  'OneBanc', 'Curiflow', 'Aperam', 'AMD', 'GoDaddy', 'HSBC', 'Samsung Noida',
  'Josh Technology Group', 'Park+ (Parviom Technologies)', 'Eucloid', 'ION',
  'rtCamp', 'Honda Cars'
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<'all' | 'dream50'>('dream50');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    setCompanies(data || []);
    setLoading(false);
  };

  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = ['All', ...new Set(companies.map(c => c.industry).filter(Boolean))];

  const filteredCompanies = companies.filter((company) => {
    const isDream50 = DREAM_50.includes(company.name);

    // Segment filtering
    if (activeSegment === 'dream50' && !isDream50) return false;
    if (activeSegment === 'all' && isDream50) return false;

    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-600" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Companies' }]} className="mb-8" />

        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-4 uppercase tracking-tighter">
            Target <span className="text-transparent bg-clip-text bg-brand-gradient">Companies</span>
          </h1>

          <div className="flex gap-4 mb-8 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl w-fit">
            <button
              onClick={() => setActiveSegment('dream50')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSegment === 'dream50'
                  ? 'bg-[var(--brand-primary)] text-white shadow-lg'
                  : 'text-[var(--text-muted)] hover:text-white'
                }`}
            >
              Dream_50_Strike_Force
            </button>
            <button
              onClick={() => setActiveSegment('all')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSegment === 'all'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-[var(--text-muted)] hover:text-white'
                }`}
            >
              General_Tactical_Index
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-lg font-medium max-w-2xl">
            {activeSegment === 'dream50'
              ? "Exclusively curated high-priority targets. These companies represent the vanguard of engineering excellence."
              : "Comprehensive database of strategic assets across the global technology landscape."
            }
          </p>
        </div>

        <div className="mb-12 space-y-8">
          <div className="relative max-w-xl">
            <MagnifyingGlassIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by company name, industry, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-5 bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 outline-none transition-all shadow-xl"
              aria-label="Search companies"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {industries.map((industry: any) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedIndustry === industry
                  ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--text-accent)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="glass-card text-center py-20">
            <BuildingOfficeIcon className="w-20 h-20 text-[var(--text-muted)] mx-auto mb-6 opacity-20" aria-hidden />
            <p className="text-[var(--text-secondary)] font-bold text-xl uppercase tracking-tighter">
              No tactical data found for &quot;{searchTerm}&quot;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

        <div className="mt-12 py-6 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Displaying <span className="text-[var(--brand-primary)]">{filteredCompanies.length}</span> of{' '}
            {companies.length} Tier-1 Strategic Assets
          </p>
        </div>
      </div>
    </div>
  );
}

