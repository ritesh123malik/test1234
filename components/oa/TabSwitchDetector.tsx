'use client';

import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface TabSwitchDetectorProps {
    onSwitch: () => void;
    maxSwithes?: number;
    currentSwitches: number;
}

export default function TabSwitchDetector({ onSwitch, maxSwithes = 3, currentSwitches }: TabSwitchDetectorProps) {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                onSwitch();
                toast.warning('Tab Switch Detected!', {
                    description: `Warning ${currentSwitches + 1}/${maxSwithes}. Further switches may result in auto-submission.`,
                    duration: 5000,
                });
            }
        };

        const handleBlur = () => {
            // Optional: detect when window loses focus (but still visible, e.g. clicking another window)
            // onSwitch();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [onSwitch, currentSwitches, maxSwithes]);

    return null; // Invisible component
}
