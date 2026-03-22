import Link from 'next/link';
import { AuthBackground } from '@/components/auth/AuthBackground';

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden bg-bg-base">
      <AuthBackground />
      
      <div className="relative z-10 text-center">
        <div className="w-24 h-24 bg-brand-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-brand-primary/20 mb-8 mx-auto rotate-3">
          <div className="w-full h-full bg-bg-base rounded-[22px] flex items-center justify-center overflow-hidden">
            <span className="text-4xl font-black text-brand-primary">404</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black tracking-tight text-text-primary mb-3">Protocol Interrupted.</h2>
        <p className="text-text-muted font-medium mb-10 max-w-xs mx-auto">
          The requested data node does not exist or has been relocated within the intelligence network.
        </p>
        
        <Link 
          href="/dashboard" 
          className="px-8 py-4 bg-text-primary text-bg-base font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-bg-surface/20 active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
