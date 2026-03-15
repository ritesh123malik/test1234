'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck, Rocket, ArrowRight } from 'lucide-react';
import { Header as Navbar } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const PLANS = [
    {
        name: "Free",
        price: "₹0",
        description: "Perfect for getting started",
        features: [
            "3 AI interviews/month",
            "2 ATS scans/month",
            "Aptitude practice (10 q/day)",
            "Basic DSA sheets",
            "Global leaderboard"
        ],
        buttonText: "Current Plan",
        premium: false
    },
    {
        name: "Premium",
        price: "₹299",
        description: "Dominate your placements",
        badge: "Most Popular",
        features: [
            "Unlimited AI interviews",
            "Unlimited ATS scans",
            "Full OA Simulator (All companies)",
            "AI Pattern Identifier",
            "Level 3 solution hints",
            "P2P mock interviews",
            "Company-specific AI prep",
            "Recruiter PDF export"
        ],
        buttonText: "Upgrade to Premium",
        premium: true
    }
];

export default function PricingPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/premium/create-order', {
                method: 'POST',
                body: JSON.stringify({ planId: 'monthly_premium' })
            });
            const order = await res.json();

            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "PlacementIntel",
                description: "Premium Subscription",
                order_id: order.id,
                handler: async function (response: any) {
                    const verifyRes = await fetch('/api/premium/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
                    const result = await verifyRes.json();
                    if (result.success) {
                        window.location.href = '/profile?upgraded=true';
                    }
                },
                theme: { color: "#2563eb" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            {/* Added script for Razorpay */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Sparkles size={12} /> Pricing_Infrastructure
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-6"
                        >
                            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Career</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 max-w-2xl mx-auto text-lg"
                        >
                            Simple, transparent pricing. Choose the plan that fits your ambition.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {PLANS.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className={`relative group p-8 sm:p-12 rounded-[3rem] border transition-all duration-500 ${plan.premium
                                    ? 'bg-blue-600/5 border-blue-500/30 hover:border-blue-500 shadow-2xl shadow-blue-500/10'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20">
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">/ month</span>
                                    </div>
                                    <p className="mt-4 text-gray-400 text-sm font-medium">{plan.description}</p>
                                </div>

                                <div className="space-y-4 mb-12">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3">
                                            <div className={`p-1 rounded-full ${plan.premium ? 'text-blue-400' : 'text-gray-600'}`}>
                                                <Check size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={plan.premium ? handleUpgrade : undefined}
                                    disabled={!plan.premium || isLoading}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${plan.premium
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]'
                                        : 'bg-white/5 text-gray-500 cursor-default'
                                        }`}
                                >
                                    {isLoading ? 'Processing...' : plan.buttonText}
                                    {plan.premium && !isLoading && <ArrowRight size={14} />}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                            Secure transactions powered by Razorpay.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
