// components/applications/KanbanBoard.tsx
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import {
    PlusIcon,
    BookmarkIcon,
    PaperAirplaneIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    TrophyIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface Application {
    id: string;
    company: string;
    position: string;
    location: string;
    application_status: string;
    applied_date: string;
    oa_deadline?: string;
    interview_date?: string;
    job_url?: string;
    notes?: string;
}

interface KanbanBoardProps {
    userId: string;
}

const columns = [
    { id: 'bookmarked', title: '📌 Bookmarked', icon: BookmarkIcon, color: 'gray' },
    { id: 'applied', title: '📨 Applied', icon: PaperAirplaneIcon, color: 'blue' },
    { id: 'oa_received', title: '📝 OA Received', icon: DocumentTextIcon, color: 'yellow' },
    { id: 'oa_completed', title: '✅ OA Completed', icon: DocumentTextIcon, color: 'green' },
    { id: 'interview_scheduled', title: '🤝 Interview', icon: ChatBubbleLeftRightIcon, color: 'purple' },
    { id: 'interview_completed', title: '🎯 Interview Done', icon: ChatBubbleLeftRightIcon, color: 'indigo' },
    { id: 'offer', title: '🎉 Offer', icon: TrophyIcon, color: 'green' },
    { id: 'rejected', title: '❌ Rejected', icon: XCircleIcon, color: 'red' }
];

export default function KanbanBoard({ userId }: KanbanBoardProps) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadApplications();
    }, [userId]);

    const loadApplications = async () => {
        const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (data) {
            setApplications(data);
        }
        setLoading(false);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId) return;

        // Update application status
        const { error } = await supabase
            .from('job_applications')
            .update({
                application_status: destination.droppableId,
                updated_at: new Date().toISOString()
            })
            .eq('id', draggableId);

        if (!error) {
            // Add activity log
            await supabase
                .from('application_activities')
                .insert({
                    application_id: draggableId,
                    activity_type: 'status_change',
                    description: `Moved from ${source.droppableId} to ${destination.droppableId}`
                });

            loadApplications();
        }
    };

    const deleteApplication = async (id: string) => {
        if (confirm('Are you sure you want to delete this application?')) {
            await supabase
                .from('job_applications')
                .delete()
                .eq('id', id);
            loadApplications();
        }
    };

    const getColumnApplications = (columnId: string) => {
        return applications
            .filter(app => app.application_status === columnId)
            .filter(app =>
                app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.position.toLowerCase().includes(searchTerm.toLowerCase())
            );
    };

    const columnIconColor: Record<string, string> = {
        bookmarked: 'text-gray-600',
        applied: 'text-primary-600',
        oa_received: 'text-amber-600',
        oa_completed: 'text-emerald-600',
        interview_scheduled: 'text-purple-600',
        interview_completed: 'text-indigo-600',
        offer: 'text-emerald-600',
        rejected: 'text-red-600',
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600" role="status" aria-label="Loading" />
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Application Tracker</h2>
                    <div className="relative group">
                        <input
                            type="search"
                            placeholder="Search companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl w-80 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all outline-none"
                            aria-label="Search applications"
                        />
                        <BookmarkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                    <PlusIcon className="w-5 h-5" aria-hidden />
                    Add Application
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                    {columns.map((column) => {
                        const columnApps = getColumnApplications(column.id);
                        const Icon = column.icon;

                        return (
                            <div key={column.id} className="flex-shrink-0 w-85">
                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-5 h-full min-h-[400px] flex flex-col"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] ${columnIconColor[column.id] || 'text-[var(--text-muted)]'}`}>
                                                        <Icon className="w-5 h-5" aria-hidden />
                                                    </div>
                                                    <h3 className="font-bold text-[var(--text-primary)] tracking-tight">{column.title}</h3>
                                                </div>
                                                <span className="bg-[var(--bg-base)] border border-[var(--border-subtle)] px-3 py-1 rounded-full text-xs font-bold text-[var(--text-secondary)]">
                                                    {columnApps.length}
                                                </span>
                                            </div>

                                            <div className="space-y-4 flex-1 min-h-[200px]">
                                                {columnApps.map((app, index) => (
                                                    <Draggable key={app.id} draggableId={app.id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-[var(--bg-card)] p-5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] group"
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <h4 className="font-bold text-[var(--text-primary)] text-lg mb-0.5 group-hover:text-[var(--brand-primary)] transition-colors">{app.company}</h4>
                                                                        <p className="text-sm text-[var(--text-secondary)] font-medium">{app.position}</p>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingApp(app)}
                                                                            className="p-2.5 bg-[var(--bg-base)] hover:bg-[var(--border-subtle)] rounded-xl transition text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                                            aria-label="Edit"
                                                                        >
                                                                            <PencilIcon className="w-4 h-4" aria-hidden />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => deleteApplication(app.id)}
                                                                            className="p-2.5 bg-[var(--bg-base)] hover:bg-red-500/10 rounded-xl transition text-[var(--text-muted)] hover:text-red-500"
                                                                            aria-label="Delete"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" aria-hidden />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <p className="text-xs text-[var(--text-muted)] mb-3 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                                                                    <BookmarkIcon className="w-3 h-3" />
                                                                    {app.location}
                                                                </p>

                                                                <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]/50">
                                                                    {app.applied_date && (
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex justify-between">
                                                                            <span>Applied</span>
                                                                            <span className="text-[var(--text-secondary)]">{new Date(app.applied_date).toLocaleDateString()}</span>
                                                                        </p>
                                                                    )}

                                                                    {app.interview_date && (
                                                                        <div className="mt-2 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex justify-between">
                                                                                <span>Interview</span>
                                                                                <span>{new Date(app.interview_date).toLocaleDateString()}</span>
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Add/Edit Modal */}
            {(showAddModal || editingApp) && (
                <ApplicationModal
                    application={editingApp}
                    userId={userId}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingApp(null);
                    }}
                    onSave={() => {
                        loadApplications();
                        setShowAddModal(false);
                        setEditingApp(null);
                    }}
                />
            )}
        </div>
    );
}

// Application Modal Component
function ApplicationModal({ application, userId, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        company: application?.company || '',
        position: application?.position || '',
        location: application?.location || '',
        job_url: application?.job_url || '',
        salary_min: application?.salary_min || '',
        salary_max: application?.salary_max || '',
        application_status: application?.application_status || 'bookmarked',
        applied_date: application?.applied_date || '',
        oa_deadline: application?.oa_deadline || '',
        interview_date: application?.interview_date || '',
        notes: application?.notes || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            user_id: userId,
            updated_at: new Date().toISOString()
        };

        if (application) {
            await supabase
                .from('job_applications')
                .update(data)
                .eq('id', application.id);
        } else {
            await supabase
                .from('job_applications')
                .insert(data);
        }

        onSave();
    };

    return (
        <div className="fixed inset-0 bg-[var(--bg-base)]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border-subtle)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)]"
                >
                    <XCircleIcon className="w-8 h-8" />
                </button>

                <h2 className="text-4xl font-display font-bold mb-8 text-[var(--text-primary)]">
                    {application ? 'Refine Record' : 'Log Application'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="modal-company" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Company *</label>
                            <input
                                id="modal-company"
                                type="text"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="modal-position" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Position *</label>
                            <input
                                id="modal-position"
                                type="text"
                                required
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="modal-location" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Location</label>
                            <input
                                id="modal-location"
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                                placeholder="e.g., Bangalore"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="modal-job_url" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Job URL</label>
                            <input
                                id="modal-job_url"
                                type="url"
                                value={formData.job_url}
                                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="modal-status" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Current Phase</label>
                            <select
                                id="modal-status"
                                value={formData.application_status}
                                onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none"
                            >
                                <option value="bookmarked">📌 Bookmarked</option>
                                <option value="applied">📨 Applied</option>
                                <option value="oa_received">📝 OA Received</option>
                                <option value="oa_completed">✅ OA Completed</option>
                                <option value="interview_scheduled">🤝 Interview Scheduled</option>
                                <option value="interview_completed">🎯 Interview Completed</option>
                                <option value="offer">🎉 Offer</option>
                                <option value="rejected">❌ Rejected</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="modal-applied_date" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Applied Date</label>
                            <input
                                id="modal-applied_date"
                                type="date"
                                value={formData.applied_date}
                                onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all icon-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="modal-notes" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Strategic Notes</label>
                        <textarea
                            id="modal-notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all resize-none"
                            placeholder="Add specific details, interview questions, or next steps..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] transition-colors">
                            Discard
                        </button>
                        <button type="submit" className="px-10 py-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-[1.02]">
                            {application ? 'Update Registry' : 'Confirm Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
