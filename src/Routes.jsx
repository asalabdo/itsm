import { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Layout from './components/Layout';
import CRUDPage from './crud/CRUDPage';
import { Navigate } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import { getTranslation } from './services/i18n';

const ExecutiveITServiceSummary = lazy(() => import('./pages/executive-it-service-summary'));
const ITOperationsCommandCenter = lazy(() => import('./pages/it-operations-command-center'));
const ServicePerformanceAnalytics = lazy(() => import('./pages/service-performance-analytics'));
const AssetLifecycleManagement = lazy(() => import('./pages/asset-lifecycle-management'));
const ChangeManagementDashboard = lazy(() => import('./pages/change-management-dashboard'));
const ServiceRequestManagement = lazy(() => import('./pages/service-request-management'));
const ManageIndex = lazy(() => import('./pages/manage'));
const TicketCreation = lazy(() => import('./pages/ticket-creation'));
const AgentDashboard = lazy(() => import('./pages/agent-dashboard'));
const ManagerDashboard = lazy(() => import('./pages/manager-dashboard'));
const CustomerPortal = lazy(() => import('./pages/customer-portal'));
const ServiceDeskBlueprint = lazy(() => import('./pages/service-desk-blueprint'));
const MonitoringEvents = lazy(() => import('./pages/monitoring-events'));
const ReportsAnalytics = lazy(() => import('./pages/reports-analytics'));
const TicketDetails = lazy(() => import('./pages/ticket-details'));
const WorkflowBuilder = lazy(() => import('./pages/workflow-builder'));
const ApprovalQueueManager = lazy(() => import('./pages/approval-queue-manager'));
const WorkflowBuilderStudio = lazy(() => import('./pages/workflow-builder-studio'));
const TicketManagementCenter = lazy(() => import('./pages/ticket-management-center'));
const TicketWorkflowCrud = lazy(() => import('./pages/ticket-workflow-crud'));
const ReportingAndAnalyticsHub = lazy(() => import('./pages/reporting-and-analytics-hub'));
const AuditTrailAndComplianceViewer = lazy(() => import('./pages/audit-trail-and-compliance-viewer'));
const AssetRegistryAndTracking = lazy(() => import('./pages/asset-registry-and-tracking'));
const ManageAssets = lazy(() => import('./pages/manage-assets'));
const TicketChatbot = lazy(() => import('./pages/ticket-chatbot'));
const MyWorkDashboard = lazy(() => import('./pages/my-work-dashboard'));
const Login = lazy(() => import('./pages/login/Login'));
const AutomationManagement = lazy(() => import('./pages/automation-rules'));
const AdvancedAnalyticsHub = lazy(() => import('./pages/advanced-analytics'));
const SlaPolicies = lazy(() => import('./pages/sla-policies'));
const TicketSla = lazy(() => import('./pages/ticket-sla'));
const Priorities = lazy(() => import('./pages/priorities'));
const Escalations = lazy(() => import('./pages/escalations'));
const ServiceCatalogHub = lazy(() => import('./pages/service-catalog'));
const FulfillmentCenter = lazy(() => import('./pages/service-request-management/FulfillmentCenter'));
const ChangeManagement = lazy(() => import('./pages/change-management'));
const ChangeManagementDetails = lazy(() => import('./pages/change-management/details'));
const UserManagement = lazy(() => import('./pages/user-management/UserManagement'));
const IncidentManagementWorkflow = lazy(() => import('./pages/incident-management-workflow'));
const MaintenanceScheduling = lazy(() => import('./pages/maintenance-scheduling'));
const SearchResults = lazy(() => import('./pages/search-results'));
const KnowledgeBase = lazy(() => import('./pages/knowledge-base'));
const Problems = lazy(() => import('./pages/problems'));
const Settings = lazy(() => import('./pages/settings'));
const ScenarioValidationCenter = lazy(() => import('./pages/scenario-validation-center'));

const RouteFallback = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
      {t('loadingPage', 'Loading page...')}
    </div>
  );
};

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
          <Suspense fallback={<RouteFallback />}>
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
            <Route path="/maintenance-scheduling" element={<ProtectedRoute><MaintenanceScheduling /></ProtectedRoute>} />
            <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/scenario-validation-center" element={<ProtectedRoute><ScenarioValidationCenter /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </RouterRoutes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
