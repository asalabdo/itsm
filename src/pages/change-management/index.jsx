import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import changeService from '../../services/changeService';
import { format } from 'date-fns';
import ChangeForm from './components/ChangeForm';

const ChangeManagement = () => {
    const navigate = useNavigate();
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchChanges();
    }, []);

    const fetchChanges = async () => {
        try {
            setLoading(true);
            const data = await changeService.getAll();
            setChanges(data);
        } catch (error) {
            console.error('Failed to fetch changes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChange = async (data) => {
        try {
            setSubmitting(true);
            await changeService.create(data);
            setIsFormOpen(false);
            fetchChanges();
        } catch (error) {
            console.error('Failed to create change:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Proposed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Pending Approval': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Implementing': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'Completed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'High': return 'text-rose-500';
            case 'Medium': return 'text-amber-500';
            case 'Low': return 'text-emerald-500';
            default: return 'text-slate-500';
        }
    };

    const filteredChanges = filter === 'All' 
        ? changes 
        : changes.filter(c => c.status === filter);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />
            <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Change Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Control and coordinate IT changes to minimize service disruption
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Icon name="Plus" size={20} />
                        New Change Request
                    </button>
                </div>

                {isFormOpen && (
                    <ChangeForm 
                        onSubmit={handleCreateChange}
                        onCancel={() => setIsFormOpen(false)}
                        loading={submitting}
                    />
                )}

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto">
                        {['All', 'Proposed', 'Pending Approval', 'Approved', 'Implementing', 'Completed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
                                    filter === s 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk & Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic animate-pulse">
                                            Loading changes...
                                        </td>
                                    </tr>
                                ) : filteredChanges.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                            No change requests found
                                        </td>
                                    </tr>
                                ) : filteredChanges.map((change) => (
                                    <tr key={change.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-smooth group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-smooth">
                                                {change.changeNumber}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{change.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium flex items-center gap-1.5 ${getRiskColor(change.riskLevel)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                                {change.riskLevel} Risk
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{change.category}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(change.status)}`}>
                                                {change.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">
                                                    {change.requestedBy?.username?.substring(0, 2) || '??'}
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{change.requestedBy?.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {change.scheduledStartDate ? format(new Date(change.scheduledStartDate), 'MMM dd, HH:mm') : 'Not scheduled'}
                                            </div>
                                            {change.scheduledEndDate && (
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    to {format(new Date(change.scheduledEndDate), 'MMM dd, HH:mm')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/change-management/${change.id}`)}
                                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-smooth"
                                            >
                                                <Icon name="ExternalLink" size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChangeManagement;
