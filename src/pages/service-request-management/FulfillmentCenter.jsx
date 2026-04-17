import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import Icon from '../../components/AppIcon';
import serviceRequestService from '../../services/serviceRequestService';

const FulfillmentCenter = () => {
  const location = useLocation();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeAction, setActiveAction] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (!queue.length) return;
    const params = new URLSearchParams(location.search);
    const requestId = params.get('request');
    if (!requestId) return;
    const match = queue.find((item) => String(item?.requestNumber || item?.id) === String(requestId));
    if (match) {
      setSelectedRequest(match);
    }
  }, [queue, location.search]);

  const fetchQueue = async () => {
    try {
      const data = await serviceRequestService.getQueue();
      setQueue(data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (approvalId, approve) => {
    if (!approvalId || activeAction) return;
    setActiveAction(approve ? 'approve' : 'reject');
    try {
      await serviceRequestService.approveRequest(approvalId, approve, decisionNotes);
      alert(approve ? 'Request Approved' : 'Request Rejected');
      setSelectedRequest(null);
      setDecisionNotes('');
      fetchQueue();
    } catch (error) {
      console.error('Error processing decision:', error);
      alert('Action failed.');
    } finally {
      setActiveAction('');
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!taskId || activeAction) return;
    setActiveAction(`task-${taskId}`);
    try {
      await serviceRequestService.completeTask(taskId, decisionNotes);
      alert('Task completed');
      setDecisionNotes('');
      await fetchQueue();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task.');
    } finally {
      setActiveAction('');
    }
  };

  const handleCompleteRequest = async () => {
    if (!selectedRequest?.id || activeAction) return;
    setActiveAction('request');
    try {
      await serviceRequestService.completeRequest(selectedRequest.id, decisionNotes);
      alert('Request completed');
      setSelectedRequest(null);
      setDecisionNotes('');
      fetchQueue();
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request.');
    } finally {
      setActiveAction('');
    }
  };

  const handleAdvanceStage = async () => {
    if (!selectedRequest?.id || activeAction) return;
    setActiveAction('advance');
    const stageOrder = ['submission', 'approval', 'fulfillment'];
    const current = selectedRequest.workflowStage?.trim().toLowerCase();
    const nextIndex = stageOrder.indexOf(current) + 1;
    if (nextIndex <= 0 || nextIndex >= stageOrder.length) {
      setActiveAction('');
      return;
    }
    const nextStage = stageOrder[nextIndex].charAt(0).toUpperCase() + stageOrder[nextIndex].slice(1);
    try {
      await serviceRequestService.advanceStage(selectedRequest.id, nextStage);
      await fetchQueue();
      setSelectedRequest(prev => ({ ...prev, workflowStage: nextStage }));
    } catch (error) {
      console.error('Error advancing stage:', error);
      alert('Failed to advance stage.');
    } finally {
      setActiveAction('');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-error bg-error/10 border-error/20';
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  if (loading) return <div className="p-8">{t('loadingQueue', 'Loading queue...')}</div>;

  return (
    <div className="flex flex-col space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t('fulfillmentCenter', 'Fulfillment Center')}</h1>
        <p className="text-muted-foreground mt-1">{t('manageApprovals', 'Manage service request approvals and tasks')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Queue */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="List" size={20} className="text-primary" />
              {t('activeQueue', 'Active Queue')} ({queue.length})
            </h2>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('number', 'Number')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('request', 'Request')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('priority', 'Priority')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('slaStatus', 'SLA Status')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.map(req => (
                  <tr key={req.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-primary">{req.requestNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{req.title}</span>
                        <span className="text-xs text-muted-foreground">{req.catalogItemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.isSlaBreached ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-error">
                          <Icon name="AlertTriangle" size={14} /> BREACHED
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-success">ON TRACK</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                      >
                        <Icon name="ChevronRight" size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1">
          {selectedRequest ? (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-lg sticky top-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Request Details</h3>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-muted rounded-full">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Summary</label>
                  <p className="mt-1 font-bold text-foreground">{selectedRequest.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
                </div>

                {/* Custom Data Display */}
                {selectedRequest.customDataJson && (
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Request Data</label>
                    <div className="grid grid-cols-1 gap-2">
                       {Object.entries(JSON.parse(selectedRequest.customDataJson)).map(([key, val]) => (
                         <div key={key} className="flex justify-between text-sm">
                           <span className="text-muted-foreground">{key}:</span>
                           <span className="font-bold text-foreground">{val}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border group hover:border-primary/20 transition-colors">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Workflow Stage</label>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-sm font-bold text-foreground">{selectedRequest.workflowStage}</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">SLA Due Date</label>
                    <p className="text-sm font-bold text-foreground">
                      {selectedRequest.slaDueDate && new Date(selectedRequest.slaDueDate).getFullYear() > 1970
                        ? new Date(selectedRequest.slaDueDate).toLocaleDateString()
                        : <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  </div>
                </div>

                {/* Approvals Section */}
                {selectedRequest.workflowStage?.trim().toLowerCase() === 'approval' && (
                  <div className="p-5 bg-warning/10 border border-warning/20 rounded-3xl space-y-4 shadow-sm">
                    <h4 className="font-bold text-warning flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Icon name="ShieldAlert" size={16} />
                      Pending Approval
                    </h4>
                    <textarea 
                      className="w-full p-4 rounded-2xl border border-border focus:ring-4 focus:ring-warning/10 focus:border-warning text-sm bg-background transition-all outline-none"
                      placeholder="Add decision justification..."
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                    ></textarea>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveAction(selectedRequest.approvals?.[0]?.id, true)}
                        disabled={activeAction === 'approve' || !selectedRequest.approvals?.[0]?.id}
                        className="flex-1 py-3 bg-success text-success-foreground font-bold rounded-2xl hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                      >
                        {activeAction === 'approve' ? 'Processing...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleApproveAction(selectedRequest.approvals?.[0]?.id, false)}
                        disabled={activeAction === 'reject' || !selectedRequest.approvals?.[0]?.id}
                        className="flex-1 py-3 bg-error text-error-foreground font-bold rounded-2xl hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                      >
                        {activeAction === 'reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Fulfillment Tasks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fulfillment Plan</label>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                      {selectedRequest.tasks?.filter(t => t.status === 'Completed').length || 0} / {selectedRequest.tasks?.length || 0}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {(selectedRequest.tasks || []).map(task => (
                      <div key={task.id} className="flex items-center justify-between gap-4 p-4 bg-muted/30 border border-border rounded-2xl group hover:bg-card hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-background border border-border text-muted-foreground'}`}>
                            <Icon name={task.status === 'Completed' ? 'Check' : 'Circle'} size={14} strokeWidth={3} />
                          </div>
                          <span className={`text-sm font-semibold ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</span>
                        </div>
                        {task.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={activeAction === `task-${task.id}`}
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all disabled:opacity-50 transform active:scale-95"
                          >
                            {activeAction === `task-${task.id}` ? '...' : 'Complete'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {(selectedRequest.tasks || []).length === 0 && (
                    <div className="p-4 border-2 border-dashed border-border rounded-2xl text-center">
                       <p className="text-xs text-muted-foreground italic">No fulfillment tasks generated.</p>
                    </div>
                  )}

                  {selectedRequest.workflowStage?.trim().toLowerCase() === 'fulfillment' ? (
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleCompleteRequest}
                        disabled={activeAction === 'request'}
                        className="w-full py-4 bg-foreground text-background font-extrabold rounded-2xl hover:opacity-90 shadow-xl transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        {activeAction === 'request' ? (
                           <>
                             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                             Completing...
                           </>
                        ) : (
                          <>
                            <Icon name="CheckCircle2" size={18} />
                            Complete Request
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
                        This will finalize the request and notify the user.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(() => {
                        const stageOrder = ['submission', 'approval', 'fulfillment'];
                        const current = selectedRequest.workflowStage?.trim().toLowerCase();
                        const currentIndex = stageOrder.indexOf(current);
                        const canAdvance = currentIndex >= 0 && currentIndex < stageOrder.length - 1;
                        const nextStage = canAdvance
                          ? stageOrder[currentIndex + 1].charAt(0).toUpperCase() + stageOrder[currentIndex + 1].slice(1)
                          : null;
                        return (
                          <>
                            {/* Stage progress indicator */}
                            <div className="flex items-center gap-1">
                              {stageOrder.map((stage, i) => (
                                <React.Fragment key={stage}>
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                                    i < currentIndex ? 'bg-success/10 text-success' :
                                    i === currentIndex ? 'bg-primary/10 text-primary' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {i < currentIndex && <Icon name="Check" size={10} />}
                                    {stage}
                                  </div>
                                  {i < stageOrder.length - 1 && <Icon name="ChevronRight" size={12} className="text-muted-foreground shrink-0" />}
                                </React.Fragment>
                              ))}
                            </div>

                            {canAdvance ? (
                              <button
                                type="button"
                                onClick={handleAdvanceStage}
                                disabled={activeAction === 'advance'}
                                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 shadow-md transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-2"
                              >
                                {activeAction === 'advance' ? (
                                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Advancing...</>
                                ) : (
                                  <><Icon name="ArrowRight" size={16} /> Advance to {nextStage}</>
                                )}
                              </button>
                            ) : (
                              <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <Icon name="Lock" size={12} />
                                  No further stages available.
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4">
              <Icon name="MousePointer2" size={32} />
              <p className="text-sm font-medium italic">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FulfillmentCenter;
