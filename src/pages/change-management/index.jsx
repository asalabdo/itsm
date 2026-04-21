import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import changeService from '../../services/changeService';
import { format } from 'date-fns';
import ChangeForm from './components/ChangeForm';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';

const ChangeManagement = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = (key, fallback) => getTranslation(language, key, fallback);
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState(t('all', 'All'));
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

    const filteredChanges = filter === t('all', 'All') 
        ? changes 
        : changes.filter(c => c.status === filter);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />
            <BreadcrumbTrail />
            <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('changeManagementTitle', 'Change Management')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {t('changeManagementDescription', 'Control and coordinate IT changes to minimize service disruption')}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Icon name="Plus" size={20} />
                        {t('newChangeRequest', 'New Change Request')}
                    </button>
                </div>

                {isFormOpen && (
                    <ChangeForm 
                        onSubmit={handleCreateChange}
                        onCancel={() => setIsFormOpen(false)}
                        loading={submitting}
                    />
                )}

                <div className="mb-8">
                    <ManageEngineOnPremSnapshot
                        title={t('manageEngineChangeContext', 'ManageEngine Change Context')}
                        description={t('manageEngineChangeContextDesc', 'On-prem OpManager alerts and ServiceDesk requests to validate change risk before implementation.')}
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto">
                        {[
                            { key: 'all', label: t('all', 'All') },
                            { key: 'proposed', label: t('proposed', 'Proposed') },
                            { key: 'pendingApproval', label: t('pendingApproval', 'Pending Approval') },
                            { key: 'approved', label: t('approved', 'Approved') },
                            { key: 'implementing', label: t('implementing', 'Implementing') },
                            { key: 'completed', label: t('completed', 'Completed') }
                        ].map((statusOption) => (
                            <button
                                key={statusOption.key}
                                onClick={() => setFilter(statusOption.key === 'all' ? t('all', 'All') : statusOption.label)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
                                    filter === (statusOption.key === 'all' ? t('all', 'All') : statusOption.label)
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {statusOption.label}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('changeNumber', 'Change')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('riskAndCategory', 'Risk & Category')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status', 'Status')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('requester', 'Requester')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('scheduling', 'Scheduling')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic animate-pulse">
                                            {t('loadingChanges', 'Loading changes...')}
                                        </td>
                                    </tr>
                                ) : filteredChanges.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                            {t('noChangeRequests', 'No change requests')}
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
                                                {change.riskLevel} {t('riskLevel', 'Risk')}
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
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{change.requestedBy?.username || t('unknown', 'Unknown')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {change.scheduledStartDate ? format(new Date(change.scheduledStartDate), 'MMM dd, HH:mm') : t('notScheduled', 'Not scheduled')}
                                            </div>
                                            {change.scheduledEndDate && (
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {t('to', 'to')} {format(new Date(change.scheduledEndDate), 'MMM dd, HH:mm')}
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
