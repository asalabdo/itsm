import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import changeService from '../../services/changeService';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { format } from 'date-fns';

const ChangeManagementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const statusOptions = [
    { value: 'Proposed', label: t('proposed', 'Proposed') },
    { value: 'Pending Approval', label: t('pendingApproval', 'Pending Approval') },
    { value: 'Approved', label: t('approved', 'Approved') },
    { value: 'Implementing', label: t('implementing', 'Implementing') },
    { value: 'Completed', label: t('completed', 'Completed') },
    { value: 'Rejected', label: t('rejected', 'Rejected') },
  ];
  const [change, setChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const fetchChange = async () => {
    setLoading(true);
    try {
      const data = await changeService.getById(id);
      setChange(data);
      setStatus(data?.status || '');
    } catch (error) {
      console.error('Failed to load change request:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChange();
  }, [id]);

  const saveChange = async () => {
    await changeService.update(id, { status, description: change?.description });
    await fetchChange();
  };

  const submitForApproval = async () => {
    await changeService.submit(id);
    await fetchChange();
  };

  const approve = async () => {
    await changeService.approve(id, notes);
    await fetchChange();
  };

  const reject = async () => {
    await changeService.reject(id, notes);
    await fetchChange();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Change Request</h1>
            <p className="text-sm text-muted-foreground">{change?.changeNumber || 'Loading change request...'}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/change-management')}>
            Back to Change Management
          </Button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            Loading change request...
          </div>
        ) : change ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {change.changeNumber}
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">{change.title}</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {change.status}
                  </span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-7">{change.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Risk</p>
                  <p className="text-lg font-semibold text-foreground">{change.riskLevel}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Category</p>
                  <p className="text-lg font-semibold text-foreground">{change.category}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Requested By</p>
                  <p className="text-lg font-semibold text-foreground">{change.requestedBy?.username || 'Unknown'}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Schedule</p>
                  <p className="text-lg font-semibold text-foreground">
                    {change.scheduledStartDate ? format(new Date(change.scheduledStartDate), 'MMM dd, HH:mm') : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Actions</h3>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={status}
                  onChange={setStatus}
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={saveChange}>
                    Save
                  </Button>
                  <Button variant="default" className="flex-1" onClick={submitForApproval}>
                    Submit
                  </Button>
                </div>
                <Input
                  label="Approval Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add approval notes"
                />
                <div className="flex gap-3">
                  <Button variant="success" className="flex-1" onClick={approve}>
                    Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={reject}>
                    Reject
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="FileText" size={18} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Implementation Plan</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {change.implementationPlan || 'No implementation plan provided.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Change request not found</h2>
            <Button variant="outline" onClick={() => navigate('/change-management')}>
              Return to list
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChangeManagementDetails;
