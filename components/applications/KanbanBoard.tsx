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
    TrashIcon,
    MagnifyingGlassIcon,
    ClockIcon,
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
    { id: 'bookmarked', title: 'Bookmarked', icon: BookmarkIcon, color: 'text-slate-400' },
    { id: 'applied', title: 'Applied', icon: PaperAirplaneIcon, color: 'text-blue-400' },
    { id: 'oa_received', title: 'OA Received', icon: DocumentTextIcon, color: 'text-amber-400' },
    { id: 'oa_completed', title: 'OA Done', icon: DocumentTextIcon, color: 'text-emerald-400' },
    { id: 'interview_scheduled', title: 'Interview', icon: ChatBubbleLeftRightIcon, color: 'text-violet-400' },
    { id: 'interview_completed', title: 'Feedback', icon: ChatBubbleLeftRightIcon, color: 'text-indigo-400' },
    { id: 'offer', title: 'Offer', icon: TrophyIcon, color: 'text-emerald-400' },
    { id: 'rejected', title: 'Rejected', icon: XCircleIcon, color: 'text-red-400' }
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

        if (data) setApplications(data);
        setLoading(false);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        const { error } = await supabase
            .from('job_applications')
            .update({
                application_status: destination.droppableId,
                updated_at: new Date().toISOString()
            })
            .eq('id', draggableId);

        if (!error) {
            await supabase.from('application_activities').insert({
                application_id: draggableId,
                activity_type: 'status_change',
                description: `Moved from ${source.droppableId} to ${destination.droppableId}`
            });
            loadApplications();
        }
    };

    const deleteApplication = async (id: string) => {
        if (confirm('Delete this application forever?')) {
            await supabase.from('job_applications').delete().eq('id', id);
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

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex-1 w-full max-w-md relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="search"
                        placeholder="Filter by company or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-violet-600 transition-all outline-none"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    New Application
                </button>
            </header>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
                    {columns.map((column) => {
                        const columnApps = getColumnApplications(column.id);
                        const Icon = column.icon;

                        return (
                            <div key={column.id} className="flex-shrink-0 w-80">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${column.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{column.title}</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                        {columnApps.length}
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[600px] rounded-3xl p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.03]' : 'bg-transparent'}`}
                                        >
                                            <div className="space-y-4">
                                                {columnApps.map((app, index) => (
                                                    <Draggable key={app.id} draggableId={app.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`glass-card !p-5 group transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 border-violet-500 shadow-2xl shadow-violet-500/20' : 'hover:border-white/20'}`}
                                                            >
                                                                <header className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <h4 className="font-bold text-white leading-tight mb-1">{app.company}</h4>
                                                                        <p className="text-xs font-medium text-slate-500">{app.position}</p>
                                                                    </div>
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => setEditingApp(app)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                                            <PencilIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button onClick={() => deleteApplication(app.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </header>

                                                                <footer className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                                        <span>{app.location || 'Remote'}</span>
                                                                        {app.applied_date && (
                                                                            <>
                                                                                <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                                                                <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {app.interview_date && (
                                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                                                                <ClockIcon className="w-3 h-3" />
                                                                                {new Date(app.interview_date).toLocaleDateString()}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </footer>
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

            {(showAddModal || editingApp) && (
                <ApplicationModal
                    application={editingApp}
                    userId={userId}
                    onClose={() => { setShowAddModal(false); setEditingApp(null); }}
                    onSave={() => { loadApplications(); setShowAddModal(false); setEditingApp(null); }}
                />
            )}
        </div>
    );
}

function ApplicationModal({ application, userId, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        company: application?.company || '',
        position: application?.position || '',
        location: application?.location || '',
        job_url: application?.job_url || '',
        application_status: application?.application_status || 'bookmarked',
        applied_date: application?.applied_date || '',
        oa_deadline: application?.oa_deadline || '',
        interview_date: application?.interview_date || '',
        notes: application?.notes || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...formData, user_id: userId, updated_at: new Date().toISOString() };
        if (application) {
            await supabase.from('job_applications').update(data).eq('id', application.id);
        } else {
            await supabase.from('job_applications').insert(data);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 text-white">
            <div className="glass-card max-w-2xl w-full border-white/10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <XCircleIcon className="w-6 h-6 text-slate-500" />
                </button>
                <h2 className="text-3xl font-bold mb-8 tracking-tighter">
                    {application ? 'Modify' : 'Initialize'} Application
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Company *</label>
                        <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-violet-600 transition-all" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Position *</label>
                        <input type="text" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-violet-600 transition-all" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Job URL</label>
                        <input type="url" value={formData.job_url} onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-violet-600 transition-all" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                        <select value={formData.application_status} onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-violet-600 transition-all">
                            {columns.map(c => <option key={c.id} value={c.id} className="bg-[#030712]">{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Applied Date</label>
                        <input type="date" value={formData.applied_date} onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-violet-600 transition-all" />
                    </div>
                    <div className="col-span-2 pt-6 border-t border-white/5 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95">Save Application</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
