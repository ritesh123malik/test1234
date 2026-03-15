import { MessagesSquare, Star, Plus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
    return (
        <div className="min-h-screen bg-bg-base py-12">
            <div className="max-w-container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="section-label mb-2">Community Intelligence</p>
                        <h1 className="font-display font-bold text-4xl text-text-primary tracking-tight">Interview Reviews</h1>
                        <p className="text-text-muted mt-2 max-w-xl">
                            Read real interview experiences from students who recently interviewed at top companies. Verified and anonymous.
                        </p>
                    </div>

                    <button className="btn-primary w-fit flex items-center gap-2">
                        <Plus size={16} /> Share Your Experience
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-card p-6 flex flex-col h-full hover:border-brand-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                                        {['G', 'M', 'A', 'N', 'T', 'S'][i - 1]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                                            {['Google', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Stripe'][i - 1]}
                                        </p>
                                        <p className="text-[9px] text-text-muted font-bold">L4 Software Engineer • 3 days ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                </div>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-4 italic">
                                "{[
                                    "The technical rounds were heavy on System Design and LLD. They asked about designing a global rate limiter...",
                                    "Behavioral questions were based on the STAR method. Make sure you have at least 5 strong stories ready.",
                                    "Very intense DSA round. Focus on Graphs and Trees. I was asked a variation of the Red-Black tree problem.",
                                    "The recruiter was very helpful. The culture round was the most important part of the entire process for me.",
                                    "Standard DSA questions but with a twist. They really care about the time and space complexity trade-offs.",
                                    "Fast-paced environment. They expected high-quality code even in the initial screening round."
                                ][i - 1]}"
                            </p>

                            <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-success">
                                    <ShieldCheck size={12} /> Verified Offer
                                </span>
                                <Link href="/review" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">
                                    Read More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
