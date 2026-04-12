import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const InProgressWorkCard = ({ tickets = [], filter, loading }) => {
  const navigate = useNavigate();
  const [activeWork, setActiveWork] = useState([]);

  useEffect(() => {
    const mappedTickets = tickets
      .filter((ticket) => String(ticket?.status).toLowerCase() === 'in progress')
      .map((t) => ({
        backendId: t.id,
        id: t.ticketNumber,
        title: t.title,
        priority: t.priority === 'Critical' ? 'P1' : t.priority === 'High' ? 'P2' : 'P3',
        customer: t.requestedByName || 'Internal User',
        department: t.department || 'General',
        startedAt: new Date(t.updatedAt || t.createdAt || Date.now()),
        timeTracked: Math.max(1, Math.floor(((new Date()) - new Date(t.createdAt || Date.now())) / 60000)),
        progress: t.progress ?? 50,
        collaborators: [],
        nextSteps: t.resolutionNotes || 'Continue troubleshooting and document findings',
        notes: t.description || ''
      }));

    setActiveWork(mappedTickets);
  }, [tickets]);

  const [selectedWork, setSelectedWork] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setActiveWork(prev => prev?.map(work => ({
          ...work,
          timeTracked: work?.timeTracked + 1
        })));
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'text-error border-error bg-error/10';
      case 'P2': return 'text-warning border-warning bg-warning/10';
      case 'P3': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const updateProgress = (workId, newProgress) => {
    setActiveWork(prev => prev?.map(work => 
      work?.id === workId ? { ...work, progress: newProgress } : work
    ));
  };

  const addNote = (workId) => {
    if (newNote?.trim()) {
      setActiveWork(prev => prev?.map(work =>
        work?.id === workId
          ? { ...work, notes: `${work?.notes || ''}\n${newNote}`.trim() }
          : work
      ));
      setNewNote('');
      setSelectedWork(null);
    }
  };

  const openWorkDetails = (work, tab = 'reply') => {
    const ticketId = work?.backendId || work?.id;
    if (!ticketId) return;
    navigate(`/ticket-details/${encodeURIComponent(ticketId)}?tab=${encodeURIComponent(tab)}`);
  };

  const updateWorkStatus = (workId) => {
    setActiveWork(prev => prev?.map(work => {
      if (work?.id !== workId) return work;
      const nextProgress = Math.min(100, (work?.progress || 0) + 15);
      return {
        ...work,
        progress: nextProgress,
        nextSteps: nextProgress >= 100 ? 'Ready for closure and final review' : 'Continue working through the active checklist'
      };
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Play" size={20} />
            <span>In Progress ({activeWork?.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-2 rounded-lg transition-colors ${
                isTimerRunning 
                  ? 'bg-success/10 text-success hover:bg-success/20' :'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon name={isTimerRunning ? 'Pause' : 'Play'} size={16} />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading active work...</div>
        ) : activeWork.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No tickets are currently in progress.
          </div>
        ) : activeWork?.map((work) => (
          <div key={work?.id} className="p-4 border-b border-border last:border-b-0">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded border font-medium ${getPriorityColor(work?.priority)}`}>
                      {work?.priority}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Icon name="Clock" size={12} />
                      <span>{formatDuration(work?.timeTracked)}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-foreground text-sm mb-1">{work?.id}</h4>
                  <p className="text-sm text-foreground mb-2">{work?.title}</p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span>{work?.customer}</span>
                    <span>•</span>
                    <span>{work?.department}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{work?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${work?.progress}%` }}
                  />
                </div>
                <div className="flex space-x-2">
                  {[25, 50, 75, 100]?.map(percent => (
                    <button
                      key={percent}
                      onClick={() => updateProgress(work?.id, percent)}
                      className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Next Steps:</p>
                <p className="text-sm text-foreground">{work?.nextSteps}</p>
              </div>

              {/* Collaborators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Collaborating with:</span>
                </div>
                <div className="flex space-x-1">
                  {work?.collaborators?.map((collab, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                    >
                      {collab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedWork(work)}
                    className="px-3 py-1 bg-accent text-accent-foreground text-xs rounded hover:bg-accent/90 transition-colors"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => updateWorkStatus(work?.id)}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
                
                <div className="flex space-x-1">
                  <button onClick={() => openWorkDetails(work, 'reply')} className="p-1 hover:bg-muted rounded">
                    <Icon name="MessageSquare" size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => openWorkDetails(work, 'contact')} className="p-1 hover:bg-muted rounded">
                    <Icon name="Phone" size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => openWorkDetails(work, 'activity')} className="p-1 hover:bg-muted rounded">
                    <Icon name="Video" size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add Note Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Add Note - {selectedWork?.id}</h3>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Notes</label>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg mt-1">
                    {selectedWork?.notes}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Add New Note</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e?.target?.value)}
                    className="w-full p-3 mt-1 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter work update, findings, or next steps..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedWork(null)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => addNote(selectedWork?.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressWorkCard;
