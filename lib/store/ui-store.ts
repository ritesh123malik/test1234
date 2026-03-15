import { create } from 'zustand';

interface UIStore {
    isSearchOpen: boolean;
    isMobileMenuOpen: boolean;
    isNotifOpen: boolean;
    isUserMenuOpen: boolean;
    headerScrolled: boolean;

    setSearchOpen: (open: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setNotifOpen: (open: boolean) => void;
    setUserMenuOpen: (open: boolean) => void;
    setHeaderScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isSearchOpen: false,
    isMobileMenuOpen: false,
    isNotifOpen: false,
    isUserMenuOpen: false,
    headerScrolled: false,

    setSearchOpen: (open) => set({ isSearchOpen: open }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    setNotifOpen: (open) => set({ isNotifOpen: open }),
    setUserMenuOpen: (open) => set({ isUserMenuOpen: open }),
    setHeaderScrolled: (scrolled) => set({ headerScrolled: scrolled }),
}));
