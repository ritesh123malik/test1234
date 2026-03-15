import { useState, useMemo, useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';
import { supabase } from '@/lib/supabase';

export function useSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const isSearchOpen = useUIStore((state) => state.isSearchOpen);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('placement-intel-recent-searches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const saveRecentSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('placement-intel-recent-searches', JSON.stringify(updated));
    };

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('id, name, slug, logo_url, avg_package')
                    .ilike('name', `%${query}%`)
                    .limit(5);

                if (!error && data) {
                    setResults(data);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return {
        query,
        setQuery,
        results,
        isLoading,
        recentSearches,
        saveRecentSearch
    };
}
