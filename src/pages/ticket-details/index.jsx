import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import TicketHeader from './components/TicketHeader';
import ConversationThread from './components/ConversationThread';
import InternalNotes from './components/InternalNotes';
import TicketActions from './components/TicketActions';
import FileAttachments from './components/FileAttachments';
import TimeTracking from './components/TimeTracking';
import AuditTrail from './components/AuditTrail';
import CustomerSatisfaction from './components/CustomerSatisfaction';
import ReplyComposer from './components/ReplyComposer';

const TicketDetails = () => {
  const [ticketData] = useState({
    id: "4521",
    title: "Unable to Login to Mobile Application",
    description: "Employee reports persistent login failures on iOS mobile app despite correct credentials. Issue started after latest app update on January 4, 2026.",
    status: "In Progress",
    priority: "Urgent",
    category: "Incident",
    customer: {
      name: "Abdelrahman Salem",
      email: "a.salem@gfsa.gov.sa",
      phone: "9007",
      company: "TechCorp Industries"
    },
    assignedTo: {
      id: "agent1",
      name: "Sarah Alrashedea",
      role: "Senior Support Agent",
      avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1479bf0bf-1763297239550.png",
      avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blue blazer and white blouse"
    },
    slaDeadline: "Jan 06, 2026 10:30 AM",
    slaRemaining: "2 hours 57 minutes",
    createdDate: "Jan 05, 2026",
    createdTime: "08:15 AM"
  });

  const [messages] = useState([
  {
    id: 1,
    type: "customer",
    sender: "Abdelrahman Salem",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1a79b8e72-1763295320816.png",
    avatarAlt: "Professional headshot of middle-aged man with short gray hair wearing dark suit and blue tie",
    content: "Hi, I'm unable to log into the mobile app since yesterday. I've tried resetting my password twice but still getting 'Invalid credentials' error. This is urgent as I need to access client data for an important meeting today.",
    timestamp: "Jan 05, 2026 08:15 AM",
    attachments: [
    { name: "error_screenshot.png", size: "245 KB", type: "image/png" },
    { name: "app_version_info.txt", size: "2 KB", type: "text/plain" }]

  },
  {
    id: 2,
    type: "agent",
    sender: "Sarah Alrashedea",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1479bf0bf-1763297239550.png",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blue blazer and white blouse",
    content: "Hello John,\n\nThank you for contacting support. I understand the urgency of your situation. I've reviewed your account and can see the login attempts. Let me investigate this issue immediately.\n\nCould you please confirm:\n1. Are you using the latest version (v3.2.1) of the app?\n2. Have you tried uninstalling and reinstalling the app?\n3. Are you able to log in via the web portal?\n\nI'll prioritize this and get back to you within the hour.",
    timestamp: "Jan 05, 2026 08:22 AM"
  },
  {
    id: 3,
    type: "customer",
    sender: "Abdelrahman Salem",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1a79b8e72-1763295320816.png",
    avatarAlt: "Professional headshot of middle-aged man with short gray hair wearing dark suit and blue tie",
    content: "Yes, I'm on v3.2.1. I just tried reinstalling but same issue. However, I can log in fine through the web portal. The problem is only with the mobile app.",
    timestamp: "Jan 05, 2026 08:28 AM"
  },
  {
    id: 4,
    type: "system",
    content: "Ticket priority changed from High to Urgent by Sarah Alrashedea",
    timestamp: "Jan 05, 2026 08:30 AM"
  },
  {
    id: 5,
    type: "agent",
    sender: "Sarah Alrashedea",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1479bf0bf-1763297239550.png",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blue blazer and white blouse",
    content: "Thank you for confirming. I've escalated this to our mobile development team. This appears to be related to the recent iOS app update affecting certain user accounts.\n\nAs a temporary workaround, you can:\n1. Use the web portal on your mobile browser\n2. Request a desktop session if needed\n\nOur team is working on a hotfix that should be deployed within 2-3 hours. I'll keep you updated on the progress.",
    timestamp: "Jan 05, 2026 09:15 AM"
  },
  {
    id: 6,
    type: "system",
    content: "Ticket assigned to Mobile Development Team",
    timestamp: "Jan 05, 2026 09:16 AM"
  }]
  );

  const [internalNotes] = useState([
  {
    id: 1,
    author: "Sarah Alrashedea",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1479bf0bf-1763297239550.png",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blue blazer and white blouse",
    content: "Checked backend logs - authentication service is working fine. Issue appears to be client-side with iOS app v3.2.1. Multiple users reporting similar issues since yesterday's deployment.",
    timestamp: "Jan 05, 2026 08:35 AM"
  },
  {
    id: 2,
    author: "Abullah Aldosri",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1bd15b436-1763300581767.png",
    avatarAlt: "Professional headshot of Asian man with black hair and glasses wearing gray suit and white shirt",
    content: "Mobile team confirmed bug in OAuth token refresh logic for iOS. Hotfix in progress. ETA 2 hours. Will need to push emergency update through App Store.",
    timestamp: "Jan 05, 2026 10:20 AM"
  },
  {
    id: 3,
    author: "Sarah Alrashedea",
    avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1479bf0bf-1763297239550.png",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blue blazer and white blouse",
    content: "Employee is VIP account - TechCorp Industries. Keeping close watch on this. Will provide hourly updates until resolved.",
    timestamp: "Jan 05, 2026 11:45 AM"
  }]
  );

  const [attachments] = useState([
  {
    id: 1,
    name: "error_screenshot.png",
    size: 251904,
    type: "image/png",
    uploadedBy: "Abdelrahman Salem",
    uploadedAt: "Jan 05, 2026 08:15 AM"
  },
  {
    id: 2,
    name: "app_version_info.txt",
    size: 2048,
    type: "text/plain",
    uploadedBy: "Abdelrahman Salem",
    uploadedAt: "Jan 05, 2026 08:15 AM"
  },
  {
    id: 3,
    name: "debug_logs.zip",
    size: 1572864,
    type: "application/zip",
    uploadedBy: "Sarah Alrashedea",
    uploadedAt: "Jan 05, 2026 09:30 AM"
  }]
  );

  const [timeTracking] = useState({
    totalTime: 7245,
    sessions: [
    {
      id: 1,
      agent: "Sarah Alrashedea",
      duration: 3600,
      date: "Jan 05, 2026"
    },
    {
      id: 2,
      agent: "Abdulrahman Salem",
      duration: 2400,
      date: "Jan 05, 2026"
    },
    {
      id: 3,
      agent: "Sarah Alrashedea",
      duration: 1245,
      date: "Jan 06, 2026"
    }]

  });

  const [auditTrail] = useState([
  {
    id: 1,
    type: "status_change",
    user: "System",
    action: "created this ticket",
    details: "Ticket created via customer portal",
    timestamp: "Jan 05, 2026 08:15 AM"
  },
  {
    id: 2,
    type: "assignment",
    user: "Auto-Assignment",
    action: "assigned ticket to Sarah Alrashedea",
    details: "Based on workload and expertise",
    timestamp: "Jan 05, 2026 08:16 AM"
  },
  {
    id: 3,
    type: "priority_change",
    user: "Sarah Alrashedea",
    action: "changed priority from High to Urgent",
    details: "VIP customer with business-critical issue",
    timestamp: "Jan 05, 2026 08:30 AM"
  },
  {
    id: 4,
    type: "status_change",
    user: "Sarah Alrashedea",
    action: "changed status from Open to In Progress",
    timestamp: "Jan 05, 2026 08:31 AM"
  },
  {
    id: 5,
    type: "escalation",
    user: "Sarah Alrashedea",
    action: "escalated to Mobile Development Team",
    details: "Requires code-level investigation",
    timestamp: "Jan 05, 2026 09:16 AM"
  },
  {
    id: 6,
    type: "comment",
    user: "Abdulrahman Salem",
    action: "added internal note",
    details: "Bug identified in OAuth token refresh",
    timestamp: "Jan 05, 2026 10:20 AM"
  },
  {
    id: 7,
    type: "attachment",
    user: "Sarah Alrashedea",
    action: "uploaded debug_logs.zip",
    timestamp: "Jan 05, 2026 09:30 AM"
  }]
  );

  const handleStatusChange = (newStatus) => {
    console.log('Status changed to:', newStatus);
  };

  const handlePriorityChange = (newPriority) => {
    console.log('Priority changed to:', newPriority);
  };

  const handleAssign = (agentId) => {
    console.log('Assigned to agent:', agentId);
  };

  const handleEscalate = () => {
    console.log('Ticket escalated');
  };

  const handleAddNote = (note) => {
    console.log('Internal note added:', note);
  };

  const handleUploadFiles = (files) => {
    console.log('Files uploaded:', files);
  };

  const handleStartTimer = () => {
    console.log('Timer started');
  };

  const handleStopTimer = (duration) => {
    console.log('Timer stopped. Duration:', duration);
  };

  const handleSubmitSurvey = (survey) => {
    console.log('Survey submitted:', survey);
  };

  const handleSendReply = (reply) => {
    console.log('Reply sent:', reply);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
        <div className="space-y-4 md:space-y-6">
          <TicketHeader ticket={ticketData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <ConversationThread messages={messages} />
              
              <InternalNotes notes={internalNotes} onAddNote={handleAddNote} />
              
              <ReplyComposer onSendReply={handleSendReply} />
              
              <FileAttachments attachments={attachments} onUpload={handleUploadFiles} />
              
              <AuditTrail activities={auditTrail} />
            </div>

            <div className="space-y-4 md:space-y-6">
              <TicketActions
                ticket={ticketData}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onAssign={handleAssign}
                onEscalate={handleEscalate} />

              
              <TimeTracking
                totalTime={timeTracking?.totalTime}
                sessions={timeTracking?.sessions}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer} />

              
              <CustomerSatisfaction
                isResolved={ticketData?.status === 'Resolved'}
                onSubmitSurvey={handleSubmitSurvey} />

            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default TicketDetails;