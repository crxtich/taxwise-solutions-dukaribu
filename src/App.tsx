import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public site
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import Clients from "./pages/Clients.tsx";
import ComplianceCheck from "./pages/ComplianceCheck.tsx";
import JobTracker from "./pages/JobTracker.tsx";
import Documents from "./pages/Documents.tsx";
import Training from "./pages/Training.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

// Staff Portal
import { StaffAuthProvider } from "./contexts/StaffAuthContext.tsx";
import StaffLogin from "./pages/staff-portal/Login.tsx";
import StaffDashboard from "./pages/staff-portal/Dashboard.tsx";
import StaffJobs from "./pages/staff-portal/Jobs.tsx";
import StaffJobDetail from "./pages/staff-portal/JobDetail.tsx";
import StaffClients from "./pages/staff-portal/Clients.tsx";
import StaffClientDetail from "./pages/staff-portal/ClientDetail.tsx";
import StaffDocuments from "./pages/staff-portal/Documents.tsx";
import StaffManagement from "./pages/staff-portal/StaffManagement.tsx";

// Client Portal
import { ClientAuthProvider } from "./contexts/ClientAuthContext.tsx";
import ClientLogin from "./pages/client-portal/Login.tsx";
import ClientDashboard from "./pages/client-portal/Dashboard.tsx";
import ClientJobs from "./pages/client-portal/Jobs.tsx";
import ClientJobDetail from "./pages/client-portal/JobDetail.tsx";
import ClientDocuments from "./pages/client-portal/Documents.tsx";
import ClientDrive from "./pages/client-portal/Drive.tsx";
import ClientDriveCallback from "./pages/client-portal/DriveCallback.tsx";
import ClientNotifications from "./pages/client-portal/Notifications.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/compliance-check" element={<ComplianceCheck />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/training" element={<Training />} />
          <Route path="/contact" element={<Contact />} />

          {/* Staff Portal */}
          <Route
            path="/staff-portal/*"
            element={
              <StaffAuthProvider>
                <Routes>
                  <Route path="login" element={<StaffLogin />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="jobs" element={<StaffJobs />} />
                  <Route path="jobs/:id" element={<StaffJobDetail />} />
                  <Route path="clients" element={<StaffClients />} />
                  <Route path="clients/:id" element={<StaffClientDetail />} />
                  <Route path="documents" element={<StaffDocuments />} />
                  <Route path="staff" element={<StaffManagement />} />
                </Routes>
              </StaffAuthProvider>
            }
          />

          {/* Client Portal */}
          <Route
            path="/client-portal/*"
            element={
              <ClientAuthProvider>
                <Routes>
                  <Route path="login" element={<ClientLogin />} />
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="jobs" element={<ClientJobs />} />
                  <Route path="jobs/:id" element={<ClientJobDetail />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  <Route path="drive" element={<ClientDrive />} />
                  <Route path="drive/callback" element={<ClientDriveCallback />} />
                  <Route path="notifications" element={<ClientNotifications />} />
                </Routes>
              </ClientAuthProvider>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
