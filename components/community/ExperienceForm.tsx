'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  X, 
  Send, 
  Ghost,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface ExperienceFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    content: '',
    difficulty: 'Medium',
    outcome: 'Pending',
    year: new Date().getFullYear(),
    is_anonymous: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit');
      
      toast.success('Experience shared! Awaiting moderation.');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full mx-auto">
      <div className="p-6 border-b border-border/50 bg-surface2/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-syne">Share Mission Report</h2>
          <p className="text-xs text-muted font-bold tracking-widest uppercase mt-1">Interview Intelligence Contribution</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-surface3 rounded-lg text-muted">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Target Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                required
                type="text" 
                placeholder="Google, Atlassian..."
                className="w-full pl-10 pr-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Role Applied</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                required
                type="text" 
                placeholder="SDE-1, Intern..."
                className="w-full pl-10 pr-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Difficulty</label>
            <select 
              className="w-full px-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm appearance-none"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Outcome</label>
            <select 
              className="w-full px-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm appearance-none"
              value={formData.outcome}
              onChange={(e) => setFormData({...formData, outcome: e.target.value})}
            >
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Offered">Offered</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Year</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-2 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted">Experience Details (Rounds, Questions, Advice)</label>
          <textarea 
            required
            rows={4}
            placeholder="Share your journey... What was the OA like? Which DSA topics were focused? How was the system design round?"
            className="w-full px-4 py-3 bg-surface2 border border-border rounded-xl focus:border-accent outline-none transition-all text-sm resize-none"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-3">
            <Ghost className="w-5 h-5 text-accent" />
            <div>
              <div className="text-sm font-bold">Post Anonymously</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Hide your profile from public view</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setFormData({...formData, is_anonymous: !formData.is_anonymous})}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.is_anonymous ? 'bg-accent' : 'bg-surface3'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_anonymous ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <Info className="w-4 h-4 text-blue-500" />
          <p className="text-[10px] text-muted leading-tight">
            Contributing verified experiences boosts your **Neural Power Score** and unlocks premium "Strike Force" analytical sheets.
          </p>
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-accent to-accent2 text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
        >
          {loading ? 'Transmitting Data...' : (
            <>
              <Send className="w-4 h-4" />
              Transmit Intelligence
            </>
          )}
        </button>
      </form>
    </div>
  );
};
