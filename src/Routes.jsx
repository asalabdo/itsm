import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ExecutiveITServiceSummary from './pages/executive-it-service-summary';
import ITOperationsCommandCenter from './pages/it-operations-command-center';
import ServicePerformanceAnalytics from './pages/service-performance-analytics';
import AssetLifecycleManagement from './pages/asset-lifecycle-management';
import ChangeManagementDashboard from './pages/change-management-dashboard';
import ServiceRequestManagement from './pages/service-request-management';
import Layout from './components/Layout';
import CRUDPage from './crud/CRUDPage';
import TicketCreation from './pages/ticket-creation';
import AgentDashboard from './pages/agent-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import CustomerPortal from './pages/customer-portal';
import ReportsAnalytics from './pages/reports-analytics';
import TicketDetails from './pages/ticket-details';
import WorkflowBuilder from './pages/workflow-builder';
import ApprovalQueueManager from './pages/approval-queue-manager';
import WorkflowBuilderStudio from './pages/workflow-builder-studio';
import TicketManagementCenter from './pages/ticket-management-center';
import ReportingAndAnalyticsHub from './pages/reporting-and-analytics-hub';
import AuditTrailAndComplianceViewer from './pages/audit-trail-and-compliance-viewer';
import AssetRegistryAndTracking from './pages/asset-registry-and-tracking';
import TicketChatbot from './pages/ticket-chatbot';
import MyWorkDashboard from './pages/my-work-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Layout>
          <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<AgentDashboard />} />
            <Route path="/executive-it-service-summary" element={<ExecutiveITServiceSummary />} />
            <Route path="/it-operations-command-center" element={<ITOperationsCommandCenter />} />
            <Route path="/service-performance-analytics" element={<ServicePerformanceAnalytics />} />
            <Route path="/asset-lifecycle-management" element={<AssetLifecycleManagement />} />
            <Route path="/change-management-dashboard" element={<ChangeManagementDashboard />} />
            <Route path="/service-request-management" element={<ServiceRequestManagement />} />
            {/* CRUD management routes */}
            <Route path="/manage/:entityKey/*" element={<CRUDPage />} />
            {/* Define your route here */}
            <Route path="/ticket-creation" element={<TicketCreation />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/customer-portal" element={<CustomerPortal />} />
            <Route path="/reports-analytics" element={<ReportsAnalytics />} />
            <Route path="/ticket-details" element={<TicketDetails />} />
            <Route path="/workflow-builder" element={<WorkflowBuilder />} />
            <Route path="/approval-queue-manager" element={<ApprovalQueueManager />} />
            <Route path="/workflow-builder-studio" element={<WorkflowBuilderStudio />} />
            <Route path="/ticket-management-center" element={<TicketManagementCenter />} />
            <Route path="/reporting-and-analytics-hub" element={<ReportingAndAnalyticsHub />} />
            <Route path="/my-work" element={<MyWorkDashboard />} />
            <Route path="/asset-registry-and-tracking" element={<AssetRegistryAndTracking />} />
            <Route path="/ticket-chatbot" element={<TicketChatbot />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;