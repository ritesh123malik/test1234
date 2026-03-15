import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui-store';

export function useScrollHeader() {
    const setHeaderScrolled = useUIStore((state) => state.setHeaderScrolled);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setHeaderScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [setHeaderScrolled]);
}
