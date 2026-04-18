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
import ManageIndex from './pages/manage';
import TicketCreation from './pages/ticket-creation';
import AgentDashboard from './pages/agent-dashboard';
import ManagerDashboard from './pages/manager-dashboard';
import CustomerPortal from './pages/customer-portal';
import ServiceDeskBlueprint from './pages/service-desk-blueprint';
import MonitoringEvents from './pages/monitoring-events';
import ReportsAnalytics from './pages/reports-analytics';
import TicketDetails from './pages/ticket-details';
import WorkflowBuilder from './pages/workflow-builder';
import ApprovalQueueManager from './pages/approval-queue-manager';
import WorkflowBuilderStudio from './pages/workflow-builder-studio';
import TicketManagementCenter from './pages/ticket-management-center';
import TicketWorkflowCrud from './pages/ticket-workflow-crud';
import ReportingAndAnalyticsHub from './pages/reporting-and-analytics-hub';
import AuditTrailAndComplianceViewer from './pages/audit-trail-and-compliance-viewer';
import AssetRegistryAndTracking from './pages/asset-registry-and-tracking';
import ManageAssets from './pages/manage-assets';
import TicketChatbot from './pages/ticket-chatbot';
import MyWorkDashboard from './pages/my-work-dashboard';
import Login from './pages/login/Login';
import AutomationManagement from './pages/automation-rules';
import AdvancedAnalyticsHub from './pages/advanced-analytics';
import SlaPolicies from './pages/sla-policies';
import TicketSla from './pages/ticket-sla';
import Priorities from './pages/priorities';
import Escalations from './pages/escalations';
import ServiceCatalogHub from './pages/service-catalog';
import FulfillmentCenter from './pages/service-request-management/FulfillmentCenter';
import ChangeManagement from './pages/change-management';
import ChangeManagementDetails from './pages/change-management/details';
import UserManagement from './pages/user-management/UserManagement';
import IncidentManagementWorkflow from './pages/incident-management-workflow';
import SearchResults from './pages/search-results';
import KnowledgeBase from './pages/knowledge-base';
import Problems from './pages/problems';
import Settings from './pages/settings';
import ScenarioValidationCenter from './pages/scenario-validation-center';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Layout>
          <RouterRoutes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/executive-it-service-summary" element={<ProtectedRoute><ExecutiveITServiceSummary /></ProtectedRoute>} />
            <Route path="/it-operations-command-center" element={<ProtectedRoute><ITOperationsCommandCenter /></ProtectedRoute>} />
            <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalyticsHub /></ProtectedRoute>} />
            <Route path="/service-performance-analytics" element={<ProtectedRoute><ServicePerformanceAnalytics /></ProtectedRoute>} />
            <Route path="/sla-policies" element={<ProtectedRoute><SlaPolicies /></ProtectedRoute>} />
            <Route path="/ticket-sla" element={<ProtectedRoute><TicketSla /></ProtectedRoute>} />
            <Route path="/priorities" element={<ProtectedRoute><Priorities /></ProtectedRoute>} />
            <Route path="/escalations" element={<ProtectedRoute><Escalations /></ProtectedRoute>} />
            <Route path="/asset-lifecycle-management" element={<ProtectedRoute><AssetLifecycleManagement /></ProtectedRoute>} />
            <Route path="/change-management-dashboard" element={<ProtectedRoute><ChangeManagementDashboard /></ProtectedRoute>} />
            <Route path="/service-request-management" element={<ProtectedRoute><ServiceRequestManagement /></ProtectedRoute>} />
            <Route path="/manage" element={<ProtectedRoute><ManageIndex /></ProtectedRoute>} />
            <Route path="/manage/:entityKey/*" element={<ProtectedRoute><CRUDPage /></ProtectedRoute>} />
            <Route path="/ticket-creation" element={<ProtectedRoute><TicketCreation /></ProtectedRoute>} />
            <Route path="/agent-dashboard" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/manager-dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/customer-portal" element={<ProtectedRoute><CustomerPortal /></ProtectedRoute>} />
            <Route path="/service-desk-blueprint" element={<ProtectedRoute><ServiceDeskBlueprint /></ProtectedRoute>} />
            <Route path="/monitoring-events" element={<ProtectedRoute><MonitoringEvents /></ProtectedRoute>} />
            <Route path="/reports-analytics" element={<ProtectedRoute><ReportsAnalytics /></ProtectedRoute>} />
            <Route path="/ticket-details" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
            <Route path="/ticket-details/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
            <Route path="/workflow-builder" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/approval-queue-manager" element={<ProtectedRoute><ApprovalQueueManager /></ProtectedRoute>} />
            <Route path="/workflow-builder-studio" element={<ProtectedRoute><WorkflowBuilderStudio /></ProtectedRoute>} />
            <Route path="/ticket-workflow-crud" element={<ProtectedRoute><TicketWorkflowCrud /></ProtectedRoute>} />
            <Route path="/ticket-management-center" element={<ProtectedRoute><TicketManagementCenter /></ProtectedRoute>} />
            <Route path="/reporting-and-analytics-hub" element={<ProtectedRoute><ReportingAndAnalyticsHub /></ProtectedRoute>} />
            <Route path="/audit-trail-and-compliance-viewer" element={<ProtectedRoute><AuditTrailAndComplianceViewer /></ProtectedRoute>} />
            <Route path="/my-work" element={<ProtectedRoute><MyWorkDashboard /></ProtectedRoute>} />
            <Route path="/asset-registry-and-tracking" element={<ProtectedRoute><AssetRegistryAndTracking /></ProtectedRoute>} />
            <Route path="/manage/assets" element={<ProtectedRoute><ManageAssets /></ProtectedRoute>} />
            <Route path="/change-management" element={<ProtectedRoute><ChangeManagement /></ProtectedRoute>} />
            <Route path="/change-management/:id" element={<ProtectedRoute><ChangeManagementDetails /></ProtectedRoute>} />
            <Route path="/automation-rules" element={<ProtectedRoute><AutomationManagement /></ProtectedRoute>} />
            <Route path="/service-catalog" element={<ProtectedRoute><ServiceCatalogHub /></ProtectedRoute>} />
            <Route path="/fulfillment-center" element={<ProtectedRoute><FulfillmentCenter /></ProtectedRoute>} />
            <Route path="/ticket-chatbot" element={<ProtectedRoute><TicketChatbot /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/incident-management-workflow" element={<ProtectedRoute><IncidentManagementWorkflow /></ProtectedRoute>} />
            <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/scenario-validation-center" element={<ProtectedRoute><ScenarioValidationCenter /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </RouterRoutes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
